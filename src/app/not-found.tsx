import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl leading-tight">This page isn’t here.</h1>
      <p className="mt-4 leading-relaxed text-muted">
        The address may be incorrect. Head back to the home page to find your way.
      </p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent underline hover:text-accent-hover">
        Back to home
      </Link>
    </div>
  );
}
