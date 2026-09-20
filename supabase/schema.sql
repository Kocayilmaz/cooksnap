-- CookSnap'in kendi çok dilli tarif veritabanı. Firestore'daki "recipes"
-- koleksiyonunun aynı şeklini korur (translations tek bir jsonb map'i),
-- fark sadece depolama katmanı — bkz. lib/supabase/recipesClient.ts,
-- scripts/seedRecipes.ts.
create table if not exists public.recipes (
  id text primary key,
  image_url text not null,
  category text not null,
  source_provider text not null,
  translations jsonb not null,
  created_at timestamptz not null default now()
);

-- Anasayfa kategori bölümü kategoriye göre filtreliyor (bkz.
-- getOwnMealsByCategory), bu sorguyu hızlandırır.
create index if not exists recipes_category_idx on public.recipes (category);

alter table public.recipes enable row level security;

-- Herkes okuyabilir (anasayfa/detay sayfası anon key ile okuyor).
drop policy if exists "Public read access" on public.recipes;
create policy "Public read access"
  on public.recipes
  for select
  to anon, authenticated
  using (true);

-- Yazma policy'si yok: sadece service_role (RLS'i bypass eder, bkz.
-- scripts/seedRecipes.ts) yazabilir, anon/authenticated hiçbir zaman yazamaz.

-- RLS'ten önce Postgres önce GRANT'e bakar — service_role için açıkça
-- yazma/okuma, anon+authenticated için sadece okuma yetkisi veriyoruz
-- (postgres superuser ile oluşturulan tablo varsayılan yetkileri
-- Supabase rollerine otomatik yansıtmayabiliyor, canlı test edilerek
-- doğrulandı: bu GRANT'ler olmadan service_role bile "permission denied" alıyordu).
grant usage on schema public to anon, authenticated, service_role;
grant select on public.recipes to anon, authenticated;
grant select, insert, update, delete on public.recipes to service_role;
