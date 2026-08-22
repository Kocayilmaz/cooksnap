import Link from "next/link";
import { Menu } from "lucide-react";
import { FEATURED_CATEGORY_ORDER, getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import { AREAS, getAreaLabel } from "@/lib/mealdb/areaMeta";
import type { MealCategory } from "@/lib/types/meal";

export default function CategoryNav({ categories }: { categories: MealCategory[] }) {
  // categories app/page.tsx'te sortCategoriesFeaturedFirst ile sıralanmış geliyor,
  // bu yüzden ilk FEATURED_CATEGORY_ORDER.length tanesi öne çıkanlar oluyor.
  const featuredCategories = categories.slice(0, FEATURED_CATEGORY_ORDER.length);

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-surface-border pb-2">
      <div className="group relative shrink-0">
        <button
          type="button"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
        >
          <Menu size={16} aria-hidden="true" />
          Kategoriler
        </button>

        {/* Üzerine gelince tüm kategorileri ve mutfakları gösteren mega-menü.
            Sabit genişlik şart: grid-cols + fr, width:auto (shrink-to-fit) bir
            absolute kapsayıcı içinde neredeyse sıfıra çöküyor (tarayıcı fr
            track'lerini min=0 alıyor), bu da isimlerin üst üste binmesine yol
            açıyordu. */}
        <div className="invisible absolute left-0 top-full z-20 w-80 max-w-[92vw] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 sm:w-[640px]">
          <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto rounded-xl border border-surface-border bg-surface-card p-4 shadow-md sm:flex-row sm:gap-6">
            <div className="sm:w-1/2">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-surface-text-muted">
                Kategoriler
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/category/${encodeURIComponent(category.name)}`}
                    className="whitespace-nowrap rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
                  >
                    {getCategoryLabel(category.name)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-surface-border pt-4 sm:w-1/2 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-surface-text-muted">
                Mutfaklar
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {AREAS.map((area) => (
                  <Link
                    key={area}
                    href={`/cuisine/${encodeURIComponent(area)}`}
                    className="whitespace-nowrap rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
                  >
                    {getAreaLabel(area)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {featuredCategories.map((category) => (
          <Link
            key={category.name}
            href={`/category/${encodeURIComponent(category.name)}`}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
          >
            {getCategoryLabel(category.name)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
