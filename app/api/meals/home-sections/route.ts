import { NextResponse } from "next/server";
import { getCategories, getMealsByCategory } from "@/lib/mealdb/client";
import { FEATURED_CATEGORY_ORDER, sortCategoriesFeaturedFirst } from "@/lib/mealdb/categoryMeta";
import { searchMealsByQuery } from "@/lib/spoonacular/client";
import { getOwnMealsByCategory } from "@/lib/firebase/recipesClient";
import type { MealCategory, MealSearchResult } from "@/lib/types/meal";

export interface MealHomeSectionsResponse {
  categories: MealCategory[];
  sections: { categoryName: string; meals: MealSearchResult[] }[];
}

/**
 * cooksnap-mobile'ın anasayfa kategori bölümü için ortak endpoint — app/page.tsx'in
 * (web) server component içinde yaptığı aynı veri birleştirmeyi (kendi Firestore
 * tarifleri + TheMealDB + Spoonacular) burada tekrarlıyor, çünkü mobilde React
 * Server Component yok, client'tan tek bir istekle bu veriye ulaşılması gerekiyor.
 */
const EXTRA_MEALS_PER_CATEGORY = 6;
const OWN_MEALS_PER_CATEGORY = 20;

export async function GET() {
  try {
    const categories = await getCategories().catch(() => []);
    const orderedCategories = sortCategoriesFeaturedFirst(categories);

    const sections = await Promise.all(
      FEATURED_CATEGORY_ORDER.map(async (categoryName) => {
        const [ownMeals, mealdbMeals, spoonacularMeals] = await Promise.all([
          getOwnMealsByCategory(categoryName, OWN_MEALS_PER_CATEGORY).catch(() => []),
          getMealsByCategory(categoryName).catch(() => []),
          searchMealsByQuery(categoryName, EXTRA_MEALS_PER_CATEGORY, categoryName).catch(() => []),
        ]);
        return { categoryName, meals: [...ownMeals, ...mealdbMeals, ...spoonacularMeals] };
      }),
    );

    return NextResponse.json<MealHomeSectionsResponse>({ categories: orderedCategories, sections });
  } catch {
    return NextResponse.json<MealHomeSectionsResponse>({ categories: [], sections: [] });
  }
}
