import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "./config";
import type { FavoritesState } from "@/lib/redux/favoritesSlice";

const COLLECTION = "favorites";

/**
 * Favorileri Firestore'a best-effort olarak senkronize eder. Sadece gercekten
 * giris yapmis kullanicilar icin cagrilir (bkz. StoreProvider) — uid, Firebase
 * Auth'un kendi kullanici id'si, boylece guvenlik kurallari
 * (request.auth.uid == uid) bunu dogrulayabiliyor. Firebase yapilandirilmamissa
 * (env degiskeni yoksa) sessizce hicbir sey yapmaz — localStorage zaten asil
 * kaynak olmaya devam eder (bkz. lib/redux/localFavoritesStorage.ts).
 */
export async function pushFavoritesToFirestore(uid: string, favorites: FavoritesState): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    await setDoc(doc(db, COLLECTION, uid), { favorites, updatedAt: Date.now() });
  } catch {
    // Ağ hatası, izin hatası vb. — best-effort, localStorage zaten kalıcı kaynak.
  }
}

/** Firestore'da kayıtlı favori yoksa veya erişilemiyorsa null döner. */
export async function pullFavoritesFromFirestore(uid: string): Promise<FavoritesState | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, COLLECTION, uid));
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    const favorites = data?.favorites;
    if (typeof favorites !== "object" || favorites === null) return null;
    return favorites as FavoritesState;
  } catch {
    return null;
  }
}
