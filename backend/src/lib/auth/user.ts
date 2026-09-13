import type { SupabaseClient } from "@supabase/supabase-js";

export type UserResult =
  | { status: "authenticated"; user: { id: string; email: string | null } }
  | { status: "anonymous" | "unavailable" };

/** getUser validates against Supabase Auth; cookie contents alone prove nothing. */
export async function resolveUser(client: SupabaseClient): Promise<UserResult> {
  try {
    const { data, error } = await client.auth.getUser();
    if (error) {
      return {
        status: error.status && [400, 401, 403, 404].includes(error.status)
          ? "anonymous" : "unavailable",
      };
    }
    if (!data.user) return { status: "anonymous" };
    return {
      status: "authenticated",
      user: { id: data.user.id, email: data.user.email ?? null },
    };
  } catch {
    return { status: "unavailable" };
  }
}
