import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { MealDetail, MealIngredient, MealSearchResult } from "@/lib/types/meal";

/** TheMealDB'nin ham JSON şekli — sadece bu dosya içinde kullanılır, dışarıya
 * her zaman lib/types/meal.ts'teki temiz tipler döner. */
interface RawMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strTags: string | null;
  strYoutube: string | null;
  [key: `strIngredient${number}`]: string | null | undefined;
  [key: `strMeasure${number}`]: string | null | undefined;
}

function getBaseUrl(): string {
  const apiKey = process.env.MEALDB_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("MEALDB_API_KEY tanımlı değil.");
  }
  return `https://www.themealdb.com/api/json/v1/${apiKey}`;
}

function toSearchResult(meal: RawMeal): MealSearchResult {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
    category: meal.strCategory ?? "",
    area: meal.strArea ?? "",
  };
}

function extractYoutubeVideoId(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}

function toMealDetail(meal: RawMeal): MealDetail {
  const ingredients: MealIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (!name) continue;
    ingredients.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? "" });
  }

  return {
    ...toSearchResult(meal),
    instructions: meal.strInstructions ?? "",
    ingredients,
    tags: meal.strTags ? meal.strTags.split(",").filter(Boolean) : [],
    youtubeVideoId: extractYoutubeVideoId(meal.strYoutube),
  };
}

async function fetchMeals(path: string): Promise<RawMeal[]> {
  const response = await fetch(`${getBaseUrl()}/${path}`);
  if (!response.ok) {
    throw new ProviderRequestError(`TheMealDB isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { meals: RawMeal[] | null };
  return data.meals ?? [];
}

/** İsme göre tarif arar (TheMealDB kısmi/substring eşleşme yapıyor). */
export async function searchMeals(query: string): Promise<MealSearchResult[]> {
  const meals = await fetchMeals(`search.php?s=${encodeURIComponent(query)}`);
  return meals.map(toSearchResult);
}

/** Tek bir tarifin tüm detayını (malzeme, talimat, video vb.) döner. */
export async function getMealById(id: string): Promise<MealDetail | null> {
  const meals = await fetchMeals(`lookup.php?i=${encodeURIComponent(id)}`);
  return meals[0] ? toMealDetail(meals[0]) : null;
}
