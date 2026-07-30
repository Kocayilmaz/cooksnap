import type { UsageCounterState } from "./usageCounterSlice";

const STORAGE_KEY = "cooksnap:usageCount";

function isUsageState(value: unknown): value is UsageCounterState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<UsageCounterState>;
  return (
    typeof record.count === "number" &&
    Number.isInteger(record.count) &&
    record.count >= 0 &&
    typeof record.lastResetAt === "number"
  );
}

/**
 * Ücretsiz moddaki başarılı tarif istek sayısı ve son sıfırlanma zamanı
 * localStorage'da kalıcı tutulur (bkz. usageCounterSlice USAGE_RESET_INTERVAL_MS).
 */
export function readStoredUsage(): UsageCounterState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Eski format sayacı düz bir sayı olarak saklıyordu; geriye dönük uyumluluk
    // için bunu da kabul edip şimdiki ana göre bir lastResetAt atıyoruz.
    if (typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0) {
      return { count: parsed, lastResetAt: Date.now() };
    }

    if (!isUsageState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredUsage(value: UsageCounterState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
