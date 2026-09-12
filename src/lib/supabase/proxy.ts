import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server.js";
import { getSupabaseConfig } from "./env.ts";
import { resolveUser, type UserResult } from "../auth/user.ts";

export const privateCacheControl = "private, no-cache, no-store, must-revalidate, max-age=0";

export async function updateSession(request: NextRequest) {
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const authHeaders: Record<string, string> = {};
  let result: UserResult;

  try {
    const { url, key } = getSupabaseConfig();
    const supabase = createServerClient(url, key, {
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          // Forward the refreshed tokens into this render, as well as the browser.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          pendingCookies.push(...cookiesToSet);
          Object.assign(authHeaders, headers);
        },
      },
    });
    result = await resolveUser(supabase);
  } catch {
    result = { status: "unavailable" };
  }

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  let response: NextResponse;
  if (pathname === "/api/me" && result.status !== "authenticated") {
    response = NextResponse.json(
      { error: result.status === "anonymous" ? "unauthenticated" : "auth_unavailable" },
      { status: result.status === "anonymous" ? 401 : 503 },
    );
  } else if (isDashboard && result.status !== "authenticated") {
    const target = new URL("/login", request.url);
    if (result.status === "unavailable") target.searchParams.set("error", "unavailable");
    // POST must become GET: never forward a submitted action body to the login page.
    response = NextResponse.redirect(target, 303);
  } else if (pathname === "/login" && request.method === "GET" && result.status === "authenticated") {
    response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  } else {
    response = NextResponse.next({ request });
  }

  // Apply every cookie/header to the final response, including redirects and errors.
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(authHeaders).forEach(([name, value]) => response.headers.set(name, value));
  response.headers.set("Cache-Control", privateCacheControl);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
