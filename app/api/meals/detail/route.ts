import { NextResponse } from "next/server";
import { getMealById } from "@/lib/mealdb/client";
import { getSpoonacularMealById, isSpoonacularId, stripSpoonacularPrefix } from "@/lib/spoonacular/client";
import { getOwnMealById, isOwnRecipeId, stripOwnRecipePrefix } from "@/lib/firebase/recipesClient";
import { translateMealToTurkish } from "@/lib/ai/groqTranslate";
import type { ApiErrorResponse } from "@/lib/types/recipe";
import type { MealDetail } from "@/lib/types/meal";

export interface MealDetailResponse {
  meal: MealDetail;
}

/**
 * cooksnap-mobile'ın tarif detay ekranı için ortak endpoint — app/meal/[id]/page.tsx'in
 * (web) aynı üç-kaynaklı çözümlemesini (kendi Firestore / Spoonacular / TheMealDB,
 * id önekine göre) ve aynı best-effort Türkçe çeviriyi burada tekrarlıyor.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json<ApiErrorResponse>({ error: "id parametresi gerekli." }, { status: 400 });
  }

  const isOwn = isOwnRecipeId(id);
  const rawMeal = await (isOwn
    ? getOwnMealById(stripOwnRecipePrefix(id))
    : isSpoonacularId(id)
      ? getSpoonacularMealById(stripSpoonacularPrefix(id))
      : getMealById(id)
  ).catch(() => null);

  if (!rawMeal) {
    return NextResponse.json<ApiErrorResponse>({ error: "Tarif bulunamadı." }, { status: 404 });
  }

  const meal = isOwn ? rawMeal : await translateMealToTurkish(rawMeal).catch(() => rawMeal);
  return NextResponse.json<MealDetailResponse>({ meal });
}
