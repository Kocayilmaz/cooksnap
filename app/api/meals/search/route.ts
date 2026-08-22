import { NextResponse } from "next/server";
import { searchMeals } from "@/lib/mealdb/client";
import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { ApiErrorResponse } from "@/lib/types/recipe";
import type { MealSearchResult } from "@/lib/types/meal";

export interface MealSearchResponse {
  meals: MealSearchResult[];
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json<MealSearchResponse>({ meals: [] });
  }

  try {
    const meals = await searchMeals(query);
    return NextResponse.json<MealSearchResponse>({ meals });
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
