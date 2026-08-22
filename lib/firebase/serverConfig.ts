import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let cachedServerDb: Firestore | null | undefined;

/**
 * lib/firebase/config.ts'teki getFirestoreDb sadece tarayıcıda çalışır (auth/
 * favoriler client-only akışlar). `recipes` koleksiyonu ise herkese açık
 * okunabilir olduğu için auth gerektirmiyor — bu yüzden Server Component'lerden
 * (bkz. app/page.tsx, app/meal/[id]/page.tsx) de çağrılabilecek, `window`
 * kontrolü olmayan ayrı bir istemci burada tutuluyor.
 */
export function getServerFirestoreDb(): Firestore | null {
  if (cachedServerDb !== undefined) return cachedServerDb;

  if (!isFirebaseConfigured()) {
    cachedServerDb = null;
    return cachedServerDb;
  }

  try {
    const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
    cachedServerDb = getFirestore(app);
  } catch {
    cachedServerDb = null;
  }

  return cachedServerDb;
}
