import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveUser, type UserResult } from "./user";

// React cache deduplicates verification within a render, never across users.
export const getCurrentUser = cache(async (): Promise<UserResult> => {
  // Opt out of prerendering outside the error handler; never catch Next's
  // dynamic-rendering signal and accidentally cache a signed-out response.
  await connection();
  try {
    return await resolveUser(await createClient());
  } catch {
    return { status: "unavailable" };
  }
});

export async function requireUser() {
  const result = await getCurrentUser();
  if (result.status !== "authenticated") {
    redirect(result.status === "unavailable" ? "/login?error=unavailable" : "/login");
  }
  return result.user;
}
