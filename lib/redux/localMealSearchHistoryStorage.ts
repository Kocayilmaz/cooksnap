import type { MealSearchHistoryState } from "./mealSearchHistorySlice";

const STORAGE_KEY = "cooksnap:mealSearchHistory";

function isMealSearchResult(value: unknown): value is MealSearchHistoryState[number] {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<MealSearchHistoryState[number]>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.thumbnail === "string" &&
    typeof record.category === "string" &&
    typeof record.area === "string"
  );
}

function isMealSearchHistoryState(value: unknown): value is MealSearchHistoryState {
  return Array.isArray(value) && value.every(isMealSearchResult);
}

/** Arama geçmişi tarayıcıda (localStorage) kalıcı tutulur, sayfa yenilendiğinde
 * sıfırlanmaz — bkz. components/MealSearchBar.tsx. */
export function readStoredMealSearchHistory(): MealSearchHistoryState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isMealSearchHistoryState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredMealSearchHistory(value: MealSearchHistoryState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
