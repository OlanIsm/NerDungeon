import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nerdungeon — Learning comes first",
    template: "%s | Nerdungeon",
  },
  description:
    "An early preview of Nerdungeon, a learning adventure built around your own study material.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f5ef",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-50 -translate-y-24 rounded-lg bg-ink px-4 py-3 text-surface focus:translate-y-0"
        >
          Skip to content
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5 sm:px-8">
            <Link href="/" className="inline-flex min-h-11 items-center font-display text-2xl font-bold tracking-tight">
              Nerdungeon
            </Link>
            <Navigation />
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-20"
        >
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-3 px-5 py-6 text-sm text-muted sm:px-8">
            <p>Learning comes first.</p>
            <p>Early preview · Made for your own pace.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
