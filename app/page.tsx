import HomeWelcomeSection from "@/components/HomeWelcomeSection";
import IngredientPicker from "@/components/IngredientPicker";
import CategoryNav from "@/components/CategoryNav";
import CategoryMealsSection from "@/components/CategoryMealsSection";
import CategoryIngredientFilter from "@/components/CategoryIngredientFilter";
import { getCategories, getMealsByCategory } from "@/lib/mealdb/client";
import { FEATURED_CATEGORY_ORDER, sortCategoriesFeaturedFirst } from "@/lib/mealdb/categoryMeta";
import { searchMealsByQuery } from "@/lib/spoonacular/client";

/** Her kategori satırına TheMealDB sonuçlarının yanına eklenecek ek Spoonacular
 * tarif sayısı — genel çeşitliliği artırmak icin (bkz. lib/spoonacular/client.ts). */
const EXTRA_MEALS_PER_CATEGORY = 6;

const SECTIONS_TO_SHOW = FEATURED_CATEGORY_ORDER;

export default async function Home() {
  const categories = await getCategories().catch(() => []);
  const orderedCategories = sortCategoriesFeaturedFirst(categories);

  const sections = await Promise.all(
    SECTIONS_TO_SHOW.map(async (categoryName) => {
      const [mealdbMeals, spoonacularMeals] = await Promise.all([
        getMealsByCategory(categoryName).catch(() => []),
        searchMealsByQuery(categoryName, EXTRA_MEALS_PER_CATEGORY, categoryName).catch(() => []),
      ]);
      return { categoryName, meals: [...mealdbMeals, ...spoonacularMeals] };
    }),
  );

  return (
    <div className="flex flex-1 justify-center bg-surface-warm px-4 py-8">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        <HomeWelcomeSection />

        <IngredientPicker />

        {orderedCategories.length > 0 && (
          <div className="flex flex-col gap-6">
            <CategoryNav categories={orderedCategories} />
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
