import HomeWelcomeSection from "@/components/HomeWelcomeSection";
import IngredientPicker from "@/components/IngredientPicker";
import CategoryNav from "@/components/CategoryNav";
import CategoryMealsSection from "@/components/CategoryMealsSection";
import CategoryIngredientFilter from "@/components/CategoryIngredientFilter";
import { FEATURED_CATEGORY_ORDER } from "@/lib/mealdb/categoryMeta";
import { getOwnMealsByCategory } from "@/lib/supabase/recipesClient";
import type { MealCategory } from "@/lib/types/meal";

/** Kendi Supabase tarif veritabanımızdan (bkz. lib/supabase/recipesClient.ts)
 * kategori başına çekilecek en fazla kayıt — artık anasayfanın TEK kaynağı
 * bu tablo, TheMealDB/Spoonacular canlı çağrıları kaldırıldı (bkz. plan:
 * logical-sauteeing-oasis.md). */
const MEALS_PER_CATEGORY = 40;

export default async function Home() {
  // CategoryNav sadece kategori adını (getCategoryLabel ile) render ediyor,
  // thumbnail/description hiç kullanılmıyor — bu yüzden artık TheMealDB'den
  // kategori listesi çekmeye gerek yok, FEATURED_CATEGORY_ORDER yeterli.
  const categories: MealCategory[] = FEATURED_CATEGORY_ORDER.map((name) => ({
    name,
    thumbnail: "",
    description: "",
  }));

  const sections = await Promise.all(
    FEATURED_CATEGORY_ORDER.map(async (categoryName) => ({
      categoryName,
      meals: await getOwnMealsByCategory(categoryName, MEALS_PER_CATEGORY).catch(() => []),
    })),
  );

  return (
    <div className="flex flex-1 justify-center bg-surface-warm px-4 py-8">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        <HomeWelcomeSection />

        <IngredientPicker />

        {categories.length > 0 && (
          <div className="flex flex-col gap-6">
            <CategoryNav categories={categories} />
            <CategoryIngredientFilter>
              <div className="flex flex-col gap-6">
                {sections.map(({ categoryName, meals }) => (
                  <CategoryMealsSection key={categoryName} categoryName={categoryName} meals={meals} />
                ))}
              </div>
            </CategoryIngredientFilter>
          </div>
        )}
      </div>
    </div>
  );
}
