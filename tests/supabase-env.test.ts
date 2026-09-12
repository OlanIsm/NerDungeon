import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getSupabaseConfig } from "../src/lib/supabase/env.ts";

const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as const;
let original: (string | undefined)[];

beforeEach(() => {
  original = names.map((name) => process.env[name]);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test_only";
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
    publishableKey: "sb_publishable_test_only",
  });
});

for (const name of names) {
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
  for (const url of ["not-a-url", "ftp://example.com", "https://user:password@example.com"]) {
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
