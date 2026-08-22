"use client";

import Link from "next/link";
import { MessageCircle, Clock, Star } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";
import { FloatingFoodHero } from "@/components/ui/hero-section-7";

const RECENT_PREVIEW_COUNT = 3;

/** Ev yemeği fotoğrafları (public/ altına elle eklendi) — hepsi gerçek
 * şeffaf PNG (piksel piksel kontrol edildi), maskeye gerek yok. */
const HERO_IMAGES = [
  {
    src: "/sis-kebap.png",
    alt: "Şiş kebap",
    width: 869,
    height: 977,
    className: "hidden sm:block sm:w-28 sm:top-4 sm:left-6 lg:w-44 lg:top-12 lg:left-16 animate-float",
  },
  {
    src: "/domates-soslu-makarna.png",
    alt: "Domates soslu makarna",
    width: 1000,
    height: 800,
    className: "hidden sm:block sm:w-24 sm:top-6 sm:right-11 lg:w-40 lg:top-12 lg:right-28 animate-float-delayed",
  },
  {
    src: "/yumurtali-kahvalti.png",
    alt: "Yumurtalı kahvaltı tabağı",
    width: 1000,
    height: 787,
    className: "hidden sm:block sm:w-24 sm:bottom-4 sm:right-14 lg:w-40 lg:bottom-8 lg:right-72 animate-float",
  },
  {
    src: "/sebzeli-corba.png",
    alt: "Sebzeli çorba",
    width: 360,
    height: 360,
    className: "hidden lg:block lg:w-28 lg:top-4 lg:left-64 animate-float-delayed",
  },
  {
    src: "/frambuazli-cheesecake.png",
    alt: "Frambuazlı cheesecake",
    width: 800,
    height: 631,
    className: "hidden w-28 top-48 right-4 sm:block animate-float",
  },
  {
    src: "/pizza-dilimi.png",
    alt: "Pizza dilimi",
    width: 647,
    height: 787,
    className: "hidden sm:block sm:w-24 sm:bottom-1 sm:left-9 lg:w-40 lg:bottom-1 lg:left-28 animate-float-delayed",
  },
  {
    src: "/yaprak-1.png",
    alt: "Yaprak",
    width: 600,
    height: 600,
    className: "hidden lg:block lg:w-10 lg:top-24 lg:left-88 animate-float",
  },
  {
    src: "/yaprak-2.png",
    alt: "Yaprak",
    width: 500,
    height: 877,
    className: "hidden lg:block lg:w-10 lg:top-64 lg:left-72 animate-float-delayed",
  },
  {
    src: "/yaprak-3.png",
    alt: "Yaprak",
    width: 2953,
    height: 2953,
    className: "hidden lg:block lg:w-10 lg:top-24 lg:right-16 animate-float",
  },
  {
    src: "/domates.png",
    alt: "Domates",
    width: 2362,
    height: 2362,
    className: "hidden lg:block lg:w-14 lg:bottom-8 lg:left-80 animate-float-delayed",
  },
  {
    src: "/nane.png",
    alt: "Nane",
    width: 1183,
    height: 1063,
    className: "hidden lg:block lg:w-12 lg:bottom-24 lg:left-88 animate-float",
  },
  {
    src: "/cilek.png",
    alt: "Çilek",
    width: 1600,
    height: 1548,
    className: "hidden lg:block lg:w-12 lg:bottom-8 lg:right-32 animate-float-delayed",
  },
  {
    src: "/yaban-mersini.png",
    alt: "Yaban mersini",
    width: 626,
    height: 500,
    className: "hidden lg:block lg:w-10 lg:bottom-24 lg:right-32 animate-float",
  },
  {
    src: "/yaprak-1.png",
    alt: "Yaprak",
    width: 600,
    height: 600,
    className: "hidden lg:block lg:w-8 lg:top-4 lg:left-96 animate-float-delayed",
  },
  {
    src: "/domates.png",
    alt: "Domates",
    width: 2362,
    height: 2362,
    className: "hidden lg:block lg:w-12 lg:top-20 lg:right-72 animate-float",
  },
  {
    src: "/nane.png",
    alt: "Nane",
    width: 1183,
    height: 1063,
    className: "hidden lg:block lg:w-8 lg:bottom-8 lg:right-56 animate-float-delayed",
  },
];

export default function HomeWelcomeSection() {
  const isLoggedIn = useAppSelector((state) => state.auth.status === "authenticated");
  const storedName = useAppSelector((state) => state.userProfile.name);
  const name = isLoggedIn ? storedName : "";
  const history = useAppSelector((state) => state.history);
  const favorites = useAppSelector((state) => state.favorites);

  const recentHistory = history.slice(0, RECENT_PREVIEW_COUNT);
  const recentFavorites = Object.values(favorites)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, RECENT_PREVIEW_COUNT);

  return (
    <main className="flex flex-col gap-6">
      <FloatingFoodHero
        title="CookSnap"
        description={`${name ? `Merhaba, ${name}!` : "Merhaba!"} Dolabındaki malzemelerin fotoğrafını çek, öğrenci/ev yemeği/aşçı modundan birini seç, AI saniyeler içinde tarifini çıkarsın.`}
        images={HERO_IMAGES}
      >
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-red transition-colors hover:bg-white/90"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Sohbete Başla
        </Link>
      </FloatingFoodHero>

      {recentHistory.length > 0 && (
        <section className="flex flex-col gap-2 rounded-2xl bg-surface-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock size={16} aria-hidden="true" />
              Son aramaların
            </span>
            <Link href="/chat" className="text-xs text-surface-text-muted hover:text-brand-orange">
              Tümünü gör
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recentHistory.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-surface-border px-3 py-2 text-xs text-surface-text-muted"
              >
                <span className="text-foreground">
                  {entry.recipeTitles.length > 0
                    ? entry.recipeTitles.join(", ")
                    : `${entry.equipment.map((key) => EQUIPMENT_LABELS[key]).join(", ")} · ${entry.personCount} kişilik`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recentFavorites.length > 0 && (
        <section className="flex flex-col gap-2 rounded-2xl bg-surface-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Star size={16} aria-hidden="true" />
              Favori tariflerin
            </span>
            <Link href="/favorites" className="text-xs text-surface-text-muted hover:text-brand-orange">
              Tümünü gör
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recentFavorites.map((recipe) => (
              <li
                key={recipe.id}
                className="rounded-lg border border-surface-border px-3 py-2 text-xs text-surface-text-muted"
              >
                <span className="text-foreground">{recipe.title}</span>
                <span className="ml-2">{EQUIPMENT_LABELS[recipe.equipment]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
