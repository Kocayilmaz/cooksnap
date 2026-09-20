import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let cachedClient: SupabaseClient | null | undefined;

/**
 * `recipes` tablosu herkese açık okunabilir (bkz. supabase/schema.sql RLS
 * policy'si), bu yüzden anon key ile hem server hem client tarafında
 * kullanılabilir — Firestore'daki getServerFirestoreDb/getFirestoreDb ikilisi
 * yerine tek bir client yeterli. Env değişkenleri tanımlı değilse null döner,
 * çağıran taraf (lib/supabase/recipesClient.ts) best-effort boş sonuçla devam eder.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  if (!isSupabaseConfigured()) {
    cachedClient = null;
    return cachedClient;
  }

  try {
    cachedClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
  } catch {
    cachedClient = null;
  }

  return cachedClient;
}
