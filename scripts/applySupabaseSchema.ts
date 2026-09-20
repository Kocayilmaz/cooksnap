/**
 * supabase/schema.sql'i doğrudan Postgres bağlantısıyla (SUPABASE_DB_URL) çalıştırır.
 * supabase-js'in DDL çalıştırma imkanı yok (sadece PostgREST), bu yüzden şema
 * kurulumu/güncellemesi için ayrı bir yol gerekiyor.
 *
 *   npx tsx --env-file=.env.local scripts/applySupabaseSchema.ts
 */
import { readFileSync } from "node:fs";
import { Client } from "pg";

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("SUPABASE_DB_URL tanımlı değil (.env.local).");
    process.exit(1);
  }

  const sql = readFileSync("./supabase/schema.sql", "utf8");
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  await client.connect();
  try {
    await client.query(sql);
    console.log("Şema uygulandı: recipes tablosu + RLS policy'leri hazır.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Şema uygulanamadı:", error instanceof Error ? error.message : error);
  process.exit(1);
});
