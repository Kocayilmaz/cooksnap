const STORAGE_KEY = "cooksnap:anonymousId";

/**
 * Firestore'a yazarken kullanıcıyı ayırt etmek için basit, kalıcı bir anonim id.
 * Henüz gerçek bir auth sistemi yok (bkz. AGENTS.md "Login ekranı henüz
 * uygulanmadı" notu), bu yüzden şimdilik tarayıcı başına bir kere üretilip
 * localStorage'da saklanan rastgele bir id kullanılıyor. Gerçek auth
 * eklendiğinde bunun yerini kullanıcı id'si alacak.
 */
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
