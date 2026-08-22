import Link from "next/link";
import MealCard from "@/components/MealCard";
import { getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import type { MealSearchResult } from "@/lib/types/meal";

interface CategoryMealsSectionProps {
  categoryName: string;
  meals: MealSearchResult[];
}

export default function CategoryMealsSection({ categoryName, meals }: CategoryMealsSectionProps) {
  if (meals.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{getCategoryLabel(categoryName)}</h2>
        <Link
          href={`/category/${encodeURIComponent(categoryName)}`}
          className="text-sm text-surface-text-muted hover:text-brand-orange"
        >
          Tümünü gör
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} className="w-36 sm:w-40" />
        ))}
      </div>
    </section>
  );
}
