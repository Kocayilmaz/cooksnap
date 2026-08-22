"use client";

import Link from "next/link";
import { MessageCircle, Clock, Star } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";

const RECENT_PREVIEW_COUNT = 3;

export default function HomeWelcomeSection() {
  const name = useAppSelector((state) => state.userProfile.name);
  const history = useAppSelector((state) => state.history);
  const favorites = useAppSelector((state) => state.favorites);

  const recentHistory = history.slice(0, RECENT_PREVIEW_COUNT);
  const recentFavorites = Object.values(favorites)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, RECENT_PREVIEW_COUNT);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-2xl bg-surface-card p-8 shadow-sm">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-red">CookSnap</h1>
        <p className="text-sm text-surface-text-muted">
          {name ? `Merhaba, ${name}!` : "Merhaba!"} Bugün ne pişirmek istersin?
        </p>
      </div>

      <Link
        href="/chat"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
      >
        <MessageCircle size={18} aria-hidden="true" />
        Sohbete Başla
      </Link>

      {recentHistory.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-surface-border pt-4">
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
        <section className="flex flex-col gap-2 border-t border-surface-border pt-4">
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
