import { EQUIPMENT_KEYS } from "./equipmentSlice";
import type { FavoriteRecipe, FavoritesState } from "./favoritesSlice";

const STORAGE_KEY = "cooksnap:favorites";

function isFavoriteRecipe(value: unknown): value is FavoriteRecipe {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<FavoriteRecipe>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.equipment === "string" &&
    EQUIPMENT_KEYS.includes(record.equipment) &&
    Array.isArray(record.steps) &&
    record.steps.every((step) => typeof step === "string") &&
    typeof record.savedAt === "number"
  );
}

function isFavoritesState(value: unknown): value is FavoritesState {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(isFavoriteRecipe);
}

/** Favori tarifler tarayıcıda (localStorage) kalıcı tutulur, sayfa yenilendiğinde sıfırlanmaz. */
export function readStoredFavorites(): FavoritesState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isFavoritesState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredFavorites(value: FavoritesState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
