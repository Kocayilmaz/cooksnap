import { NextResponse } from "next/server";
import { getMealById, getMealsByCategory, getMealsByIngredient } from "@/lib/mealdb/client";
import { FEATURED_CATEGORY_ORDER } from "@/lib/mealdb/categoryMeta";
import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { ApiErrorResponse } from "@/lib/types/recipe";
import type { MealSearchResult } from "@/lib/types/meal";

export interface MealCategoryFilterResponse {
  meals: MealSearchResult[];
}

/** "İçermesin" tarafı için tek tek detay çekmek gerektiğinden (bkz. aşağı)
 * maliyeti sınırlamak amacıyla aday havuzu bu sayıyla sınırlanıyor. */
const MAX_CANDIDATES = 40;
const MAX_RESULTS = 24;

function parseNames(raw: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

type FoodType = "sweet" | "savory" | null;

function parseFoodType(raw: string | null): FoodType {
  return raw === "sweet" || raw === "savory" ? raw : null;
}

/** Birden fazla "içersin" malzemesi seçilmişse her biri için ayrı ayrı
 * filter.php çağrılıp kesişimi alınır (TheMealDB tek istekte birden fazla
 * malzemeyi "VE" mantığıyla filtrelemiyor, test edildi). Hiç "içersin"
 * malzemesi yoksa aday havuzu anasayfadaki öne çıkan kategorilerin
 * tarifleri olur — yani kategori bölümünü filtreliyormuş gibi davranır.
 * Bu durumda tatlı/tuzlu seçimi de kategori düzeyinde (ör. sadece "Dessert"
 * çekilerek) uygulanır, çünkü kategori zaten kesin biliniyor — malzemeye
 * göre gelen adaylarda (aşağıda) kategori bilgisi olmadığından bu ayrım
 * detay çekilerek (applyDetailFilters) yapılır. */
async function getIncludeCandidates(includeNames: string[], foodType: FoodType): Promise<MealSearchResult[]> {
  if (includeNames.length === 0) {
    const categoriesToUse =
      foodType === "sweet"
        ? ["Dessert"]
        : foodType === "savory"
          ? FEATURED_CATEGORY_ORDER.filter((name) => name !== "Dessert")
          : FEATURED_CATEGORY_ORDER;
    const perCategory = await Promise.all(
      categoriesToUse.map((name) => getMealsByCategory(name).catch(() => [])),
    );
    const seen = new Map<string, MealSearchResult>();
    for (const meals of perCategory) {
      for (const meal of meals) {
        if (!seen.has(meal.id)) seen.set(meal.id, meal);
      }
    }
    return Array.from(seen.values());
  }

  const perIngredient = await Promise.all(includeNames.map((name) => getMealsByIngredient(name)));
  const [first, ...rest] = perIngredient;
  const idSetsForRest = rest.map((meals) => new Set(meals.map((meal) => meal.id)));
  return first.filter((meal) => idSetsForRest.every((idSet) => idSet.has(meal.id)));
}

async function applyDetailFilters(
  candidates: MealSearchResult[],
  excludeNames: string[],
  foodType: FoodType,
): Promise<MealSearchResult[]> {
  if (excludeNames.length === 0 && !foodType) return candidates;

  const lowerExcludes = excludeNames.map((name) => name.toLowerCase());
  const bounded = candidates.slice(0, MAX_CANDIDATES);
  const details = await Promise.all(bounded.map((meal) => getMealById(meal.id).catch(() => null)));

  return bounded.filter((meal, index) => {
    const detail = details[index];
    if (!detail) return true; // detay alınamadıysa best-effort dahil et
    if (foodType) {
      const isDessert = detail.category === "Dessert";
      if (foodType === "sweet" && !isDessert) return false;
      if (foodType === "savory" && isDessert) return false;
    }
    if (
      lowerExcludes.length > 0 &&
      detail.ingredients.some((ingredient) =>
        lowerExcludes.some((excluded) => ingredient.name.toLowerCase().includes(excluded)),
      )
    ) {
      return false;
    }
    return true;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeNames = parseNames(url.searchParams.get("include"));
  const excludeNames = parseNames(url.searchParams.get("exclude"));
  const foodType = parseFoodType(url.searchParams.get("foodType"));

  try {
    const candidates = await getIncludeCandidates(includeNames, foodType);
    // includeNames boşsa kategori zaten kaynakta doğru filtrelendi (yukarıda);
    // malzemeye göre gelen adaylarda kategori bilinmediğinden tatlı/tuzlu
    // kontrolü burada tekrar (detay çekilerek) yapılmalı.
    const foodTypeNeedsDetailCheck = includeNames.length > 0 ? foodType : null;
    const filtered = await applyDetailFilters(candidates, excludeNames, foodTypeNeedsDetailCheck);
    return NextResponse.json<MealCategoryFilterResponse>({ meals: filtered.slice(0, MAX_RESULTS) });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json<ApiErrorResponse>({ error: error.message }, { status: 503 });
    }
    if (error instanceof ProviderRequestError) {
      return NextResponse.json<ApiErrorResponse>({ error: error.message }, { status: 502 });
    }
    return NextResponse.json<ApiErrorResponse>({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
