import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "./config";
import { getAnonymousId } from "./anonymousId";
import type { FavoritesState } from "@/lib/redux/favoritesSlice";

const COLLECTION = "favorites";

/**
 * Favorileri Firestore'a best-effort olarak senkronize eder. Firebase
 * yapılandırılmamışsa (NEXT_PUBLIC_FIREBASE_* env değişkenleri yoksa)
 * sessizce hiçbir şey yapmaz — localStorage zaten asıl kaynak olmaya devam
 * eder (bkz. lib/redux/localFavoritesStorage.ts).
 */
export async function pushFavoritesToFirestore(favorites: FavoritesState): Promise<void> {
  const db = getFirestoreDb();
  const anonymousId = getAnonymousId();
  if (!db || !anonymousId) return;

  try {
    await setDoc(doc(db, COLLECTION, anonymousId), { favorites, updatedAt: Date.now() });
  } catch {
    // Ağ hatası, izin hatası vb. — best-effort, localStorage zaten kalıcı kaynak.
  }
}

/** Firestore'da kayıtlı favori yoksa veya erişilemiyorsa null döner. */
export async function pullFavoritesFromFirestore(): Promise<FavoritesState | null> {
  const db = getFirestoreDb();
  const anonymousId = getAnonymousId();
  if (!db || !anonymousId) return null;

  try {
    const snapshot = await getDoc(doc(db, COLLECTION, anonymousId));
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    const favorites = data?.favorites;
    if (typeof favorites !== "object" || favorites === null) return null;
    return favorites as FavoritesState;
  } catch {
    return null;
  }
}
