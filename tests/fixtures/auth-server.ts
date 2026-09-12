// Protocol fixture for the real Supabase SDK. It is NOT a Supabase deployment.
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export const fixtureUser = {
  id: "11111111-1111-4111-8111-111111111111", email: "learner@example.test",
  aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

export function fixtureJwt(role: string, exp: number) {
  return [JSON.stringify({ alg: "HS256", typ: "JWT" }),
    JSON.stringify({ sub: fixtureUser.id, role, exp }), "fixture-signature-not-valid-cryptography"]
    .map((part) => Buffer.from(part).toString("base64url")).join(".");
}

export function fixtureSession(expired = false) {
  const expiresAt = Math.floor(Date.now() / 1000) + (expired ? -60 : 3600);
  return {
    access_token: fixtureJwt("authenticated", expiresAt), refresh_token: "fixture-refresh",
    expires_in: 3600, expires_at: expiresAt, token_type: "bearer", user: fixtureUser,
  };
}

export function fixtureCookie(session = fixtureSession()) {
  return `sb-127-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}

export async function startAuthFixture(options: { port?: number; controls?: boolean } = {}) {
  const state = { unavailable: false, refreshes: 0, logouts: 0, loginAttempts: 0, delayMs: 0, signOutFailure: false };
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("X-Supabase-Api-Version", "2024-01-01");
    // This endpoint exists only on the loopback fixture, never in the app.
    if (options.controls && request.url === "/__fixture/state") {
      let controlBody = "";
      for await (const chunk of request) controlBody += chunk;
      if (controlBody) Object.assign(state, JSON.parse(controlBody));
      response.end(JSON.stringify(state)); return;
    }
    if (state.delayMs) await new Promise((resolve) => setTimeout(resolve, state.delayMs));
    if (state.unavailable) {
      response.writeHead(503); response.end(JSON.stringify({ message: "Fixture unavailable" })); return;
    }
    let body = "";
    for await (const chunk of request) body += chunk;
    const json = body ? JSON.parse(body) : {};
    if (request.url?.startsWith("/auth/v1/token")) {
      if (request.url.includes("grant_type=password")) {
        state.loginAttempts++;
        if (json.email !== fixtureUser.email || json.password !== "fixture-password") {
          response.writeHead(400); response.end(JSON.stringify({ code: "invalid_credentials", message: "Invalid credentials" })); return;
        }
      } else {
        state.refreshes++;
        if (json.refresh_token !== "fixture-refresh") {
          response.writeHead(400); response.end(JSON.stringify({ code: "refresh_token_not_found", message: "Invalid refresh token" })); return;
        }
      }
      response.end(JSON.stringify(fixtureSession())); return;
    }
    if (request.url === "/auth/v1/user") {
      const token = request.headers.authorization?.replace("Bearer ", "");
      try {
        const payload = JSON.parse(Buffer.from(token!.split(".")[1], "base64url").toString());
        if (token !== fixtureJwt("authenticated", payload.exp) || payload.exp <= Date.now() / 1000) throw new Error();
        response.end(JSON.stringify(fixtureUser)); return;
      } catch {
        response.writeHead(401); response.end(JSON.stringify({ code: "bad_jwt", message: "Invalid JWT" })); return;
      }
    }
    if (request.url?.startsWith("/auth/v1/logout")) {
      if (state.signOutFailure) {
        response.writeHead(503); response.end(JSON.stringify({ message: "Sign-out unavailable" })); return;
      }
      state.logouts++;
      response.writeHead(204); response.end(); return;
    }
    response.writeHead(404); response.end(JSON.stringify({ message: "Unknown fixture endpoint" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    anonKey: fixtureJwt("anon", 9999999999), state,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
