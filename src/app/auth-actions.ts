"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/server";
import { validateCredentials, type AuthFormState } from "@/lib/auth/validation";

export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const input = validateCredentials(formData);
  if (!input.ok) return { error: input.error, email: input.email };

  try {
    const supabase = await createActionClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user || !data.session) {
      const message = error?.status === 429
        ? "Too many attempts. Wait a moment before trying again."
        : error && (!error.status || error.status >= 500)
          ? "Sign-in is temporarily unavailable. Please try again shortly."
          : "We couldn’t sign you in. Check your email and password, and make sure your account is confirmed.";
      return { error: message, email: input.email };
    }
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly.", email: input.email };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<AuthFormState> {
  try {
    const supabase = await createActionClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "We couldn’t sign you out. Please try again." };
  } catch {
    return { error: "Sign-out is temporarily unavailable. Please try again shortly." };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
