import { EQUIPMENT_KEYS } from "./equipmentSlice";
import { RECIPE_MODE_KEYS } from "./recipeModeSlice";
import type { HistoryEntry, HistoryState } from "./historySlice";

const STORAGE_KEY = "cooksnap:history";

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<HistoryEntry>;
  return (
    typeof record.id === "string" &&
    typeof record.hadPhoto === "boolean" &&
    typeof record.personCount === "number" &&
    Array.isArray(record.equipment) &&
    record.equipment.every((item) => EQUIPMENT_KEYS.includes(item)) &&
    typeof record.mode === "string" &&
    RECIPE_MODE_KEYS.includes(record.mode) &&
    Array.isArray(record.recipeTitles) &&
    record.recipeTitles.every((title) => typeof title === "string") &&
    typeof record.createdAt === "number" &&
    // isFavorite alanı sonradan eklendi — eski (alansız) kayıtlarla geriye
    // dönük uyum için burada opsiyonel kabul edilir, okurken false'a normalize edilir.
    (record.isFavorite === undefined || typeof record.isFavorite === "boolean")
  );
}

function isHistoryState(value: unknown): value is HistoryState {
  return Array.isArray(value) && value.every(isHistoryEntry);
}

/** Arama geçmişi tarayıcıda (localStorage) kalıcı tutulur, sayfa yenilendiğinde sıfırlanmaz. */
export function readStoredHistory(): HistoryState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isHistoryState(parsed)) return null;
    return parsed.map((entry) => ({ ...entry, isFavorite: entry.isFavorite ?? false }));
  } catch {
    return null;
  }
}

export function writeStoredHistory(value: HistoryState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
