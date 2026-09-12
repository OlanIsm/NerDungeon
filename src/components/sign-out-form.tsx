"use client";

import { useActionState } from "react";
import { signOut } from "@/app/auth-actions";

export function SignOutForm() {
  const [state, formAction, pending] = useActionState(signOut, { error: null });
  return (
    <form action={formAction} aria-busy={pending}>
      <button type="submit" className="game-button" disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      <div aria-live="polite" aria-atomic="true">
        {state.error && <p className="mt-3 max-w-sm text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}
