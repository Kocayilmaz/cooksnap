import { NextResponse } from "next/server";
import { getMealsByIngredient } from "@/lib/mealdb/client";
import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { ApiErrorResponse } from "@/lib/types/recipe";
import type { MealSearchResult } from "@/lib/types/meal";

export interface MealFilterResponse {
  meals: MealSearchResult[];
}

/** Birden fazla malzeme seçilmişse (bkz. components/IngredientPicker.tsx),
 * her malzeme için ayrı ayrı filter.php çağrılıp sonuçların kesişimi
 * (hepsinde ortak olan tarifler) alınır — TheMealDB tek istekte birden
 * fazla malzemeyi "VE" mantığıyla filtrelemiyor (test edildi: virgülle
 * birden fazla malzeme 0 sonuç döndürüyor). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ingredients") ?? "";
  const ingredients = raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (ingredients.length === 0) {
    return NextResponse.json<MealFilterResponse>({ meals: [] });
  }

  try {
    const resultsPerIngredient = await Promise.all(
      ingredients.map((name) => getMealsByIngredient(name)),
    );

    const [first, ...rest] = resultsPerIngredient;
    const idSetsForRest = rest.map((meals) => new Set(meals.map((meal) => meal.id)));
    const meals = first.filter((meal) => idSetsForRest.every((idSet) => idSet.has(meal.id)));

    return NextResponse.json<MealFilterResponse>({ meals });
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
