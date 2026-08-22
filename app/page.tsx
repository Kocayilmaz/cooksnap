import HomeWelcomeSection from "@/components/HomeWelcomeSection";
import IngredientPicker from "@/components/IngredientPicker";
import HomeCategoryGate from "@/components/HomeCategoryGate";
import CategoryNav from "@/components/CategoryNav";
import CategoryMealsSection from "@/components/CategoryMealsSection";
import { getCategories, getMealsByCategory } from "@/lib/mealdb/client";
import { FEATURED_CATEGORY_ORDER, sortCategoriesFeaturedFirst } from "@/lib/mealdb/categoryMeta";

const SECTIONS_TO_SHOW = FEATURED_CATEGORY_ORDER;

export default async function Home() {
  const categories = await getCategories().catch(() => []);
  const orderedCategories = sortCategoriesFeaturedFirst(categories);

  const sections = await Promise.all(
    SECTIONS_TO_SHOW.map(async (categoryName) => ({
      categoryName,
      meals: await getMealsByCategory(categoryName).catch(() => []),
    })),
  );

  return (
    <div className="flex flex-1 justify-center bg-surface-warm px-4 py-8">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <HomeWelcomeSection />

        <IngredientPicker />

        {orderedCategories.length > 0 && (
          <HomeCategoryGate>
            <div className="flex flex-col gap-6">
              <CategoryNav categories={orderedCategories} />
              {sections.map(({ categoryName, meals }) => (
                <CategoryMealsSection key={categoryName} categoryName={categoryName} meals={meals} />
              ))}
            </div>
          </HomeCategoryGate>
        )}
      </div>
    </div>
  );
}
