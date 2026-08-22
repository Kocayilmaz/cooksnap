"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MealCard from "@/components/MealCard";
import { getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import type { MealSearchResult } from "@/lib/types/meal";

interface CategoryMealsSectionProps {
  categoryName: string;
  meals: MealSearchResult[];
}

const SCROLL_AMOUNT_PX = 320;

export default function CategoryMealsSection({ categoryName, meals }: CategoryMealsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (meals.length === 0) return null;

  function scrollBy(amount: number) {
    scrollContainerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{getCategoryLabel(categoryName)}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollBy(-SCROLL_AMOUNT_PX)}
            aria-label="Sola kaydır"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-surface-border text-foreground transition-colors hover:bg-surface-warm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(SCROLL_AMOUNT_PX)}
            aria-label="Sağa kaydır"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-surface-border text-foreground transition-colors hover:bg-surface-warm"
          >
            <ChevronRight size={16} />
          </button>
          <Link
            href={`/category/${encodeURIComponent(categoryName)}`}
            className="ml-1 text-sm text-surface-text-muted hover:text-brand-orange"
          >
            Tümünü gör
          </Link>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} className="w-36 sm:w-40" />
        ))}
      </div>
    </section>
  );
}
