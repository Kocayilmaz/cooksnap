/**
 * CookSnap'in kendi Firestore tarif veritabanını besleyen tek script — iki modu var:
 *
 *   npx tsx --env-file=.env.local scripts/seedRecipes.ts --append
 *     scripts/manualRecipes.ts'teki elle yazılmış (Türkçe kaynak) tarifleri okuyup
 *     RECIPE_LANGUAGES'teki diğer 5 dile çevirip Firestore'a yazar/günceller.
 *
 *   npx tsx --env-file=.env.local scripts/seedRecipes.ts --bulk [--limit N]
 *     TheMealDB'nin tüm kategorilerini gezip her tarifi çekip 5 dile çevirir ve
 *     Firestore'a yazar (sourceProvider: "themealdb"). SADECE TheMealDB Supporter
 *     key alındıktan sonra çalıştırılmalı — bkz. plan (logical-sauteeing-oasis.md),
 *     ücretsiz test key ile toplu kopyalama ToS açısından uygun değil.
 *
 * Uygulamanın deploy edilen bir parçası DEĞİL — sadece yerel/manuel çalıştırılır,
 * firebase-service-account.json (gitignore'da) ile admin yetkisiyle yazar.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getCategories, getMealById, getMealsByCategory } from "@/lib/mealdb/client";
import { RECIPE_LANGUAGES, type RecipeLanguage } from "@/lib/firebase/recipesClient";
import { translateRecipeToLanguage, type RecipeTextInput } from "@/lib/ai/translateRecipe";
import { MANUAL_RECIPES } from "./manualRecipes";

const SERVICE_ACCOUNT_PATH = "./firebase-service-account.json";
const SOURCE_LANGUAGE: RecipeLanguage = "tr";
const COLLECTION = "recipes";

function getDb(): Firestore {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  initializeApp({ credential: cert(serviceAccount) });
  return getFirestore();
}

interface TranslationsMap {
  [lang: string]: { title: string; ingredients: { name: string; measure: string }[]; steps: string[] };
}

/** Kaynak dildeki tarifi RECIPE_LANGUAGES'teki diğer dillere çevirir, kaynak
 * dili olduğu gibi map'e ekler. Bir dilin çevirisi başarısız olursa (Groq
 * hatası vb.) o dil atlanır, script durmaz — kısmi çeviriyle de devam edilir. */
async function buildTranslations(
  source: RecipeTextInput,
  sourceLanguage: RecipeLanguage,
): Promise<TranslationsMap> {
  const translations: TranslationsMap = { [sourceLanguage]: source };

  for (const lang of RECIPE_LANGUAGES) {
    if (lang === sourceLanguage) continue;
    try {
      translations[lang] = await translateRecipeToLanguage(source, lang);
      console.log(`  ✓ ${lang}`);
    } catch (error) {
      console.error(`  ✗ ${lang} çevirisi başarısız:`, error instanceof Error ? error.message : error);
    }
  }

  return translations;
}

async function seedAppend(db: Firestore): Promise<void> {
  console.log(`${MANUAL_RECIPES.length} el yapımı tarif işlenecek.\n`);

  for (const recipe of MANUAL_RECIPES) {
    if (!recipe.imageURL) {
      console.warn(`⚠ ${recipe.id}: imageURL boş, atlanıyor (bkz. scripts/manualRecipes.ts).`);
      continue;
    }

    console.log(`→ ${recipe.title} (${recipe.id})`);
    const translations = await buildTranslations(
      { title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps },
      SOURCE_LANGUAGE,
    );

    await db
      .collection(COLLECTION)
      .doc(recipe.id)
      .set({
        imageURL: recipe.imageURL,
        category: recipe.category,
        sourceProvider: "manual",
        translations,
        createdAt: Date.now(),
      });
    console.log(`  Firestore'a yazıldı.\n`);
  }
}

async function seedBulk(db: Firestore, limit?: number): Promise<void> {
  const categories = await getCategories();
  console.log(`${categories.length} TheMealDB kategorisi bulundu.\n`);

  let processed = 0;
  for (const category of categories) {
    const summaries = await getMealsByCategory(category.name);
    console.log(`Kategori: ${category.name} (${summaries.length} tarif)`);

    for (const summary of summaries) {
      if (limit !== undefined && processed >= limit) {
        console.log(`\n--limit ${limit} sınırına ulaşıldı, durduruldu.`);
        return;
      }

      const docRef = db.collection(COLLECTION).doc(`themealdb-${summary.id}`);
      if ((await docRef.get()).exists) {
        console.log(`  (zaten var, atlandı) ${summary.name}`);
        processed += 1;
        continue;
      }

      const detail = await getMealById(summary.id);
      if (!detail) continue;

      console.log(`→ ${detail.name}`);
      const steps = detail.instructions.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
      const translations = await buildTranslations(
        { title: detail.name, ingredients: detail.ingredients, steps },
        "en",
      );

      await docRef.set({
        imageURL: detail.thumbnail,
        category: category.name,
        sourceProvider: "themealdb",
        translations,
        createdAt: Date.now(),
      });
      console.log(`  Firestore'a yazıldı.\n`);
      processed += 1;
    }
  }
}

async function main() {
  const mode = process.argv[2];
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : undefined;

  const db = getDb();

  if (mode === "--append") {
    await seedAppend(db);
  } else if (mode === "--bulk") {
    await seedBulk(db, limit);
  } else {
    console.error("Kullanım: tsx scripts/seedRecipes.ts --append | --bulk [--limit N]");
    process.exit(1);
  }

  console.log("Bitti.");
}

main().catch((error) => {
  console.error("Script hata ile durdu:", error);
  process.exit(1);
});
