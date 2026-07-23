const STORAGE_KEY = "cooksnap:usageCount";

/** Ücretsiz moddaki başarılı tarif istek sayısı localStorage'da kalıcı tutulur. */
export function readStoredUsage(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredUsage(value: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(value));
}
