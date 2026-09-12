/** Read lazily so the foundation can run and build without a Supabase project. */
export function getSupabaseConfig() {
  // Keep direct accesses: Next.js inlines NEXT_PUBLIC_* values in browser bundles.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local or your deployment environment.",
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }

  if (
    !["https:", "http:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be an HTTP or HTTPS URL without embedded credentials.");
  }

  if (!publishableKey.startsWith("sb_publishable_") || publishableKey === "sb_publishable_") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be an sb_publishable_... key. Secret and legacy keys are not supported in this public setting.",
    );
  }

  return { url, publishableKey };
}
