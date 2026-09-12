"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold hover:bg-soft aria-[current=page]:bg-soft aria-[current=page]:underline"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
