"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { signOutUser } from "@/lib/firebase/auth";
import DefaultAvatar from "@/components/DefaultAvatar";

const AUTHENTICATED_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/favorites", label: "Favoriler" },
  { href: "/profile", label: "Profil" },
];

// Misafir modunda (bkz. AuthGate) sadece ana sayfaya erişim var — Favoriler
// ve Profil girişe özel olduğu için tıklanınca zaten /login'e geri atılır,
// o yüzden burada da gösterilmiyor.
const GUEST_LINKS = [{ href: "/", label: "Ana Sayfa" }];

export default function NavBar() {
  const pathname = usePathname();
  const { status, email, photoURL } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";
  const links = isAuthenticated ? AUTHENTICATED_LINKS : GUEST_LINKS;

  return (
    <nav className="flex items-center justify-center gap-6 border-b border-surface-border bg-surface-card px-4 py-3">
      {links.map((link) => {
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

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          {photoURL ? (
            <Image
              src={photoURL}
              alt=""
              width={24}
              height={24}
              className="rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <DefaultAvatar size={24} />
          )}
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
