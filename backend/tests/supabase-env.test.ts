import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getSupabaseConfig } from "../src/lib/supabase/env.ts";

const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
let original: (string | undefined)[];

beforeEach(() => {
  original = names.map((name) => process.env[name]);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test_only";
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

afterEach(() => {
  names.forEach((name, index) => {
    if (original[index] === undefined) delete process.env[name];
    else process.env[name] = original[index];
  });
});

test("reads configured values and trims surrounding whitespace", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = " https://example.supabase.co ";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = " sb_publishable_test_only ";
  assert.deepEqual(getSupabaseConfig(), {
    url: "https://example.supabase.co",
    key: "sb_publishable_test_only",
  });
});

for (const name of names.slice(0, 2)) {
  test(`reports missing ${name} only when configuration is requested`, () => {
    delete process.env[name];
    assert.throws(getSupabaseConfig, /Supabase is not configured/);
  });

  test(`rejects whitespace-only ${name}`, () => {
    process.env[name] = "   ";
    assert.throws(getSupabaseConfig, /Supabase is not configured/);
  });
}

test("rejects malformed, non-HTTP, and credential-bearing URLs", () => {
  for (const url of ["not-a-url", "ftp://example.com", "https://user:password@example.com", "https://example.com/path", "https://example.com?secret=x"]) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    assert.throws(getSupabaseConfig, /NEXT_PUBLIC_SUPABASE_URL must be/);
  }
});

test("allows a local HTTP Supabase URL", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
  assert.equal(getSupabaseConfig().url, "http://127.0.0.1:54321");
});

test("rejects secret, legacy, placeholder, and empty-prefix keys without echoing them", () => {
  for (const key of ["sb_secret_test_only", "eyJ_test_only", "your-key", "sb_publishable_"]) {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
    assert.throws(getSupabaseConfig, (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /must be an sb_publishable_/);
      if (key !== "sb_publishable_") assert.ok(!error.message.includes(key));
      return true;
    });
  }
});

function localKey(role: string, alg = "HS256") {
  return [JSON.stringify({ alg, typ: "JWT" }), JSON.stringify({ role }), "test-signature"]
    .map((part) => Buffer.from(part).toString("base64url")).join(".");
}

test("supports local anon JWTs on exact loopback hosts, including a local production build", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = localKey("anon");
  for (const host of ["127.0.0.1", "localhost", "[::1]"]) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = `http://${host}:54321`;
    assert.equal(getSupabaseConfig().key, localKey("anon"));
  }
});

test("rejects anon JWTs for hosted URLs and lookalike loopback domains", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = localKey("anon");
  for (const host of ["example.supabase.co", "localhost.example.com", "127.0.0.1.example.com"]) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${host}`;
    assert.throws(getSupabaseConfig, /only for local loopback/);
  }
});

test("rejects service role, unsigned, and malformed local keys", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
  for (const key of [localKey("service_role"), localKey("authenticated"), localKey("anon", "none"), "sb_secret_test_only", "broken.jwt.value"]) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;
    assert.throws(getSupabaseConfig, /must be a local HS256 JWT with role anon/);
  }
});

test("does not downgrade invalid publishable configuration to a local anon key", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = localKey("anon");
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_test_only";
  assert.throws(getSupabaseConfig, /must be an sb_publishable_/);
});

test("requires HTTPS for hosted Supabase even with a publishable key", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://example.supabase.co";
  assert.throws(getSupabaseConfig, /requires an HTTPS URL/);
});
