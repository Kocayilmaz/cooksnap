import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { MealDetail, MealIngredient, MealSearchResult } from "@/lib/types/meal";

const BASE_URL = "https://api.spoonacular.com";
const REQUEST_TIMEOUT_MS = 4000;

/** Spoonacular id'leri TheMealDB'ninkiyle aynı (düz sayısal string) namespace'te
 * çakışabilir — favoriler/geçmiş/dedup id'yi opak string olarak kullandığı için
 * burada normalize edilirken bu önek eklenir (bkz. app/meal/[id]/page.tsx).
 * Önekte ':' değil '-' kullanılıyor: ':' URL path segmentinde bazı router/link
 * katmanlarınca '%3A'ya encode edilip geri çözülmüyor (test edilerek doğrulandı),
 * '-' ise URL-safe olduğu için hiç encode edilmiyor. */
const ID_PREFIX = "spoonacular-";

export function isSpoonacularId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

export function stripSpoonacularPrefix(id: string): string {
  return id.slice(ID_PREFIX.length);
}

interface RawSpoonacularMeal {
  id: number;
  title: string;
  image: string;
  dishTypes?: string[];
  cuisines?: string[];
}

interface RawSpoonacularMealDetail extends RawSpoonacularMeal {
  instructions: string | null;
  analyzedInstructions: { steps: { number: number; step: string }[] }[];
  extendedIngredients: { name: string; original: string }[];
}

function getApiKey(): string {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("SPOONACULAR_API_KEY tanımlı değil.");
  }
  return apiKey;
}

function toSearchResult(meal: RawSpoonacularMeal): MealSearchResult {
  return {
    id: `${ID_PREFIX}${meal.id}`,
    name: meal.title,
    thumbnail: meal.image,
    category: meal.dishTypes?.[0] ?? "",
    area: meal.cuisines?.[0] ?? "",
  };
}

function toInstructionsText(meal: RawSpoonacularMealDetail): string {
  const steps = meal.analyzedInstructions[0]?.steps;
  if (steps && steps.length > 0) {
    return steps.map((step) => `${step.number}. ${step.step}`).join("\n");
  }
  // analyzedInstructions boşsa ham instructions HTML içerebilir, etiketler temizlenir.
  return (meal.instructions ?? "").replace(/<[^>]+>/g, "").trim();
}

function toMealDetail(meal: RawSpoonacularMealDetail): MealDetail {
  // Spoonacular'in "original" alani zaten miktar+isim birlesik geliyor (ör.
  // "1/4 cup breadcrumbs") — TheMealDB'nin aksine ayri bir "measure" yok, bu
  // yuzden name alanina tam metni koyup measure'i bos birakiyoruz (yoksa sayfa
  // sablonu "{measure} {name}" seklinde ismi iki kez gosterir).
  const ingredients: MealIngredient[] = meal.extendedIngredients.map((ingredient) => ({
    name: ingredient.original,
    measure: "",
  }));

  return {
    ...toSearchResult(meal),
    instructions: toInstructionsText(meal),
    ingredients,
    tags: [],
    // Spoonacular tarif detayında video bilgisi yok — RecipeVideoEmbed zaten
    // youtubeVideoId null olduğunda hiç render edilmiyor.
    youtubeVideoId: null,
  };
}

/** Anasayfadaki "Keşfet" bölümü için rastgele tarifler döner (bkz. app/page.tsx). */
export async function getRandomMeals(count: number): Promise<MealSearchResult[]> {
  const apiKey = getApiKey();
  const response = await fetch(
    `${BASE_URL}/recipes/random?number=${count}&apiKey=${apiKey}`,
    { next: { revalidate: 3600 }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );
  if (!response.ok) {
    throw new ProviderRequestError(`Spoonacular isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as { recipes: RawSpoonacularMeal[] };
  return (data.recipes ?? []).map(toSearchResult);
}

/** Tek bir Spoonacular tarifinin tüm detayını döner (bkz. app/meal/[id]/page.tsx). */
export async function getSpoonacularMealById(rawId: string): Promise<MealDetail | null> {
  const apiKey = getApiKey();
  const response = await fetch(
    `${BASE_URL}/recipes/${encodeURIComponent(rawId)}/information?apiKey=${apiKey}`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new ProviderRequestError(`Spoonacular isteği başarısız oldu (${response.status}).`);
  }
  const data = (await response.json()) as RawSpoonacularMealDetail;
  return toMealDetail(data);
}
