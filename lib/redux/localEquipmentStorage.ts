import { EQUIPMENT_KEYS, type Equipment } from "./equipmentSlice";

const STORAGE_KEY = "cooksnap:equipment";

type StoredEquipment = Record<Equipment, boolean>;

function isStoredEquipment(value: unknown): value is StoredEquipment {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<StoredEquipment>;
  return EQUIPMENT_KEYS.every((key) => typeof record[key] === "boolean");
}

/** Ekipman seçimi tarayıcıda (localStorage) kalıcı tutulur, sayfa yenilendiğinde sıfırlanmaz. */
export function readStoredEquipment(): StoredEquipment | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredEquipment(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredEquipment(value: StoredEquipment): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
