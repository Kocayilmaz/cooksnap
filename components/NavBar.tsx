"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/profile", label: "Profil" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center gap-6 border-b border-surface-border bg-surface-card px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              active
                ? "text-brand-orange"
                : "text-surface-text-muted hover:text-brand-orange dark:text-zinc-400"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
