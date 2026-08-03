<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CookSnap

Fotoğraftan yemek/ürün tanıyıp, kaç kişilik ve hangi araçla (fırın/tava/tencere) pişirileceğine
göre AI ile tarif öneren bir uygulama. Detaylı fikir ve mimari için `README.md`. (Not: klasör adı
hâlâ `ne-pisirsem`, GitHub'daki repo adı `cooksnap`.)

## Neden var

Bu proje `dosya-organizer` gibi günlük commit rutininin (`gunluk-commit-rutini` zamanlanmış
görevi) bir parçası olarak küçük, gerçek adımlarla geliştiriliyor — tek seferde bitmiyor.

## Planlanan mimari (henüz tamamı kurulmadı, aşamalı ekleniyor)

- **Frontend:** Next.js App Router + TypeScript + Tailwind + Redux Toolkit (kişi sayısı, ekipman
  seçimi, API key gibi global state için)
- **Backend:** Next.js API routes altında AI sağlayıcı çağrıları
- **AI yönlendirme:** Ücretsiz modda Gemini (görsel) + Groq (metin), rate-limitli. Kullanıcı kendi
  Claude/OpenAI key'ini girerse premium mod (limitsiz). Key sadece tarayıcıda tutulur, sunucuda
  kalıcı saklanmaz.
- **Veri:** Firebase/Firestore — favori tarifler + ücretsiz mod kullanım sayacı
- **Test:** Playwright e2e (fotoğraf yükle → tarif al akışı)
- **CI/CD:** GitHub Actions → Vercel

## Ekran yapısı ve gezinme (2026-07-22 kullanıcı notu)

Uygulama 3 ana ekrandan oluşacak:

1. **Login ekranı:** Henüz uygulanmadı — gerçek auth backend'i (Firebase) yok. Login/logout/delete
   account, gerçek bir kimlik doğrulama sistemi olmadan sahte/anlamsız buton eklemek istemediğimiz
   için bilinçli olarak bekletiliyor.
2. ✅ **Profil ekranı:** `/profile` route'u eklendi — ad soyad, dil (Türkçe/English, AI yanıt diline
   yansıyor), ülke (tarif önerisine soft-preference olarak yansıyor), premium API anahtarı
   (`ApiKeyInput` buraya taşındı) ve "Need help?" SSS bölümü hepsi burada. Tüm alanlar
   `localStorage`'da kalıcı. Logout/delete account login sistemiyle birlikte eklenecek.
3. **Chat ekranı:** Henüz uygulanmadı. Tasarım Claude'un kendi chat arayüzüne benzeyecek — solda
   üstte "New" butonu, altında "Favoriler" ve kullanıcının kendi gruplandırabildiği favori chat'ler,
   altında geçmiş chat listesi. Yeni bir tarif chat'i başlatıldığında ana alan bugünkü ana sayfadaki
   form (fotoğraf yükleme + kişi sayısı + ekipman seçimi) ile açılır.

Ana sayfa ile profil arasında geçiş için üstte `NavBar` eklendi.

**Önemli teknik not:** `localStorage`'dan hydrate edilen Redux state'i (`apiKey`, `userProfile`,
`equipment`) `useState` lazy initializer içinde okuyup `configureStore`'a `preloadedState` olarak vermek,
server/client hydration mismatch'ine yol açıyordu — React form-dışı özniteliklerde (örn.
`aria-pressed`) bu mismatch'i "yamıyor" (input `value` gibi form kontrollerinde yamıyor, bu yüzden
bug'ı `ApiKeyInput`'ta değil `RecipeModeSelector`/dil butonlarında fark ettik). Çözüm:
`StoreProvider` her zaman varsayılan state ile başlar, saklanan değerler mount sonrası bir
`useEffect` içinde dispatch edilir (bkz. `lib/redux/StoreProvider.tsx`).

## Görsel kimlik notu (2026-07-22)

Renk paleti Liferando, Trendyol Yemek ve Nefis Yemek Tarifleri gibi sitelerdeki canlı/vibrant
renklerden ilham alacak (şu anki nötr zinc paleti yerine). Uygulamaya geçmeden önce `DESIGN.md`
tarzı bir palet kararı çıkar.

## Backlog (2026-07-22 itibarıyla kod tarafı tamamlandı, bkz. not)

