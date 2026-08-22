"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/hooks";
import { getIngredientLabel } from "@/lib/mealdb/ingredientMeta";
import MealCard from "@/components/MealCard";
import type { MealSearchResult } from "@/lib/types/meal";
import type { MealFilterResponse } from "@/app/api/meals/filter/route";

type Status = "loading" | "idle" | "error";

/** Anasayfadaki malzeme seçicide (IngredientPicker) en az bir malzeme
 * seçiliyken kategori satırları yerine gösterilir — seçilen malzemelerin
 * HEPSİNİ birden içeren tarifleri listeler (bkz. app/api/meals/filter). */
export default function IngredientFilteredMeals() {
  const selected = useAppSelector((state) => state.selectedIngredients);
  const [meals, setMeals] = useState<MealSearchResult[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (selected.length === 0) return;

    const controller = new AbortController();

    async function run() {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/meals/filter?ingredients=${encodeURIComponent(selected.join(","))}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as MealFilterResponse;
        setMeals(data.meals ?? []);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }

    void run();

    return () => controller.abort();
  }, [selected]);

  if (selected.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Seçtiğiniz malzemelerle yapılabilecek tarifler
        </h2>
        <p className="text-sm text-surface-text-muted">
          {selected.map(getIngredientLabel).join(", ")}
        </p>
      </div>

      {status === "loading" && (
        <p className="text-sm text-surface-text-muted">Tarifler aranıyor…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-state-error">Tarifler şu an yüklenemedi, tekrar deneyin.</p>
      )}

      {status === "idle" && meals.length === 0 && (
        <p className="text-sm text-surface-text-muted">
          Bu malzemelerin hepsini birden içeren tarif bulunamadı. Farklı bir kombinasyon deneyin ya
          da{" "}
          <Link href="/chat" className="font-medium text-brand-orange hover:underline">
            AI&apos;dan tarif isteyin
          </Link>
          .
        </p>
      )}

      {status === "idle" && meals.length > 0 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} className="w-36 sm:w-40" />
          ))}
        </div>
      )}
    </section>
  );
}
