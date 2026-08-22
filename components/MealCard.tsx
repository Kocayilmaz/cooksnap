"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import { getAreaLabel } from "@/lib/mealdb/areaMeta";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleMealFavorite } from "@/lib/redux/mealFavoritesSlice";
import type { MealSearchResult } from "@/lib/types/meal";

interface MealCardProps {
  meal: MealSearchResult;
  /** Boyutu çağıran belirler: yatay kaydırmalı sırada sabit genişlik (w-36 gibi),
   * grid içinde w-full — bkz. CategoryMealsSection / app/category/[cat]. */
  className?: string;
}

export default function MealCard({ meal, className = "w-full" }: MealCardProps) {
  const dispatch = useAppDispatch();
  const isFavorited = useAppSelector((state) => Boolean(state.mealFavorites[meal.id]));
  // Mutfağa göre (area) gelen sonuçlarda kategori boş olabiliyor (bkz.
  // getMealsByArea) — rozette o zaman mutfak adını gösteriyoruz.
  const badgeLabel = meal.category ? getCategoryLabel(meal.category) : meal.area ? getAreaLabel(meal.area) : "";

  return (
    <Link href={`/meal/${meal.id}`} className={`block shrink-0 ${className}`}>
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-0 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
          <Image
            src={meal.thumbnail}
            alt={meal.name}
            fill
            sizes="(max-width: 640px) 40vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dispatch(toggleMealFavorite(meal));
            }}
            aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
            aria-pressed={isFavorited}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-sm transition-colors hover:bg-white/90"
          >
            <Heart size={16} className={isFavorited ? "fill-brand-orange text-brand-orange" : ""} />
          </button>
          {badgeLabel && <Badge className="absolute left-2 top-2">{badgeLabel}</Badge>}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <CardContent className="p-2 pt-3 pb-0">
            <h3 className="line-clamp-2 text-sm font-medium tracking-tight text-foreground">
              {meal.name}
            </h3>
            {meal.area && (
              <p className="text-xs tracking-tight text-surface-text-muted">{getAreaLabel(meal.area)}</p>
            )}
          </CardContent>

          <CardFooter className="mt-auto flex items-center gap-1 p-2 pt-2 text-xs">
            <span className="ml-auto flex items-center gap-1 font-medium text-brand-orange">
              Tarifi Gör
              <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
