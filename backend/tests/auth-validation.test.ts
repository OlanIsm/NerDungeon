import assert from "node:assert/strict";
import { test } from "node:test";
import { validateCredentials } from "../src/lib/auth/validation.ts";

test("trims email without altering password whitespace", () => {
  const form = new FormData();
  form.set("email", " learner@example.test ");
  form.set("password", " keep these spaces ");
  assert.deepEqual(validateCredentials(form), {
    ok: true, email: "learner@example.test", password: " keep these spaces ",
  });
});

test("rejects missing, malformed, and excessively large credentials", () => {
  for (const [email, password] of [
    ["", ""], ["invalid", "password"], ["a".repeat(255) + "@example.test", "password"],
    ["learner@example.test", ""], ["learner@example.test", "p".repeat(1025)],
  ]) {
    const form = new FormData();
    form.set("email", email); form.set("password", password);
    const result = validateCredentials(form);
    assert.equal(result.ok, false);
    assert.ok(!("password" in result), "Never return a password on failure");
  }
});

test("rejects uploaded files instead of treating them as strings", () => {
  const form = new FormData();
  form.set("email", "learner@example.test");
  form.set("password", new Blob(["not a password"]), "password.txt");
  assert.equal(validateCredentials(form).ok, false);
});
