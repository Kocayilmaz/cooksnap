import type { MealFavorite, MealFavoritesState } from "./mealFavoritesSlice";

const STORAGE_KEY = "cooksnap:mealFavorites";

function isMealFavorite(value: unknown): value is MealFavorite {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<MealFavorite>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.thumbnail === "string" &&
    typeof record.category === "string" &&
    typeof record.area === "string" &&
    typeof record.savedAt === "number"
  );
}

function isMealFavoritesState(value: unknown): value is MealFavoritesState {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(isMealFavorite);
}

/** MealDB favorileri tarayıcıda (localStorage) kalıcı tutulur. */
export function readStoredMealFavorites(): MealFavoritesState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isMealFavoritesState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredMealFavorites(value: MealFavoritesState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
