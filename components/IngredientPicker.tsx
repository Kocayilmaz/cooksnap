"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { ALL_INGREDIENTS, type MealIngredientEntry } from "@/lib/mealdb/ingredientList";
import { getIngredientLabel } from "@/lib/mealdb/ingredientMeta";

const MIN_QUERY_LENGTH = 2;
const MAX_SEARCH_RESULTS = 60;

/** Varsayılan olarak gösterilecek, en sık kullanılan malzemeler — geri kalan
 * ~950 malzemeye arama kutusuyla erişilir (hepsini tek seferde göstermek
 * hem yavaş hem kalabalık olurdu). */
const POPULAR_INGREDIENT_NAMES = [
  "Onion",
  "Tomato",
  "Potatoes",
  "Chicken",
  "Eggs",
  "Cheese",
  "Green Pepper",
  "Aubergine",
  "Cucumber",
  "Carrots",
  "Rice",
  "Garlic",
];

const INGREDIENTS_BY_NAME = new Map(ALL_INGREDIENTS.map((ing) => [ing.name, ing]));

const POPULAR_INGREDIENTS = POPULAR_INGREDIENT_NAMES
  .map((name) => INGREDIENTS_BY_NAME.get(name))
  .filter((ing): ing is MealIngredientEntry => Boolean(ing));

export default function IngredientPicker() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return null;
    return ALL_INGREDIENTS.filter(
      (ing) =>
        ing.name.toLowerCase().includes(trimmedQuery) ||
        getIngredientLabel(ing.name).toLowerCase().includes(trimmedQuery),
    ).slice(0, MAX_SEARCH_RESULTS);
  }, [trimmedQuery]);

  const visible = searchResults ?? POPULAR_INGREDIENTS;

  function toggle(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  function handleShowRecipe() {
    const text = selected.map(getIngredientLabel).join(", ");
    router.push(`/chat?ingredients=${encodeURIComponent(text)}`);
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-surface-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Evdeki malzemelerinizi seçin, size tarif önerelim
        </h2>
        <p className="text-sm text-surface-text-muted">
          Evinizdeki malzemeleri seçin, AI elinizdekilerle ne yapabileceğinizi önersin.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Başka bir malzeme ara…"
          aria-label="Malzeme ara"
          className="w-full rounded-full border border-surface-border bg-surface-warm py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-brand-orange"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {selected.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange"
            >
              {getIngredientLabel(name)}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {searchResults && searchResults.length === 0 ? (
        <p className="text-center text-sm text-surface-text-muted">
          &quot;{query.trim()}&quot; için malzeme bulunamadı.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {visible.map((ing) => {
            const isSelected = selected.includes(ing.name);
            const label = getIngredientLabel(ing.name);
            return (
              <button
                key={ing.name}
                type="button"
                onClick={() => toggle(ing.name)}
                aria-pressed={isSelected}
                aria-label={isSelected ? `${label} seçimini kaldır` : `${label} ekle`}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-surface-warm transition-colors ${
                    isSelected ? "border-brand-orange" : "border-transparent"
                  }`}
                >
                  <Image src={ing.thumb} alt={label} fill sizes="120px" className="object-cover" />
                  <span
                    className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors ${
                      isSelected ? "bg-brand-orange text-white" : "bg-white/90 text-foreground"
                    }`}
                  >
                    {isSelected ? <X size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                  </span>
                </div>
                <span className="line-clamp-1 text-xs text-foreground">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleShowRecipe}
        disabled={selected.length === 0}
        className="mx-auto flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-surface-text-muted"
      >
        Tarifi Göster
      </button>
    </section>
  );
}
