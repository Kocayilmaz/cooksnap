"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ALL_INGREDIENTS } from "@/lib/mealdb/ingredientList";
import { getIngredientLabel } from "@/lib/mealdb/ingredientMeta";
import MealCard from "@/components/MealCard";
import type { MealSearchResult } from "@/lib/types/meal";
import type { MealCategoryFilterResponse } from "@/app/api/meals/category-filter/route";

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 8;

interface IngredientChipFieldProps {
  label: string;
  placeholder: string;
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}

function IngredientChipField({ label, placeholder, selected, onAdd, onRemove }: IngredientChipFieldProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return [];
    return ALL_INGREDIENTS.filter((ing) => {
      if (selected.includes(ing.name)) return false;
      const label = getIngredientLabel(ing.name).toLowerCase();
      return label.includes(trimmed) || ing.name.toLowerCase().includes(trimmed);
    })
      .sort((a, b) => {
        // Tam/başta eşleşen etiketler (ör. "domates" -> "Domates") önce gelsin,
        // yoksa alfabetik İngilizce sıralama yüzünden bileşik isimler
        // ("Mini Domates" gibi) tam eşleşmenin önüne geçiyordu.
        const labelA = getIngredientLabel(a.name).toLowerCase();
        const labelB = getIngredientLabel(b.name).toLowerCase();
        const rankA = labelA === trimmed ? 0 : labelA.startsWith(trimmed) ? 1 : 2;
        const rankB = labelB === trimmed ? 0 : labelB.startsWith(trimmed) ? 1 : 2;
        return rankA - rankB;
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [trimmed, selected]);

  function handleSelect(name: string) {
    onAdd(name);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onRemove(name)}
              className="flex items-center gap-1 rounded-full bg-surface-warm px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {getIngredientLabel(name)}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange"
        />
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-surface-border bg-surface-card shadow-md">
            {suggestions.map((ing) => (
              <button
                key={ing.name}
                type="button"
                onClick={() => handleSelect(ing.name)}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-surface-warm"
              >
                {getIngredientLabel(ing.name)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type FoodType = "all" | "sweet" | "savory";

const FOOD_TYPE_OPTIONS: { value: FoodType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "sweet", label: "Tatlı" },
  { value: "savory", label: "Tuzlu" },
];

export default function CategoryIngredientFilter({ children }: { children: ReactNode }) {
  const [include, setInclude] = useState<string[]>([]);
  const [exclude, setExclude] = useState<string[]>([]);
  const [foodType, setFoodType] = useState<FoodType>("all");
  const [meals, setMeals] = useState<MealSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const hasFilter = include.length > 0 || exclude.length > 0 || foodType !== "all";

  function runFilter(nextInclude: string[], nextExclude: string[], nextFoodType: FoodType) {
    if (nextInclude.length === 0 && nextExclude.length === 0 && nextFoodType === "all") {
      setMeals([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const params = new URLSearchParams();
    if (nextInclude.length > 0) params.set("include", nextInclude.join(","));
    if (nextExclude.length > 0) params.set("exclude", nextExclude.join(","));
    if (nextFoodType !== "all") params.set("foodType", nextFoodType);

    fetch(`/api/meals/category-filter?${params.toString()}`)
      .then((response) => response.json() as Promise<MealCategoryFilterResponse>)
      .then((data) => {
        setMeals(data.meals ?? []);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }

  function handleIncludeAdd(name: string) {
    const next = [...include, name];
    setInclude(next);
    runFilter(next, exclude, foodType);
  }
  function handleIncludeRemove(name: string) {
    const next = include.filter((n) => n !== name);
    setInclude(next);
    runFilter(next, exclude, foodType);
  }
  function handleExcludeAdd(name: string) {
    const next = [...exclude, name];
    setExclude(next);
    runFilter(include, next, foodType);
  }
  function handleExcludeRemove(name: string) {
    const next = exclude.filter((n) => n !== name);
    setExclude(next);
    runFilter(include, next, foodType);
  }
  function handleFoodTypeChange(next: FoodType) {
    setFoodType(next);
    runFilter(include, exclude, next);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex w-full shrink-0 flex-col gap-5 rounded-2xl bg-surface-card p-5 shadow-sm lg:w-64">
        <IngredientChipField
          label="Tarif bu malzemeleri içersin:"
          placeholder="Örneğin (domates, biber, patlıcan)"
          selected={include}
          onAdd={handleIncludeAdd}
          onRemove={handleIncludeRemove}
        />
        <IngredientChipField
          label="Tarif bu malzemeleri içermesin:"
          placeholder="Örneğin (domates, biber, patlıcan)"
          selected={exclude}
          onAdd={handleExcludeAdd}
          onRemove={handleExcludeRemove}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Yemek tipi</span>
          <div className="flex gap-2">
            {FOOD_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFoodTypeChange(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  foodType === option.value
                    ? "bg-brand-orange text-white"
                    : "bg-surface-warm text-foreground hover:bg-surface-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {!hasFilter && children}

        {hasFilter && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Filtrelenen tarifler</h2>

            {status === "loading" && (
              <p className="text-sm text-surface-text-muted">Tarifler aranıyor…</p>
            )}
            {status === "error" && (
              <p className="text-sm text-state-error">Tarifler şu an yüklenemedi, tekrar deneyin.</p>
            )}
            {status === "idle" && meals.length === 0 && (
              <p className="text-sm text-surface-text-muted">
                Bu filtreye uyan tarif bulunamadı. Farklı bir kombinasyon deneyin ya da{" "}
                <Link href="/chat" className="font-medium text-brand-orange hover:underline">
                  AI&apos;dan tarif isteyin
                </Link>
                .
              </p>
            )}
            {status === "idle" && meals.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
