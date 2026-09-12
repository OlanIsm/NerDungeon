import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSupabaseConfig } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  let configured = true;
  try { getSupabaseConfig(); } catch { configured = false; }
  const result = configured ? await getCurrentUser() : { status: "unavailable" };
  if (result.status === "authenticated") redirect("/dashboard");
  const { error } = await searchParams;
  const initialError = !configured
    ? "Sign-in is currently unavailable. Please try again later."
    : result.status === "unavailable" || error === "unavailable"
      ? "We couldn’t reach the hall. Please try signing in again shortly." : null;

  return (
    <div className="dungeon-panel mx-auto grid max-w-3xl md:grid-cols-[240px_1fr]">
      <Image
        src="/art/dungeon-gate.webp" alt="" width={1086} height={1448}
        sizes="(max-width: 767px) 100vw, 240px"
        className="h-36 w-full object-cover object-[center_60%] md:h-full"
      />
      <div className="min-w-0 p-6 sm:p-8">
        <h1 className="font-display text-3xl text-accent sm:text-4xl">Enter the hall</h1>
        <p className="mt-3 leading-relaxed text-muted">Sign in to your Nerdungeon account.</p>
        <LoginForm configured={configured} initialError={initialError} />
      </div>
    </div>
  );
}
