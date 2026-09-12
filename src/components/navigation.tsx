"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Adventurer’s Hall" },
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
          className="inline-flex min-h-11 items-center border border-transparent px-3 text-sm font-semibold hover:border-line hover:bg-soft aria-[current=page]:border-accent aria-[current=page]:text-accent aria-[current=page]:underline"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
