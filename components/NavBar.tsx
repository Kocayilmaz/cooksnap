"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { signOutUser } from "@/lib/firebase/auth";

const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/favorites", label: "Favoriler" },
  { href: "/profile", label: "Profil" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { status, email } = useAppSelector((state) => state.auth);

  return (
    <nav className="flex items-center justify-center gap-6 border-b border-surface-border bg-surface-card px-4 py-3">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`text-sm font-medium transition-colors ${
              active
                ? "text-brand-orange"
                : "text-surface-text-muted hover:text-brand-orange"
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      {status === "authenticated" ? (
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-surface-text-muted sm:inline">{email}</span>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="text-sm font-medium text-surface-text-muted transition-colors hover:text-brand-orange"
          >
            Çıkış yap
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          aria-current={pathname === "/login" ? "page" : undefined}
          className={`text-sm font-medium transition-colors ${
            pathname === "/login"
              ? "text-brand-orange"
              : "text-surface-text-muted hover:text-brand-orange"
          }`}
        >
          Giriş yap
        </Link>
      )}
    </nav>
  );
}
