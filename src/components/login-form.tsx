"use client";

import { useActionState } from "react";
import { signIn } from "@/app/auth-actions";
import type { AuthFormState } from "@/lib/auth/validation";

export function LoginForm({ configured, initialError }: { configured: boolean; initialError: string | null }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, { error: null });
  const error = state.error ?? initialError;

  return (
    <form action={formAction} className="mt-7" aria-busy={pending}>
      <fieldset disabled={!configured || pending} className="min-w-0 space-y-5">
        <legend className="sr-only">Sign in with email and password</legend>
        <div>
          <label htmlFor="email" className="mb-2 block font-semibold">Email address</label>
          <input
            id="email" name="email" type="email" autoComplete="username"
            autoCapitalize="none" spellCheck={false} required maxLength={254}
            defaultValue={state.email ?? ""} aria-describedby={error ? "login-error" : undefined}
            className="min-h-12 w-full min-w-0 border border-muted bg-paper px-3 py-3 text-base text-ink disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block font-semibold">Password</label>
          <input
            id="password" name="password" type="password" autoComplete="current-password"
            required maxLength={1024} aria-describedby={error ? "login-error" : undefined}
            className="min-h-12 w-full min-w-0 border border-muted bg-paper px-3 py-3 text-base text-ink disabled:opacity-60"
          />
        </div>
        <button type="submit" className="game-button w-full" disabled={!configured || pending}>
          {pending ? "Signing in…" : "Sign in & enter the hall"}
        </button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {error && <p id="login-error" className="mt-4 text-sm leading-relaxed text-danger">{error}</p>}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Use the account provided for this early version. Need access? Contact the Nerdungeon team.
      </p>
    </form>
  );
}
