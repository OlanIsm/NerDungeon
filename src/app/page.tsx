import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-6xl">
        Your next adventure starts with what you learn.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Nerdungeon is being built to turn your own study material into a learning
        adventure. Practice what you know, understand your mistakes, and come back
        with more confidence.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-surface hover:bg-accent-hover"
      >
        Preview dashboard
      </Link>
      <section aria-labelledby="preview-heading" className="mt-14 border-t border-line pt-8 sm:mt-20">
        <h2 id="preview-heading" className="text-xl font-semibold">
          A small beginning
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          This is an early preview of your study space. Learning features are still
          being built; for now, you can take a look around.
        </p>
      </section>
    </div>
  );
}
