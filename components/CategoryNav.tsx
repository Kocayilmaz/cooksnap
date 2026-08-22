import Image from "next/image";
import Link from "next/link";
import { getCategoryDescription, getCategoryLabel } from "@/lib/mealdb/categoryMeta";
import type { MealCategory } from "@/lib/types/meal";

export default function CategoryNav({ categories }: { categories: MealCategory[] }) {
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-surface-border pb-2">
      {categories.map((category) => (
        <div key={category.name} className="group relative shrink-0">
          <Link
            href={`/category/${encodeURIComponent(category.name)}`}
            className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-warm hover:text-brand-orange"
          >
            {getCategoryLabel(category.name)}
          </Link>

          {/* Üzerine gelince kategoriyi detaylandıran önizleme kartı. */}
          <div className="invisible absolute left-0 top-full z-10 w-56 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
            <div className="flex gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-md">
              <Image
                src={category.thumbnail}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {getCategoryLabel(category.name)}
                </span>
                <span className="text-xs text-surface-text-muted">
                  {getCategoryDescription(category.name)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}
