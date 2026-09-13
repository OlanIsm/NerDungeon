export type AuthFormState = { error: string | null; email?: string };

export function validateCredentials(formData: FormData) {
  const rawEmail = formData.get("email");
  const password = formData.get("password");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email address.", email: email.slice(0, 254) };
  }
  if (typeof password !== "string" || !password.length || password.length > 1024) {
    return { ok: false as const, error: "Enter your password (up to 1,024 characters).", email };
  }
  return { ok: true as const, email, password };
}
