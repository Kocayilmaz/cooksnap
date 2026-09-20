import { NextResponse } from "next/server";
import { FEATURED_CATEGORY_ORDER } from "@/lib/mealdb/categoryMeta";
import { getOwnMealsByCategory } from "@/lib/supabase/recipesClient";
import type { MealCategory, MealSearchResult } from "@/lib/types/meal";

export interface MealHomeSectionsResponse {
  categories: MealCategory[];
  sections: { categoryName: string; meals: MealSearchResult[] }[];
}

/**
 * cooksnap-mobile'ın anasayfa kategori bölümü için ortak endpoint — app/page.tsx'in
 * (web) aynı Supabase sorgusunu burada tekrarlıyor, çünkü mobilde React Server
 * Component yok, client'tan tek bir istekle bu veriye ulaşılması gerekiyor.
 *
 * Artık tek kaynak Supabase'deki `recipes` tablosu (bkz. supabase/schema.sql,
 * lib/supabase/recipesClient.ts) — TheMealDB/Spoonacular canlı çağrıları
 * anasayfadan kaldırıldı (bkz. plan: logical-sauteeing-oasis.md).
 */
const MEALS_PER_CATEGORY = 40;

export async function GET() {
  try {
    const categories: MealCategory[] = FEATURED_CATEGORY_ORDER.map((name) => ({
      name,
      thumbnail: "",
      description: "",
    }));

    const sections = await Promise.all(
      FEATURED_CATEGORY_ORDER.map(async (categoryName) => ({
        categoryName,
        meals: await getOwnMealsByCategory(categoryName, MEALS_PER_CATEGORY).catch(() => []),
      })),
    );

    return NextResponse.json<MealHomeSectionsResponse>({ categories, sections });
  } catch {
    return NextResponse.json<MealHomeSectionsResponse>({ categories: [], sections: [] });
  }
}
