"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleFavorite } from "@/lib/redux/favoritesSlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";
import RecipeVideoEmbed from "@/components/RecipeVideoEmbed";
import CopyRecipeButton from "@/components/CopyRecipeButton";

export default function FavoritesPage() {
  const favorites = useAppSelector((state) => state.favorites);
  const dispatch = useAppDispatch();

  const recipes = Object.values(favorites).sort((a, b) => b.savedAt - a.savedAt);

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface-card p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">Favoriler</h1>
          <p className="text-sm text-surface-text-muted dark:text-zinc-400">
            Yıldızladığın tüm tarifler burada listelenir.
          </p>
        </div>

        {recipes.length === 0 ? (
          <p className="text-center text-sm text-surface-text-muted dark:text-zinc-400">
            Henüz favori tarifin yok. Ana sayfada bir tarif alıp yıldız butonuna basarak
            ekleyebilirsin.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="rounded-xl border border-surface-border p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground dark:text-zinc-50">
                      {recipe.title}
                    </p>
                    <p className="text-xs text-surface-text-muted dark:text-zinc-500">
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
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-surface-text-muted dark:text-zinc-400">
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
      </main>
    </div>
  );
}
