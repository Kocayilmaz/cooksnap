import Link from "next/link";
import { Menu } from "lucide-react";
import { FEATURED_CATEGORY_ORDER, getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import type { MealCategory } from "@/lib/types/meal";

export default function CategoryNav({ categories }: { categories: MealCategory[] }) {
  // categories app/page.tsx'te sortCategoriesFeaturedFirst ile sıralanmış geliyor,
  // bu yüzden ilk FEATURED_CATEGORY_ORDER.length tanesi öne çıkanlar oluyor.
  const featuredCategories = categories.slice(0, FEATURED_CATEGORY_ORDER.length);

  return (
    <nav className="flex items-center gap-1 border-b border-surface-border pb-2">
      <div className="group relative shrink-0">
        <button
          type="button"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
        >
          <Menu size={16} aria-hidden="true" />
          Kategoriler
        </button>

        {/* Üzerine gelince tüm kategorileri gösteren mega-menü. */}
        <div className="invisible absolute left-0 top-full z-20 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-xl border border-surface-border bg-surface-card p-4 shadow-md sm:grid-cols-3">
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
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto">
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
