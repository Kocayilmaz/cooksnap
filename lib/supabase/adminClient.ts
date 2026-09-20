import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * service_role key ile RLS'i bypass eden istemci — SADECE scripts/seedRecipes.ts
 * gibi yerel/admin script'lerinden çağrılır (bkz. supabase/schema.sql: recipes
 * tablosunda yazma policy'si yok, tek yazma yolu bu). Next.js route/component
 * içinde asla import edilmemeli.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env.local).");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
