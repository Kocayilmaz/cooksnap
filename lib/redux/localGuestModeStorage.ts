const STORAGE_KEY = "cooksnap:guestMode";

/**
 * "Şimdilik atla" tercihi de diğer tercihler gibi (apiKey, equipment, ...)
 * localStorage'da tutulur — böylece sayfa yenilenince tekrar login ekranına
 * atılmaz. Gerçek girişten farklı olarak sadece ana sayfaya erişim verir
 * (bkz. AuthGate).
 */
export function readStoredGuestMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeStoredGuestMode(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
}
