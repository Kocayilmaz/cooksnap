import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getServerFirestoreDb } from "./serverConfig";
import type { MealDetail, MealIngredient, MealSearchResult } from "@/lib/types/meal";

export const RECIPE_LANGUAGES = ["tr", "en", "id", "es", "pt", "ar"] as const;
export type RecipeLanguage = (typeof RECIPE_LANGUAGES)[number];

const DEFAULT_LANGUAGE: RecipeLanguage = "tr";
const COLLECTION = "recipes";

/** CookSnap'in kendi Firestore tarifleri, TheMealDB/Spoonacular id'leriyle
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

interface StoredRecipe {
  imageURL: string;
  category: string;
  sourceProvider: string;
  translations: Partial<Record<RecipeLanguage, StoredTranslation>>;
}

function pickTranslation(data: StoredRecipe, lang: RecipeLanguage): StoredTranslation | null {
  return data.translations[lang] ?? data.translations[DEFAULT_LANGUAGE] ?? null;
}

function toSearchResult(rawId: string, data: StoredRecipe, translation: StoredTranslation): MealSearchResult {
  return {
    id: `${ID_PREFIX}${rawId}`,
    name: translation.title,
    thumbnail: data.imageURL,
    category: data.category,
    area: "",
  };
}

/** Anasayfadaki kategori bölümlerine (bkz. app/page.tsx) TheMealDB/Spoonacular
 * sonuçlarının yanına kendi tariflerimizden ekler — kota/ToS riski yok, tamamen
 * bizim veritabanımız. Firestore yapılandırılmamışsa (env değişkenleri eksikse)
 * sessizce boş dizi döner, sayfa çökmez. */
export async function getOwnMealsByCategory(
  categoryName: string,
  count: number,
  lang: RecipeLanguage = DEFAULT_LANGUAGE,
): Promise<MealSearchResult[]> {
  const db = getServerFirestoreDb();
  if (!db) return [];

  try {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), where("category", "==", categoryName), limit(count)),
    );
    const results: MealSearchResult[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as StoredRecipe;
      const translation = pickTranslation(data, lang);
      if (translation) results.push(toSearchResult(docSnapshot.id, data, translation));
    });
    return results;
  } catch {
    return [];
  }
}

/** Tek bir kendi tarifimizin tüm detayını döner (bkz. app/meal/[id]/page.tsx). */
export async function getOwnMealById(
  rawId: string,
  lang: RecipeLanguage = DEFAULT_LANGUAGE,
): Promise<MealDetail | null> {
  const db = getServerFirestoreDb();
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, COLLECTION, rawId));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as StoredRecipe;
    const translation = pickTranslation(data, lang);
    if (!translation) return null;

    return {
      ...toSearchResult(rawId, data, translation),
      instructions: translation.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
      ingredients: translation.ingredients,
      tags: [],
      // Kendi tariflerimizde video yok — RecipeVideoEmbed zaten youtubeVideoId
      // null olduğunda hiç render edilmiyor.
      youtubeVideoId: null,
    };
  } catch {
    return null;
  }
}