1. ✅ **Tarif videosu:** `lib/ai/youtube.ts` + `RecipeVideoEmbed` — `YOUTUBE_API_KEY` yapılandırılmışsa
   tarif başlığına göre en alakalı videoyu bulup uygulama içinde embed eder (best-effort, anahtar
   yoksa video sessizce atlanır, asıl tarif yanıtını etkilemez).
2. ✅ **3 tarif modu:** `recipeModeSlice` + `RecipeModeSelector` — Öğrenci/Ev yemeği/Aşçı modu
   seçilebiliyor ve AI prompt'una yansıyor.
3. ✅ **Fotoğrafsız kullanım:** `IngredientTextInput` — fotoğraf yerine malzemeler yazıyla girilebiliyor.
4. ✅ **Fotoğraf + yazı birlikte:** İkisi birlikte gönderilirse Gemini'nin tanıdığı ürün + kullanıcının
   yazdığı ek metin tek açıklamada birleştiriliyor.

Not: Bu 4 madde de kod tarafında uygulandı ve e2e testlerle (fotoğraf-only, metin-only, mod seçimi)
doğrulandı; ancak gerçek Gemini/Groq/YouTube API anahtarları hâlâ tanımlı değil, bu yüzden uçtan uca
gerçek bir AI çağrısı henüz canlıda denenmedi (bkz. README "Status").

