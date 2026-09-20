import { getSupabaseClient } from "./config";
import type { MealDetail, MealIngredient, MealSearchResult } from "@/lib/types/meal";

export const RECIPE_LANGUAGES = ["tr", "en", "id", "es", "pt", "ar"] as const;
export type RecipeLanguage = (typeof RECIPE_LANGUAGES)[number];

const DEFAULT_LANGUAGE: RecipeLanguage = "tr";
const TABLE = "recipes";

/** CookSnap'in kendi Supabase tarifleri, TheMealDB/Spoonacular id'leriyle
 * çakışmasın diye (bkz. favoriler/detay sayfası) bu önekle işaretlenir —
 * spoonacular-client.ts'teki "spoonacular-" deseniyle aynı mantık. */
const ID_PREFIX = "own-";

export function isOwnRecipeId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

export function stripOwnRecipePrefix(id: string): string {
  return id.slice(ID_PREFIX.length);
}

interface StoredTranslation {
  title: string;
  ingredients: MealIngredient[];
  steps: string[];
}

interface RecipeRow {
  id: string;
  image_url: string;
  category: string;
  source_provider: string;
  translations: Partial<Record<RecipeLanguage, StoredTranslation>>;
}

/** İstenen dil yoksa Türkçe'ye, o da yoksa İngilizce'ye düşer — GROQ_API_KEY
 * olmadan toplu ithal edilen tarifler (bkz. scripts/seedRecipes.ts --bulk)
 * sadece "en" ile kaydediliyor; bu fallback olmasaydı "tr" istendiğinde
 * hiçbir çeviri bulunamayıp tarif anasayfada hiç görünmezdi. */
function pickTranslation(row: RecipeRow, lang: RecipeLanguage): StoredTranslation | null {
  return row.translations[lang] ?? row.translations[DEFAULT_LANGUAGE] ?? row.translations.en ?? null;
}

function toSearchResult(row: RecipeRow, translation: StoredTranslation): MealSearchResult {
  return {
    id: `${ID_PREFIX}${row.id}`,
    name: translation.title,
    thumbnail: row.image_url,
    category: row.category,
    area: "",
  };
}

/** Anasayfadaki kategori bölümlerine kendi tariflerimizden ekler — Supabase
 * yapılandırılmamışsa (env değişkenleri eksikse) veya istek başarısız olursa
 * sessizce boş dizi döner, sayfa çökmez (bkz. lib/firebase/recipesClient.ts'teki
 * aynı best-effort desen). */
export async function getOwnMealsByCategory(
  categoryName: string,
  count: number,
  lang: RecipeLanguage = DEFAULT_LANGUAGE,
): Promise<MealSearchResult[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, image_url, category, source_provider, translations")
    .eq("category", categoryName)
    .limit(count);

  if (error || !data) return [];

  const results: MealSearchResult[] = [];
  for (const row of data as RecipeRow[]) {
    const translation = pickTranslation(row, lang);
    if (translation) results.push(toSearchResult(row, translation));
  }
  return results;
}

/** Tek bir kendi tarifimizin tüm detayını döner (bkz. app/meal/[id]/page.tsx). */
export async function getOwnMealById(
  rawId: string,
  lang: RecipeLanguage = DEFAULT_LANGUAGE,
): Promise<MealDetail | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, image_url, category, source_provider, translations")
    .eq("id", rawId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as RecipeRow;
  const translation = pickTranslation(row, lang);
  if (!translation) return null;

  return {
    ...toSearchResult(row, translation),
    instructions: translation.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    ingredients: translation.ingredients,
    tags: [],
    // Kendi tariflerimizde video yok — RecipeVideoEmbed zaten youtubeVideoId
    // null olduğunda hiç render edilmiyor.
    youtubeVideoId: null,
  };
}
