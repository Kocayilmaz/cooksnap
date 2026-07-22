import type { PremiumProvider } from "./apiKeySlice";

const STORAGE_KEY = "cooksnap:apiKey";

interface StoredApiKey {
  provider: PremiumProvider;
  key: string;
}

function isPremiumProvider(value: unknown): value is PremiumProvider {
  return value === "claude" || value === "openai";
}

/**
 * Premium API anahtarı sadece tarayıcıda (localStorage) tutulur, sunucuya
 * kalıcı olarak gönderilmez/saklanmaz — bkz. README "AI engine" bölümü.
 */
export function readStoredApiKey(): StoredApiKey | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredApiKey>;
    if (!isPremiumProvider(parsed.provider) || typeof parsed.key !== "string") {
      return null;
    }
    return { provider: parsed.provider, key: parsed.key };
  } catch {
    return null;
  }
}

export function writeStoredApiKey(value: StoredApiKey): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
