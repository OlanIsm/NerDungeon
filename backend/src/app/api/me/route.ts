import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { privateCacheControl } from "@/lib/supabase/proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCurrentUser();
  const headers = { "Cache-Control": privateCacheControl };
  if (result.status !== "authenticated") {
    return NextResponse.json(
      { error: result.status === "anonymous" ? "unauthenticated" : "auth_unavailable" },
      { status: result.status === "anonymous" ? 401 : 503, headers },
    );
  }
  return NextResponse.json({ user: result.user, entitlements: null }, { headers });
}
