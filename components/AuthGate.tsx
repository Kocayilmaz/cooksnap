"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import NavBar from "./NavBar";
import LoadingSpinner from "./LoadingSpinner";

const AUTH_ONLY_ROUTES = ["/profile", "/favorites"];

/**
 * Site genelinde erişim kapısı: giriş yapılmadan (veya "Şimdilik atla" ile
 * misafir moduna geçilmeden) /login dışındaki hiçbir sayfa açılmaz. Misafir
 * modu Anasayfa (/) ve Chat'e (/chat) izin verir — profil ve favoriler
 * girişe özel (bkz. AGENTS.md "Erişim kapısı" notu).
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authStatus = useAppSelector((state) => state.auth.status);
  const isGuest = useAppSelector((state) => state.guestMode.isGuest);

  const isLoggedIn = authStatus === "authenticated";
  const isKnown = authStatus !== "loading";
  const requiresAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!isKnown) return;

    if (isLoginRoute) {
      if (isLoggedIn) router.replace("/");
      return;
    }

    if (requiresAuthOnly) {
      if (!isLoggedIn) router.replace("/login");
      return;
    }

    if (!isLoggedIn && !isGuest) {
      router.replace("/login");
    }
  }, [isKnown, isLoggedIn, isGuest, isLoginRoute, requiresAuthOnly, router]);

  if (!isKnown) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (isLoginRoute) {
    return isLoggedIn ? null : <>{children}</>;
  }

  if (requiresAuthOnly && !isLoggedIn) {
    return null;
  }

  if (!isLoggedIn && !isGuest) {
    return null;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
