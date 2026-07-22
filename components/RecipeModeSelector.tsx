"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setRecipeMode, RECIPE_MODE_KEYS, type RecipeMode } from "@/lib/redux/recipeModeSlice";

const MODE_LABELS: Record<RecipeMode, string> = {
  student: "Öğrenci",
  home: "Ev yemeği",
  chef: "Aşçı",
};

const MODE_DESCRIPTIONS: Record<RecipeMode, string> = {
  student: "En az bulaşık çıkaran, en kolay tarifler.",
  home: "Bulaşık kısıtı yok, en lezzetli bilindik ev yemekleri.",
  chef: "En lezzetli, elit/profesyonel şef tarifleri.",
};

export default function RecipeModeSelector() {
  const mode = useAppSelector((state) => state.recipeMode.value);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tarif modu</span>
      <div className="flex gap-2">
        {RECIPE_MODE_KEYS.map((key) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => dispatch(setRecipeMode(key))}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {MODE_LABELS[key]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{MODE_DESCRIPTIONS[mode]}</p>
    </div>
  );
}
