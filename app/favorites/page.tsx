"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleFavorite } from "@/lib/redux/favoritesSlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";
import {
  HISTORY_DATE_FORMATTER,
  historyEntryTitle,
  summarizeHistoryEntry,
  toggleHistoryFavorite,
} from "@/lib/redux/historySlice";
import RecipeVideoEmbed from "@/components/RecipeVideoEmbed";
import CopyRecipeButton from "@/components/CopyRecipeButton";
import MealCard from "@/components/MealCard";

export default function FavoritesPage() {
  const favorites = useAppSelector((state) => state.favorites);
  const mealFavorites = useAppSelector((state) => state.mealFavorites);
  // Sohbet tarafındaki favoriler (bkz. ChatSidebar "Sohbet Favorileri") tamamen
  // ayrı bir sistem — pinlenen sohbetler burada, tarif/yemek favorileri
  // yukarıdaki iki state'te. Aynı Türkçe "Favoriler" adını taşıdıkları için
  // kullanıcı ikisinin karıştığını belirtti, bu yüzden bu sayfada ayrı bir
  // bölüm olarak (kendi başlığıyla) gösteriliyor.
  const history = useAppSelector((state) => state.history);
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");

  const allRecipes = Object.values(favorites).sort((a, b) => b.savedAt - a.savedAt);
  const savedMeals = Object.values(mealFavorites).sort((a, b) => b.savedAt - a.savedAt);
  const favoriteChats = history.filter((entry) => entry.isFavorite);
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const recipes = normalizedQuery
    ? allRecipes.filter((recipe) =>
        recipe.title.toLocaleLowerCase("tr-TR").includes(normalizedQuery),
      )
    : allRecipes;

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface-card p-8 shadow-sm">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">Favoriler</h1>
          <p className="text-sm text-surface-text-muted">
            Yıldızladığın tarifler ve sabitlediğin sohbetler burada listelenir.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Tarif Favorileri</h2>

          {allRecipes.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="sr-only">Favorilerde ara</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tarif ara..."
                className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-foreground outline-none focus:border-brand-orange"
              />
            </label>
          )}

          {allRecipes.length === 0 ? (
            <p className="text-center text-sm text-surface-text-muted">
              Henüz favori tarifin yok. Chat&apos;ten bir tarif alıp yıldız butonuna basarak
              ekleyebilirsin.
            </p>
          ) : recipes.length === 0 ? (
            <p className="text-center text-sm text-surface-text-muted">
              &quot;{query}&quot; ile eşleşen favori tarif bulunamadı.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {recipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className="rounded-xl border border-surface-border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {recipe.title}
                      </p>
                      <p className="text-xs text-surface-text-muted">
                        {EQUIPMENT_LABELS[recipe.equipment]}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <CopyRecipeButton title={recipe.title} steps={recipe.steps} />
                      <button
                        type="button"
                        aria-label="Favorilerden çıkar"
                        onClick={() => dispatch(toggleFavorite(recipe))}
                        className="text-lg text-brand-orange"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-surface-text-muted">
                    {recipe.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                  {recipe.videoId && (
                    <RecipeVideoEmbed videoId={recipe.videoId} title={recipe.title} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {savedMeals.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-surface-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">Kaydedilen Tarifler</h2>
            <div className="grid grid-cols-2 gap-3">
              {savedMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </section>
        )}

        {favoriteChats.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-surface-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">Sohbet Favorileri</h2>
            <p className="text-xs text-surface-text-muted">
              Sohbet geçmişinde sabitlediğin konuşmalar — yukarıdaki tarif favorilerinden ayrı.
            </p>
            <ul className="flex flex-col gap-2">
              {favoriteChats.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-surface-border p-3"
                >
                  <Link
                    href={`/chat?entryId=${entry.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold text-foreground">
                      {historyEntryTitle(entry)}
                    </p>
                    <p className="text-xs text-surface-text-muted">
                      {summarizeHistoryEntry(entry)} · {HISTORY_DATE_FORMATTER.format(entry.createdAt)}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => dispatch(toggleHistoryFavorite(entry.id))}
                    aria-label="Sohbeti sabitlemeyi kaldır"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brand-orange hover:bg-surface-warm"
                  >
                    <Star size={16} aria-hidden="true" fill="currentColor" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
