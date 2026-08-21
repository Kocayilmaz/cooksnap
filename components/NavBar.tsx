"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, type LucideIcon } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { signOutUser } from "@/lib/firebase/auth";

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

const AUTHENTICATED_LINKS: NavLink[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/favorites", label: "Favoriler" },
  { href: "/profile", label: "Profil", icon: User },
];

// Misafir modunda (bkz. AuthGate) sadece ana sayfaya erişim var — Favoriler
// ve Profil girişe özel olduğu için tıklanınca zaten /login'e geri atılır,
// o yüzden burada da gösterilmiyor.
const GUEST_LINKS: NavLink[] = [{ href: "/", label: "Ana Sayfa" }];

export default function NavBar() {
  const pathname = usePathname();
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";
  const links = isAuthenticated ? AUTHENTICATED_LINKS : GUEST_LINKS;

  return (
    <nav className="flex items-center justify-center gap-6 border-b border-surface-border bg-surface-card px-4 py-3">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
              active
                ? "text-brand-orange"
                : "text-surface-text-muted hover:text-brand-orange"
            }`}
          >
            {Icon && <Icon size={18} aria-hidden="true" />}
            {link.label}
          </Link>
        );
      })}

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => signOutUser()}
          className="text-sm font-bold text-surface-text-muted transition-colors hover:text-brand-orange"
        >
          Çıkış yap
        </button>
      ) : (
        <Link
          href="/login"
          aria-current={pathname === "/login" ? "page" : undefined}
          className={`text-sm font-bold transition-colors ${
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
