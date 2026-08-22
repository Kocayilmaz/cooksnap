import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MealSearchResult } from "@/lib/types/meal";

interface MealCardProps {
  meal: MealSearchResult;
  /** Boyutu çağıran belirler: yatay kaydırmalı sırada sabit genişlik (w-36 gibi),
   * grid içinde w-full — bkz. CategoryMealsSection / app/category/[cat]. */
  className?: string;
}

export default function MealCard({ meal, className = "w-full" }: MealCardProps) {
  const subtitle = [meal.category, meal.area].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/meal/${meal.id}`}
      className={`group relative block aspect-[3/4] shrink-0 overflow-hidden rounded-2xl shadow-md transition-all duration-500 ease-in-out hover:scale-[1.03] hover:shadow-xl hover:shadow-brand-orange/30 ${className}`}
    >
      <Image
        src={meal.thumbnail}
        alt={meal.name}
        fill
        sizes="(max-width: 640px) 40vw, 200px"
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />

      {/* Alttan koyulaşan gradyan — başlık/buton her fotoğrafta okunaklı kalsın diye. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{meal.name}</h3>
        {subtitle && <p className="mt-0.5 truncate text-xs text-white/75">{subtitle}</p>}

        <div
          className="mt-2 flex items-center justify-between rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5
                     backdrop-blur-sm transition-colors duration-300
                     group-hover:border-brand-orange/60 group-hover:bg-brand-orange/80"
        >
          <span className="text-[11px] font-semibold tracking-wide text-white">Tarifi Gör</span>
          <ArrowRight
            size={14}
            className="text-white transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
