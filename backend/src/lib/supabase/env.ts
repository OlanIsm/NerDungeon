export class SupabaseConfigurationError extends Error {}

/** Configuration checks are not a replacement for Supabase's key verification. */
export function getSupabaseConfig() {
  // Keep direct accesses: Next.js inlines NEXT_PUBLIC_* values in browser bundles.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || (!publishableKey && !anonKey)) {
    throw new SupabaseConfigurationError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY for a local loopback instance.",
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new SupabaseConfigurationError("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }

  if (
    !["https:", "http:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password || parsedUrl.search || parsedUrl.hash || parsedUrl.pathname !== "/"
  ) {
    throw new SupabaseConfigurationError("NEXT_PUBLIC_SUPABASE_URL must be an HTTP or HTTPS origin without credentials, paths, queries, or fragments.");
  }

  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
  if (!isLoopback && parsedUrl.protocol !== "https:") {
    throw new SupabaseConfigurationError("Hosted Supabase requires an HTTPS URL.");
  }

  // An explicitly supplied publishable key always wins; never mask a typo by falling back.
  if (publishableKey) {
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
      throw new SupabaseConfigurationError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be an sb_publishable_... key.");
    }
    return { url: parsedUrl.origin, key: publishableKey };
  }

  if (!isLoopback) {
    throw new SupabaseConfigurationError("JWT anon keys are supported only for local loopback Supabase URLs. Use a publishable key for hosted Supabase.");
  }

  try {
    if (!anonKey || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(anonKey)) throw new Error();
    const [header, payload] = anonKey.split(".").slice(0, 2).map((part) =>
      JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))),
    );
    if (header.alg !== "HS256" || payload.role !== "anon") throw new Error();
  } catch {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be a local HS256 JWT with role anon. Secret and service-role keys are never allowed.",
    );
  }

  return { url: parsedUrl.origin, key: anonKey! };
}
