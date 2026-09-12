import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        Your study space
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        A place for your material and the progress you make with it.
      </p>
      <section
        aria-labelledby="empty-heading"
        className="mt-10 rounded-xl border border-line bg-surface px-6 py-10 sm:p-12"
      >
        <h2 id="empty-heading" className="font-display text-2xl sm:text-3xl">
          The first chapter is still ahead.
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          This dashboard is a preview. Adding study material and starting a learning
          adventure will be available in a future update.
        </p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent underline hover:text-accent-hover">
          Back to home
        </Link>
      </section>
    </div>
  );
}
