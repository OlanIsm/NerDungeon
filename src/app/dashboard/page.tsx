import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth/session";
import { SignOutForm } from "@/components/sign-out-form";

export const metadata: Metadata = {
  title: "Adventurer’s Hall",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-4xl leading-tight text-accent sm:text-5xl">
            Adventurer’s Hall
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Your study space between adventures.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted [overflow-wrap:anywhere]">
            Signed in as <span className="text-ink">{user.email ?? "Adventurer"}</span>
          </p>
        </div>
        <SignOutForm />
      </div>
      <section
        aria-labelledby="empty-heading"
        className="dungeon-panel mt-8 grid md:grid-cols-[220px_1fr]"
      >
        <Image
          src="/art/dungeon-gate.webp" alt="" width={1086} height={1448}
          sizes="(max-width: 767px) 100vw, 220px"
          className="h-40 w-full object-cover object-[center_65%] md:h-full"
        />
        <div className="p-6 sm:p-8">
          <h2 id="empty-heading" className="font-display text-2xl sm:text-3xl">
            The first chapter is still ahead.
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The hall is open, and your adventures are still being prepared. Adding
            study material and starting a learning adventure will be available in
            a future update.
          </p>
          <Link href="/" className="game-link mt-6">Back to home</Link>
        </div>
      </section>
    </div>
  );
}
