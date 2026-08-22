import Image from "next/image";
import Link from "next/link";
import type { MealSearchResult } from "@/lib/types/meal";

interface MealCardProps {
  meal: MealSearchResult;
  /** Boyutu çağıran belirler: yatay kaydırmalı sırada sabit genişlik (w-36 gibi),
   * grid içinde w-full — bkz. CategoryMealsSection / app/category/[name]. */
  className?: string;
}

export default function MealCard({ meal, className = "w-full" }: MealCardProps) {
  return (
    <Link
      href={`/meal/${meal.id}`}
      className={`flex shrink-0 flex-col gap-2 rounded-xl border border-surface-border bg-surface-card p-2 transition-colors hover:border-brand-orange ${className}`}
    >
      <Image
        src={meal.thumbnail}
        alt={meal.name}
        width={160}
        height={160}
        className="aspect-square w-full rounded-lg object-cover"
      />
      <span className="line-clamp-2 text-xs font-medium text-foreground">{meal.name}</span>
    </Link>
  );
}
