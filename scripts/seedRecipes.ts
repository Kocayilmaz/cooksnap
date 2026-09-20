/**
 * CookSnap'in kendi Supabase tarif veritabanını besleyen tek script — iki modu var:
 *
 *   npx tsx --env-file=.env.local scripts/seedRecipes.ts --append
 *     scripts/manualRecipes.ts'teki elle yazılmış (Türkçe kaynak) tarifleri okuyup
 *     RECIPE_LANGUAGES'teki diğer 5 dile çevirip Supabase'e yazar/günceller.
 *
 *   npx tsx --env-file=.env.local scripts/seedRecipes.ts --bulk [--limit N]
 *     TheMealDB'nin tüm kategorilerini gezip her tarifi çekip 5 dile çevirir ve
 *     Supabase'e yazar (source_provider: "themealdb"). SADECE TheMealDB Supporter
 *     key alındıktan sonra çalıştırılmalı — bkz. plan (logical-sauteeing-oasis.md),
 *     ücretsiz test key ile toplu kopyalama ToS açısından uygun değil.
 *
 * Uygulamanın deploy edilen bir parçası DEĞİL — sadece yerel/manuel çalıştırılır,
 * SUPABASE_SERVICE_ROLE_KEY (.env.local, gitignore'da) ile RLS'i bypass ederek yazar.
 */
import { getCategories, getMealById, getMealsByCategory } from "@/lib/mealdb/client";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { RECIPE_LANGUAGES, type RecipeLanguage } from "@/lib/supabase/recipesClient";
import { translateRecipeToLanguage, type RecipeTextInput } from "@/lib/ai/translateRecipe";
import { MANUAL_RECIPES } from "./manualRecipes";
import type { SupabaseClient } from "@supabase/supabase-js";

const SOURCE_LANGUAGE: RecipeLanguage = "tr";
const TABLE = "recipes";

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

async function seedAppend(supabase: SupabaseClient): Promise<void> {
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

    const { error } = await supabase.from(TABLE).upsert({
      id: recipe.id,
      image_url: recipe.imageURL,
      category: recipe.category,
      source_provider: "manual",
      translations,
    });

    if (error) {
      console.error(`  ✗ Supabase'e yazılamadı:`, error.message);
      continue;
    }
    console.log(`  Supabase'e yazıldı.\n`);
  }
}

async function seedBulk(supabase: SupabaseClient, limit?: number): Promise<void> {
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

      const id = `themealdb-${summary.id}`;
      const { data: existing } = await supabase.from(TABLE).select("id").eq("id", id).maybeSingle();
      if (existing) {
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

      const { error } = await supabase.from(TABLE).upsert({
        id,
        image_url: detail.thumbnail,
        category: category.name,
        source_provider: "themealdb",
        translations,
      });

      if (error) {
        console.error(`  ✗ Supabase'e yazılamadı:`, error.message);
        continue;
      }
      console.log(`  Supabase'e yazıldı.\n`);
      processed += 1;
    }
  }
}

async function main() {
  const mode = process.argv[2];
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : undefined;

  const supabase = getSupabaseAdminClient();

  if (mode === "--append") {
    await seedAppend(supabase);
  } else if (mode === "--bulk") {
    await seedBulk(supabase, limit);
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
