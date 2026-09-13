import assert from "node:assert/strict";
import { before, after, beforeEach, test } from "node:test";
import { NextRequest } from "next/server.js";
import { updateSession } from "../src/lib/supabase/proxy.ts";
import { startAuthFixture, fixtureCookie, fixtureSession } from "./fixtures/auth-server.ts";

let fixture: Awaited<ReturnType<typeof startAuthFixture>>;
const envNames = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const original = envNames.map((name) => process.env[name]);

before(async () => { fixture = await startAuthFixture(); });
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = fixture.url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fixture.anonKey;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  fixture.state.unavailable = false;
  fixture.state.refreshes = 0;
});
after(async () => {
  await fixture.close();
  envNames.forEach((name, i) => {
    if (original[i] === undefined) delete process.env[name]; else process.env[name] = original[i];
  });
});

function request(path: string, cookie?: string, method = "GET") {
  return new NextRequest(`http://localhost:3000${path}`, {
    method, headers: cookie ? { cookie } : undefined,
  });
}

test("anonymous requests cannot read dashboard, nested routes, or current-user API", async () => {
  for (const path of ["/dashboard", "/dashboard/private"]) {
    const response = await updateSession(request(path));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "http://localhost:3000/login");
    assert.match(response.headers.get("cache-control")!, /private.*no-store/);
  }
  const response = await updateSession(request("/api/me"));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "unauthenticated" });
});

test("valid sessions pass and authenticated login visits redirect to the hall", async () => {
  const allowed = await updateSession(request("/dashboard", fixtureCookie()));
  assert.equal(allowed.headers.get("x-middleware-next"), "1");
  const redirected = await updateSession(request("/login?next=https://evil.example", fixtureCookie()));
  assert.equal(redirected.headers.get("location"), "http://localhost:3000/dashboard");
});

test("forged cookie user data and invalid access tokens cannot authorize a request", async () => {
  const session = fixtureSession();
  session.access_token = "forged.token.value";
  const response = await updateSession(request("/api/me", fixtureCookie(session)));
  assert.equal(response.status, 401);
});

test("refresh reaches both the current request and browser; the next request stays signed in", async () => {
  const currentRequest = request("/dashboard", fixtureCookie(fixtureSession(true)));
  const response = await updateSession(currentRequest);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(fixture.state.refreshes, 1);
  const updated = response.cookies.get("sb-127-auth-token")!;
  assert.ok(updated?.value.startsWith("base64-"));
  assert.equal(currentRequest.cookies.get(updated.name)?.value, updated.value);
  assert.match(response.headers.get("x-middleware-request-cookie")!, /sb-127-auth-token=base64-/);
  assert.match(response.headers.get("cache-control")!, /private.*no-store/);
  assert.equal(response.headers.get("expires"), "0");
  const next = await updateSession(request("/dashboard", `${updated.name}=${updated.value}`));
  assert.equal(next.headers.get("x-middleware-next"), "1");
  assert.equal(fixture.state.refreshes, 1);
});

test("refresh cookies and cache headers survive login redirects", async () => {
  const response = await updateSession(request("/login", fixtureCookie(fixtureSession(true))));
  assert.equal(response.status, 303);
  assert.ok(response.cookies.get("sb-127-auth-token"));
  assert.match(response.headers.get("cache-control")!, /no-store/);
});

test("expired/revoked refresh tokens clear the browser cookie and deny access", async () => {
  const session = fixtureSession(true);
  session.refresh_token = "revoked-refresh";
  const response = await updateSession(request("/dashboard", fixtureCookie(session)));
  assert.equal(response.headers.get("location"), "http://localhost:3000/login");
  assert.equal(response.cookies.get("sb-127-auth-token")?.maxAge, 0);
});

test("auth outages fail closed with 503 instead of pretending the user is anonymous", async () => {
  fixture.state.unavailable = true;
  const response = await updateSession(request("/api/me", fixtureCookie()));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "auth_unavailable" });
  assert.equal(response.cookies.getAll().length, 0);
});

test("configuration failures keep login renderable but never expose protected routes", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal((await updateSession(request("/login"))).headers.get("x-middleware-next"), "1");
  assert.equal((await updateSession(request("/api/me"))).status, 503);
  const redirect = await updateSession(request("/dashboard", undefined, "POST"));
  assert.equal(redirect.status, 303);
  assert.equal(redirect.headers.get("location"), "http://localhost:3000/login?error=unavailable");
});
