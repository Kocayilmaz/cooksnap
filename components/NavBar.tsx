"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, User, Search, type LucideIcon } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { signOutUser } from "@/lib/firebase/auth";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const AUTHENTICATED_LINKS: NavLink[] = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/favorites", label: "Favoriler", icon: Heart },
];

// Misafir modunda (bkz. AuthGate) sadece ana sayfaya erişim var — Favoriler
// ve Hesabım girişe özel olduğu için tıklanınca zaten /login'e geri atılır,
// o yüzden burada da gösterilmiyor.
const GUEST_LINKS: NavLink[] = [{ href: "/", label: "Ana Sayfa", icon: Home }];

export default function NavBar() {
  const pathname = usePathname();
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";
  const links = isAuthenticated ? AUTHENTICATED_LINKS : GUEST_LINKS;
  const isAccountActive = pathname === "/profile";

  return (
    <nav className="flex items-center justify-between border-b border-surface-border bg-surface-card px-4 py-3">
      <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="CookSnap" width={168} height={50} priority />
      </Link>

      {/* Şimdilik sadece görsel — arama davranışı (geçmiş/favorilerde mi, yeni AI
          tarifi mi üretecek) henüz kararlaştırılmadı, ayrı bir adımda eklenecek. */}
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="mx-4 flex w-full max-w-md flex-1 items-center"
      >
        <div className="relative w-full">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-text-muted"
          />
          <input
            type="search"
            placeholder="Tarif, malzeme ara"
            aria-label="Tarif, malzeme ara"
            className="w-full rounded-full border border-surface-border bg-surface-warm py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </form>

      <div className="flex items-center gap-6">
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
              <Icon size={18} aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}

        {isAuthenticated ? (
          <div className="group relative">
            <span
              className={`flex cursor-default items-center gap-1.5 text-sm font-bold transition-colors ${
                isAccountActive ? "text-brand-orange" : "text-surface-text-muted group-hover:text-brand-orange"
              }`}
            >
              <User size={18} aria-hidden="true" />
              Hesabım
            </span>

            {/* Şimdilik sadece iki seçenek — üzerine gelince açılır, tıklamanın kendisi bir şey yapmaz. */}
            <div className="invisible absolute right-0 top-full z-10 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
              <div className="w-44 rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-md">
                <Link
                  href="/profile"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
                >
                  Kullanıcı bilgilerim
                </Link>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
                >
                  Çıkış yap
                </button>
              </div>
            </div>
          </div>
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
      </div>
    </nav>
  );
}
