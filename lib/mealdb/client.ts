import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { MealCategory, MealDetail, MealIngredient, MealSearchResult } from "@/lib/types/meal";

interface RawCategory {
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

/** Kategori filtresiyle dönen özet tarif — search/lookup'tan farklı olarak
 * strCategory içermiyor, kategori zaten filtre parametresinden biliniyor. */
interface RawFilteredMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

/** Kategori listesi ve kategoriye göre filtrelenmiş tarifler nadiren değişir,
 * ana sayfanın hızlı yüklenmesi için 1 saat önbelleklenir. */
const CATEGORY_REVALIDATE_SECONDS = 3600;

/** TheMealDB yavaş/erişilemez olsa bile sayfa süresiz beklemesin diye her
 * istek bu sürede zaman aşımına uğrar (bkz. fetchMeals, getCategories,
 * getMealsByCategory) — çağıran taraf best-effort olarak boş sonuçla devam eder. */
const REQUEST_TIMEOUT_MS = 2500;

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
  const response = await fetch(`${getBaseUrl()}/${path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
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

/** Tüm TheMealDB kategorilerini (Anasayfa'daki kategori barı için) döner. */
export async function getCategories(): Promise<MealCategory[]> {
  const response = await fetch(`${getBaseUrl()}/categories.php`, {
    next: { revalidate: CATEGORY_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new ProviderRequestError(`TheMealDB isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { categories: RawCategory[] };
  return data.categories.map((category) => ({
    name: category.strCategory,
    thumbnail: category.strCategoryThumb,
    description: category.strCategoryDescription,
  }));
}

/** Verilen kategorideki tarifleri özet halde (kutu görünümü için) döner. */
export async function getMealsByCategory(categoryName: string): Promise<MealSearchResult[]> {
  const response = await fetch(
    `${getBaseUrl()}/filter.php?c=${encodeURIComponent(categoryName)}`,
    {
      next: { revalidate: CATEGORY_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    throw new ProviderRequestError(`TheMealDB isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { meals: RawFilteredMeal[] | null };
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
    category: categoryName,
    area: "",
  }));
}

/** Verilen malzemeyi içeren tarifleri özet halde döner. TheMealDB'nin
 * filter.php'si tek malzeme kabul ediyor (virgülle birden fazla malzeme
 * verilince 0 sonuç dönüyor, test edildi) — birden fazla malzemeye göre
 * filtrelemek isteyen çağıran taraf bu fonksiyonu her malzeme için ayrı
 * çağırıp sonuçların kesişimini kendi hesaplamalı (bkz. app/api/meals/filter). */
export async function getMealsByIngredient(ingredientName: string): Promise<MealSearchResult[]> {
  const response = await fetch(
    `${getBaseUrl()}/filter.php?i=${encodeURIComponent(ingredientName)}`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );
  if (!response.ok) {
    throw new ProviderRequestError(`TheMealDB isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { meals: RawFilteredMeal[] | null };
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
    category: "",
    area: "",
  }));
}

/** Verilen mutfaktaki (area/ülke) tarifleri özet halde döner. */
export async function getMealsByArea(areaName: string): Promise<MealSearchResult[]> {
  const response = await fetch(
    `${getBaseUrl()}/filter.php?a=${encodeURIComponent(areaName)}`,
    {
      next: { revalidate: CATEGORY_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    throw new ProviderRequestError(`TheMealDB isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { meals: RawFilteredMeal[] | null };
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
    category: "",
    area: areaName,
  }));
}
