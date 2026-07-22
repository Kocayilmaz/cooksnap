import type { RecipeLanguage } from "./userProfileSlice";

const STORAGE_KEY = "cooksnap:userProfile";

interface StoredUserProfile {
  name: string;
  language: RecipeLanguage;
  country: string;
}

function isRecipeLanguage(value: unknown): value is RecipeLanguage {
  return value === "tr" || value === "en";
}

/** Profil tercihleri (ad, dil, ülke) tarayıcıda (localStorage) kalıcı tutulur. */
export function readStoredUserProfile(): StoredUserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredUserProfile>;
    if (
      typeof parsed.name !== "string" ||
      !isRecipeLanguage(parsed.language) ||
      typeof parsed.country !== "string"
    ) {
      return null;
    }
    return { name: parsed.name, language: parsed.language, country: parsed.country };
  } catch {
    return null;
  }
}

export function writeStoredUserProfile(value: StoredUserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