5. ✅ **Ekipman seçenekleri genişletildi (2026-07-23):** `lib/redux/equipmentSlice.ts`'e airfryer,
   mikrodalga, düdüklü tencere, tost makinesi, ızgara/BBQ, yavaş pişirici ve wok eklendi. `Equipment`
   union tipi, `EQUIPMENT_KEYS`, `EquipmentSelector` etiketleri ve `buildRecipePrompt`'taki
   `EQUIPMENT_NAMES` birlikte güncellendi (route validasyonu `EQUIPMENT_KEYS`'i generic kullandığı
   için değişiklik gerekmedi). `EquipmentSelector`'ın layout'u 10 seçeneğe sığması için
   `flex-wrap`'e geçirildi. e2e testle (bkz. `e2e/home.spec.ts`) doğrulandı. Ayrıca ekipman seçimi
   artık `apiKey`/`userProfile` ile aynı desende `localStorage`'da kalıcı tutuluyor
   (`lib/redux/localEquipmentStorage.ts` + `equipmentSlice`'taki `setEquipment` + `StoreProvider`),
   önceden sayfa yenilenince sıfırlanıyordu.
6. ✅ **Görsel kimlik kararı (2026-07-23):** `DESIGN.md` eklendi (sıcak nötr yüzey/kenarlık/metin
   token'ları + durum renkleri). Token'lar `app/globals.css`'e eklendi ve ana sayfa (`app/page.tsx`)
   zinc-* yerine bunları kullanacak şekilde güncellendi; koyu mod şimdilik `dark:zinc-*` sınıflarıyla
   korunuyor, geri kalan bileşenler kademeli olarak taşınacak.
7. ✅ **Favori tarifler — yerel sürüm (2026-07-23):** Firebase entegrasyonu henüz yok, bu yüzden
   favoriler önce `apiKey`/`equipment` ile aynı desende `localStorage`'a yazıldı:
   `lib/redux/favoritesSlice.ts` + `localFavoritesStorage.ts` (id = ekipman+başlık ikilisi),
   `components/FavoriteButton.tsx` her tarif kartında yıldız butonu olarak gösteriyor. e2e testle
   (`e2e/favorites.spec.ts`, `/api/recipe` mock'lanarak) toggle ve kalıcılık doğrulandı. Firebase
   eklendiğinde bu local-only katman senkronize edilecek/taşınacak.
8. ✅ **Görsel kimlik migrasyonu tamamlandı (2026-07-28):** `DESIGN.md` paleti ana sayfadan sonra
   geri kalan tüm bileşenlere de (`PersonCountSelector`, `IngredientTextInput`, `PhotoUpload`,
   `RecipeModeSelector`, `EquipmentSelector`, `NavBar`, `HelpSection`, `ApiKeyInput`) uygulandı;
   `ApiKeyInput`'taki seçili sağlayıcı stili de diğer seçicilerle tutarlı olsun diye siyah/beyazdan
   `brand-orange`'a çevrildi. Karanlık mod kasıtlı olarak `dark:zinc-*` sınıflarıyla kalmaya devam
   ediyor (bkz. `DESIGN.md`).
9. ✅ **Ücretsiz mod istek limiti (2026-07-28):** `lib/redux/usageCounterSlice.ts`'e
   `FREE_USAGE_LIMIT` (5) eklendi; limit aşılınca ana sayfadaki "Tarifi getir" butonu devre dışı
   kalıyor ve kullanıcıya profil sayfasından kendi API anahtarını girmesi öneriliyor. e2e testle
   (`e2e/usage-counter.spec.ts`) doğrulandı.
10. ✅ **Premium mod uçtan uca bağlandı (2026-07-29):** `lib/ai/claudeProvider.ts` ve
    `lib/ai/openaiProvider.ts` eklendi (kullanıcının kendi anahtarıyla görsel tanıma + tarif
    üretimi). `POST /api/recipe`, gövdede `premiumProvider`/`premiumApiKey` birlikte gelirse
    Gemini/Groq yerine bunları kullanacak şekilde güncellendi (biri gelip diğeri gelmezse 400).
    Ana sayfa (`app/page.tsx`) premium moddayken bu alanları isteğe otomatik ekliyor. Ortak
    `parseDataUrl` yardımcısı `lib/ai/parseDataUrl.ts`'e çıkarıldı. e2e testlerle (alan doğrulama,
    `e2e/api-recipe.spec.ts`) ve tarayıcıda sahte bir OpenAI anahtarıyla manuel olarak (401→502
    doğru yansıdı, Gemini/Groq'a düşmedi) doğrulandı; gerçek anahtarlarla henüz denenmedi.
11. ✅ **Küçük UX/altyapı adımları (2026-07-30):**
    - `components/LoadingSpinner.tsx` eklendi, ana sayfadaki "Tarif hazırlanıyor…" durumunda
      kullanılıyor.
    - `PhotoUpload` artık dosya tipini (`image/*`) ve boyutunu (en fazla 8 MB) doğruluyor,
      uygun değilse `role="alert"` ile hata mesajı gösteriyor.
    - `components/CopyRecipeButton.tsx` eklendi: tarif başlığı + adımlarını panoya kopyalar,
      ana sayfadaki her tarif kartına bağlandı.
    - **Favoriler sayfası:** `/favorites` route'u eklendi, tüm yıldızlanmış tarifleri listeler
      (kopyalama ve favoriden çıkarma dahil), boş durumda yönlendirici bir mesaj gösterir.
      `EQUIPMENT_LABELS` bu sayfada da kullanılabilsin diye `EquipmentSelector.tsx`'ten
      `lib/redux/equipmentSlice.ts`'e taşındı. `NavBar`'a link eklendi.
    - **Ücretsiz mod sayacı artık 24 saatte bir otomatik sıfırlanıyor:**
      `usageCounterSlice`'a `lastResetAt` alanı eklendi (`USAGE_RESET_INTERVAL_MS` = 24 saat);
      `StoreProvider` mount olduğunda süre dolmuşsa sayacı sıfırlıyor. `localUsageStorage.ts`
      eski (düz sayı) formatı geriye dönük olarak da okuyabiliyor.
    - **Tarif arama geçmişi:** `lib/redux/historySlice.ts` + `localHistoryStorage.ts` eklendi
      (apiKey/equipment ile aynı desende localStorage'da kalıcı, en fazla `MAX_HISTORY_ENTRIES`
      = 20 kayıt). Her başarılı istek geçmişe ekleniyor, ana sayfada `RecipeHistoryList` ile
      özetleniyor (tarih, ekipman, kişi sayısı, tarif başlıkları) ve temizlenebiliyor.
    - **Erişilebilirlik:** `EquipmentSelector`, `RecipeModeSelector`, `ApiKeyInput` sağlayıcı
      seçimi ve profil sayfasındaki dil seçimi artık `role="group"` + `aria-label` ile
      gruplandırılmış durumda.
    - **Görsel kimlik migrasyonu tamamlandı:** `app/profile/page.tsx` daha önce atlanmıştı
      (bkz. madde 8) — artık o da `zinc-*` yerine `DESIGN.md` token'larını kullanıyor.
    - **Firebase/Firestore — best-effort katman:** `firebase` paketi eklendi.
      `lib/firebase/config.ts`, `NEXT_PUBLIC_FIREBASE_*` env değişkenleri tanımlı değilse
      (henüz provizyon edilmedi) `null` döner — Gemini/Groq/YouTube'daki "anahtar yoksa sessizce
      atla" deseniyle aynı. Henüz gerçek bir auth sistemi olmadığı için (`lib/firebase/anonymousId.ts`)
      tarayıcı başına kalıcı bir anonim id kullanılıyor. `lib/firebase/favoritesSync.ts` favorileri
      best-effort push/pull ediyor; `StoreProvider` mount olduğunda bu cihazda favori yoksa
      Firestore'dan çekiyor, varsa Firestore'a yazıyor, sonraki her değişiklikte de senkronize
      ediyor. localStorage asıl kaynak olmaya devam ediyor, Firebase yapılandırılmadığında
      davranış değişmiyor (e2e testlerle doğrulandı). Gerçek bir Firebase projesiyle henüz
      denenmedi.
    - Tüm yeni parçalar için e2e testler eklendi: `e2e/photo-upload.spec.ts`,
      `e2e/copy-recipe.spec.ts`, `e2e/favorites-page.spec.ts`,
      `e2e/usage-counter-reset.spec.ts`, `e2e/recipe-history.spec.ts`.
12. ✅ **Birim test altyapısı + küçük UX iyileştirmeleri (2026-08-03):**
    - **Vitest eklendi:** Şimdiye kadar sadece Playwright e2e testleri vardı; artık saf
      fonksiyon/reducer'lar için hızlı birim testler de var (`vitest.config.mts`,
      `npm run test:unit`, CI'ye eklendi — bkz. `.github/workflows/ci.yml`).
      `lib/ai/buildRecipePrompt.ts`, `lib/ai/parseDataUrl.ts` ve `favoritesSlice`,
      `historySlice`, `usageCounterSlice`, `equipmentSlice` reducer'ları için testler yazıldı.
    - `npm audit fix` ile `brace-expansion` güvenlik uyarısı giderildi (Next.js'in kendi
      bağımlılık aralığı dışına çıkan majör sürüm yükseltmesi gerektiren uyarılar — Next.js
      middleware/Server Actions ile ilgili birkaç CVE — bilinçli olarak bu oturuma dahil
      edilmedi, ayrı ve dikkatli bir adım gerektiriyor).
    - **404 sayfası:** `app/not-found.tsx` eklendi, `DESIGN.md` paletiyle.
    - **Genel hata sınırı:** `app/error.tsx` eklendi, `DESIGN.md` paletiyle (`reset` ile
      "Tekrar dene").
    - **Favoriler sayfasında arama:** `/favorites`'e başlığa göre filtreleyen bir arama
      kutusu eklendi (Türkçe locale-aware, büyük/küçük harf duyarsız), eşleşme yoksa
      yönlendirici bir boş durum mesajı gösteriyor. e2e testle doğrulandı.
    - **Geçmişi temizle onayı:** `RecipeHistoryList`'teki "Geçmişi temizle" butonu artık
      `window.confirm` ile onay istiyor (öncesinde tek tıkla tüm arama geçmişi geri
      dönüşsüz siliniyordu). Onay/red iki durumu da e2e testle kapsandı.
    - Not: Bu oturumda geliştirme sunucusu Turbopack ile yeni bir route (page.tsx) derlerken
      `OneDrive\Masaüstü` yolundaki "ü" karakteri yüzünden `TurbopackInternalError` fırlattığı
      gözlemlendi (mevcut route'lar — `/`, `/favorites`, `/profile`, `/_not-found` — etkilenmedi,
      sorun sadece dev oturumu sırasında yeni eklenen bir test route'unda ortaya çıktı).
      Kod tarafında bir şey yapılmadı; ileride tekrar görülürse projeyi ASCII karakterli bir yola
      taşımak (ör. `C:\dev\ne-pisirsem`) kalıcı çözüm olabilir.

## Günlük commit rutini için notlar

- Her gün küçük, tek konuya odaklı, gerçek bir adım ekle (bir API route, bir bileşen, bir test —
  sahte/anlamsız commit yok).
- Commit mesajları ve kod Türkçe (bkz. `gunluk-commit-rutini` scheduled task kuralları).
- Push/PR açmadan önce her seferinde kullanıcının açık onayı gerekir.
