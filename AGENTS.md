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

13. ✅ **Birim test kapsami genisletildi (2026-08-04):** Vitest altyapisi zaten vardi (bkz. madde 12);
    bugun eksik kalan tum reducer'lar ve localStorage yardimci modulleri icin testler eklendi:
    - `apiKeySlice`, `personCountSlice` (kisi sayisi kirpma sinirlarindaki edge case'ler dahil),
      `recipeModeSlice`, `userProfileSlice` icin reducer testleri.
    - `localApiKeyStorage`, `localUserProfileStorage`, `localEquipmentStorage`,
      `localFavoritesStorage`, `localUsageStorage` (eski duz-sayi formatinin geriye donuk okunmasi
      dahil) ve `localHistoryStorage` icin roundtrip + bozuk/gecersiz veri korumasi testleri
      (`vi.stubGlobal("window", ...)` ile localStorage mock'lanarak, `vitest.config.mts`'teki
      `environment: "node"` ayari degistirilmeden).
    - Artik `lib/redux/` altindaki her slice ve her localStorage yardimcisinin kendi test dosyasi
      var (toplam 77 birim test, 16 dosya). `npm run test:unit` ve lint/tsc temiz.

14. ✅ **Birim test kapsami AI/Firebase katmanina genisletildi + kucuk erisilebilirlik/perf
    duzeltmeleri (2026-08-06):**
    - `lib/firebase/anonymousId.ts`, `lib/ai/youtube.ts` (`findRecipeVideoId`),
      `lib/ai/providers.ts` (`recognizeFoodItem`, `generateRecipes`) ve
      `lib/firebase/favoritesSync.ts` icin birim testler eklendi — `fetch`/`firebase/firestore`
      `vi.stubGlobal`/`vi.mock` ile taklit edilerek yapilandirma eksikligi, istek hatasi, gecersiz
      yanit ve best-effort hata yutma yollari kapsandi (`favoritesSync.test.ts` ag/izin hatasinin
      `pushFavoritesToFirestore`/`pullFavoritesFromFirestore`'dan disari sizmadigini dogruluyor).
      Artik `lib/` altinda test yazilmamis pure/best-effort modul kalmadi (toplam birim test
      sayisi 106, 20 dosya).
    - **Erisilebilirlik:** `IngredientTextInput`'taki gorsel `<span>` etiketi gercek bir
      `<label htmlFor>` + textarea `id` ikilisine baglandi (once ekran okuyucuya baglanmiyordu).
      `ApiKeyInput`'taki sifre alanina `aria-label` eklendi (sadece placeholder'a dayaniyordu).
      `NavBar`'daki aktif linke `aria-current="page"` eklendi. Ana sayfadaki tarif sonucu/hata
      bolgesi `aria-live="polite"` ile sarmalandi, boylece istek tamamlaninca ekran okuyucu yeni
      icerigi otomatik duyuruyor.
    - **Kucuk performans duzeltmesi:** `RecipeVideoEmbed`'teki YouTube iframe'ine `loading="lazy"`
      eklendi.
    - Tum degisiklikler sonrasi `npm run lint`, `npx tsc --noEmit`, `npm run test:unit` (106/106)
      ve `npx playwright test` (36/36) calistirildi, hepsi temiz.

15. ✅ **Metadata/SEO altyapisi + kucuk UX/altyapi adimlari (2026-08-07):**
    - **`.env.example` eklendi:** Kodda kullanilan tum ortam degiskenleri (GEMINI/GROQ/CLAUDE/OPENAI
      key/model, YOUTUBE_API_KEY, NEXT_PUBLIC_FIREBASE_*) belgelendi; `.gitignore`'daki `.env*`
      kurali bunu da kapsadigi icin `!.env.example` istisnasi eklendi.
    - **`.nvmrc` eklendi:** CI'daki (`node-version: 20`) ile ayni surumu lokal gelistirmeye de sabitler.
    - **Next.js metadata route'lari:** `app/robots.ts`, `app/sitemap.ts` (`/`, `/profile`, `/favorites`)
      ve `app/manifest.ts` (DESIGN.md'deki brand-orange/surface-warm renkleriyle) eklendi. Hepsi
      icin ortak site origin'i `lib/siteUrl.ts`'ten geliyor (`NEXT_PUBLIC_SITE_URL` ile override
      edilebilir, varsayilan Vercel proje URL'i).
    - **`app/layout.tsx` metadata'si zenginlestirildi:** `metadataBase`, `openGraph`, `twitter`,
      `keywords` eklendi — README'deki "may be shared publicly" notuna uygun olarak paylasilinca
      dogru baslik/aciklama/kart gostersin diye.
    - **`app/icon.tsx` eklendi:** `next/og` `ImageResponse` ile kod-uretimli, brand-orange renkli
      32x32 favicon; scaffold'dan kalan varsayilan `favicon.ico` yerine.
    - **`PhotoUpload`'a fotograf kaldirma butonu eklendi:** Onceden secilen fotografi degistirmenin
      tek yolu baska bir dosya secmekti; artik onizleme uzerinde bir X butonuyla secim temizlenip
      `onPhotoSelected(null)` tetikleniyor (`ApiKeyInput`'taki "Temizle" desenine benzer). e2e testle
      dogrulandi (`e2e/photo-upload.spec.ts`).
    - **`buildRecipeText` disariya acildi:** Once `CopyRecipeButton.tsx` icinde export edilmeyen bir
      saf fonksiyondu; `lib/formatRecipeText.ts`'e tasinip diger `lib/` saf fonksiyonlariyla
      (`buildRecipePrompt`, `parseDataUrl`) ayni desende test edildi (`lib/formatRecipeText.test.ts`).
    - **Denenip geri alinan adim — `app/loading.tsx`:** `error.tsx`/`not-found.tsx` ile ayni desende
      global bir yukleme iskeleti eklendi, ancak route seviyesindeki Suspense boundary'si
      `StoreProvider`'in mount-sonrasi localStorage rehydration effect'iyle (bkz. yukaridaki
      "Ekran yapisi ve gezinme" notundaki hydration aciklamasi) celisti: sayfa reload edildiginde
      equipment/dil gibi kalici state'ler geri gelmiyordu. `e2e/home.spec.ts` ve `e2e/profile.spec.ts`
      icindeki "sayfa yenilenince kalici kalir" testleri bunu yakaladi (dosya varken kirmizi,
      kaldirilinca yesil), bu yuzden commit geri alindi. Global loading skeleton fikri gecerli ama
      bu StoreProvider deseniyle uyumlu calisan ayri bir cozum gerektiriyor.
    - Tum degisiklikler sonrasi `npm run lint`, `npm run build`, `npm run test:unit` (109/109) ve
      `npm run test:e2e` (37/37) calistirildi, hepsi temiz. Kullanicinin acik onayiyla `origin/master`'a
      pushlandi.

16. ✅ **API anahtari rehberi + Premium mod'a Gemini/Groq eklendi (2026-08-09):** `components/HelpSection.tsx`'e
    API anahtari alma SSS'i ve `public/api-key-rehberi.pdf` (dort saglayici icin gercek ekran
    goruntuleriyle adim adim rehber) eklendi. Ayrica Premium mod artik sadece Claude/OpenAI degil,
    Gemini ve Groq'u da destekliyor (`lib/ai/geminiProvider.ts`, `lib/ai/groqProvider.ts`,
    `apiKeySlice.ts`, `route.ts` dispatch) — kullanici kendi Gemini/Groq anahtarini da profil
    sayfasindan girebiliyor, sunucu tarafindaki `.env.local` (ucretsiz mod) hala ayrica duruyor.
    Groq metin tabanli oldugu icin fotografla birlikte seciliyorsa 400 donuyor. 109 unit + 38 e2e
    test temiz, `origin/master`'a pushlandi.

## Planlanan (henuz uygulanmadi) — Firebase Auth + cihazlar arasi API key senkronu

Kullanicinin 2026-08-09'da onayladigi yon: gercek bir login sistemi (Firebase Auth) kurulacak,
boylece kullanicilar farkli cihaz/tarayicidan giris yapinca Premium mod anahtarlarini tekrar
girmek zorunda kalmayacak (su an anahtar sadece `localStorage`'da — ayni tarayicida kalici ama
cihaz degisince kaybolur).

**Kritik tasarim karari:** Anahtarlar Firestore'a **sunucunun cozebilecegi** bir sekilde (orn.
sunucudaki bir env degiskeniyle sifrelenerek) DEGIL, **sadece tarayicida** sifrelenip oyle
yazilacak (orn. Web Crypto API ile, sifreleme anahtari kullanicinin kendi parolasindan turetilir,
sunucuya hic gonderilmez). Boylece sunucu/Firestore ele gecirilse bile hicbir kullanicinin API
anahtari cozulemez — bugunku "anahtar hic sunucuya gitmiyor" guvenlik ilkesi ozde korunmus olur,
sadece cihazlar arasi senkron eklenmis olur. Sunucu tarafinda cozulebilir sifreleme (tek noktadan
sizinca herkesin anahtari acik olur) kullanilmayacak.

17. ✅ **Login ekrani (2026-08-09):** `app/login/page.tsx` eklendi — e-posta/sifre ile giris/kayit
    formu, DESIGN.md paletiyle, mod (giris/kayit) toggle'i. `lib/firebase/auth.ts`
    (`signUpWithEmail`, `signInWithEmail`, `signOutUser`, `subscribeToAuthState`) `lib/firebase/config.ts`'teki
    "env degiskeni yoksa null don" desenini izliyor; Firebase yapilandirilmamisken form gorunur
    ama gonder butonu devre disi kalip kullaniciya bir uyari gosteriliyor. `lib/redux/authSlice.ts`
    (`uid`/`email`/`status`) eklendi, `StoreProvider` mount olunca `subscribeToAuthState` ile
    baglaniyor (yapilandirilmamissa hemen "unauthenticated"e duser, "loading"de takili kalmaz).
    `NavBar` giris durumuna gore "Giris yap" linki ya da e-posta + "Cikis yap" gosteriyor. e2e
    (`e2e/login.spec.ts`) ve unit testlerle (`authSlice.test.ts`) dogrulandi; `npm run lint`,
    `npx tsc --noEmit`, `npm run build`, `npm run test:unit` (112/112) ve `npx playwright test`
    (41/41) hepsi temiz. Tarayicida manuel de dogrulandi (giris/kayit toggle, NavBar linki).
    **Not:** gercek bir Firebase projesi henuz provizyon edilmedi (`.env.local` yok) — bu yuzden
    formun kendisi calisir ama gercek bir giris/kayit henuz denenmedi. Sirada: kullanici gercek
    bir Firebase projesi olusturup Email/Password auth'u etkinlestirip `.env.local`'e
    `NEXT_PUBLIC_FIREBASE_*` degerlerini girdikten sonra uctan uca test, ardindan yukaridaki
    kritik tasarim kararina gore API key'in sifrelenip Firestore'a senkronize edilmesi
    (`lib/crypto/` + login sirasinda girilen parolayla turetilen anahtar).

18. ✅ **Login ekrani gorsel yenilemesi (2026-08-09):** Kullanicinin verdigi bir referans tasarima
    (kayan/animasyonlu split-panel giris-kayit karti, ortada donen gradient daire) gore
    `app/login/page.tsx` + yeni `app/login/AuthSwitch.module.css` ile yeniden tasarlandi — mor yerine
    mevcut marka renkleri (`--brand-orange` → `--brand-red` gradient) kullanildi, DESIGN.md'ye yeni
    bir ton eklenmedi. Referans orneginde bulunan Google/Facebook/Twitter/LinkedIn sosyal giris
    ikonlari **bilincli olarak eklenmedi** — hicbiri gercek bir OAuth entegrasyonuna baglanmayacakti
    ve projenin "gercek islevi olmayan sahte buton eklenmez" ilkesine (bkz. bu dosyanin basindaki
    "Login ekrani" notu) aykiri dusuyordu. Ikonlar icin emoji yerine `lucide-react` eklendi (proje
    ilk kez bir ikon kutuphanesi kullaniyor). Iki form (giris/kayit) animasyon icin ayni anda DOM'da
    duruyor; aktif olmayani hem ekran okuyucudan hem klavye odagindan gizlemek icin `aria-hidden`
    + `inert` kullanildi (React 19/Next 16 `inert` prop'unu native destekliyor). e2e testler
    (`e2e/login.spec.ts`) bu yuzden aktif forma `form:not([aria-hidden="true"])` ile scope oluyor —
    `getByLabel`/`getByPlaceholder` gibi DOM-tabanli sorgular `aria-hidden`'i gormezden geldigi icin
    scope olmadan iki eslesme donup testi kirar, sadece `getByRole` erisilebilirlik agacini kullanir.
    `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:unit` (112/112) ve
    `npx playwright test` (41/41) hepsi temiz; tarayicida hem acik hem koyu modda, masaustu ve mobil
    genislikte elle de dogrulandi (animasyonlu gecis calisiyor).

19. ✅ **Karanlik mod tamamen kaldirildi (2026-08-09):** Kullanici acikca "karanlik mod diye bir sey
    olmasin" dedi — sadece login ekranini degil, tum uygulamayi kapsayacak sekilde. `app/globals.css`'teki
    `@media (prefers-color-scheme: dark)` `:root` override'i silindi; `app/`, `components/` altindaki
    tum `dark:*` Tailwind siniflari (17 dosya) kaldirildi. DESIGN.md guncellendi (bkz. "Do's/Don'ts" —
    artik `dark:*` sinifi eklenmemeli). **Dikkat:** ilk denemede toplu `sed` komutu tum dosyalarin
    girinti/bosluk formatini bozdu (sadece `dark:` degil, her cift-bosluk ve tirnak-oncesi-bosluk
    kaldirildi); commit edilmeden fark edilip `git checkout --` ile geri alindi, ikinci denemede sadece
    `" dark:token"` deseni hedeflenerek guvenli sekilde uygulandi. `npm run lint`, `npx tsc --noEmit`,
    `npm run build`, `npm run test:unit` (112/112) ve `npx playwright test` (41/41) temiz; tarayicida
    sistem karanlik modu acikken ana sayfa/profil/login sayfalari elle kontrol edildi, hicbir yerde
    koyu yuzey kalmadigi dogrulandi.

20. ✅ **Site geneli erisim kapisi + Google/Facebook girisi + misafir modu (2026-08-09):** Kullanicinin
    talebi: `/login` disindaki hicbir sayfa giris yapilmadan acilmayacak. `components/AuthGate.tsx`
    eklendi (`app/layout.tsx`'te `StoreProvider`'in icinde, `NavBar`'in yerine gecti — NavBar artik
    AuthGate tarafindan kosullu render ediliyor): `authSlice.status === "loading"` iken bosluk/spinner
    gosterir (redirect kararini erken vermemek icin), `/login` disinda giris yapilmamis VE misafir
    degilse `/login`'e, `/profile` veya `/favorites`'e misafir modundayken bile erisilirse yine
    `/login`'e yonlendirir (bu iki route sadece gercek girise ozel — bkz. "Kritik tasarim karari"
    yukarida, favoriler/profil kullanici hesabina bagli).
    - **Misafir modu ("Simdilik atla"):** `lib/redux/guestModeSlice.ts` + `localGuestModeStorage.ts`
      (diger tercihlerle ayni localStorage deseni, `StoreProvider`'a baglandi). Login sayfasinin
      altinda `Şimdilik atla` linki `setGuestMode(true)` dispatch edip `/`'e yonlendiriyor. Misafir
      modunda sadece ana sayfa acik; `NavBar` da bu duruma gore Favoriler/Profil linklerini hic
      gostermiyor (tiklaninca zaten geri atilacagi icin).
    - **Google/Facebook ile giris:** `lib/firebase/auth.ts`'e `signInWithGoogle`/`signInWithFacebook`
      eklendi (`GoogleAuthProvider`/`FacebookAuthProvider` + `signInWithPopup`, diger fonksiyonlarla
      ayni `AuthResult` desenini kullanir). Login sayfasinda her iki formda da "Google ile devam et" /
      "Facebook ile devam et" butonlari var (ikonlar `lucide-react`'te olmadigi icin inline SVG).
      **Onemli:** bu butonlar Firebase projesi yapilandirilmadan (aynen e-posta/sifre gibi) devre disi
      kalir; Firebase yapilandirilsa bile Facebook girisi ayrica Firebase konsolunda bir Facebook
      Developer App ID/secret ile provider'in etkinlestirilmesini gerektirir — bu proje henuz o adima
      gelmedi, kod hazir ama gercek kimlik bilgileriyle denenmedi.
    - **e2e test kapsami degisti:** Artik `/` de dahil hemen hemen her sayfa korumali oldugu icin
      `e2e/helpers/guestMode.ts` (`page.addInitScript` ile `cooksnap:guestMode` localStorage'ini
      onceden yazan bir yardimci) eklendi ve ana sayfa akisini kullanan tum spec dosyalarina
      (`home`, `copy-recipe`, `favorites`, `photo-upload`, `recipe-history`, `usage-counter*`)
      `test.beforeEach` ile baglandi. `e2e/profile.spec.ts` ve `e2e/favorites-page.spec.ts` artik
      sayfa ICERIGINI degil, erisim kapisinin (`/login`'e yonlendirme) dogru calistigini test ediyor —
      gercek Firebase olmadan bu ortamda gercekten giris yapmak mumkun degil, o yuzden profil/favoriler
      sayfalarinin kendi icerigi gercek Firebase baglaninca yeniden e2e ile kapsanmali (eski testler
      git gecmisinde duruyor, referans alinabilir). `e2e/login.spec.ts`'e OAuth butonlarinin
      gorunurlugu/devre-disi-durumu ve "Simdilik atla" akisi icin yeni testler eklendi.
    - Tum degisiklikler sonrasi `npm run lint`, `npx tsc --noEmit`, `npm run build`,
      `npm run test:unit` (119/119) ve `npx playwright test` (41/41) temiz; tarayicida manuel olarak
      da dogrulandi (misafir modunda ana sayfa acik/profil-favoriler /login'e atiyor, temiz
      localStorage'da `/` direkt `/login`'e yonlendiriyor, NavBar misafir modunda sadece Ana
      Sayfa+Giris yap gosteriyor).

21. ✅ **Facebook yerine Apple ile giris (2026-08-10):** Kullanici Firebase konsolunda Facebook
    provider'ini kurarken (ayri bir Facebook Developer App ID/secret gerektirdigini gorunce) vazgecti
    — "facebook eklemeyelim" dedi, Firebase konsolundaki Facebook adimini iptal etti. `lib/firebase/auth.ts`'teki
    `signInWithFacebook`/`FacebookAuthProvider` kaldirildi. Ardindan kullanici Firebase konsolunda
    Apple provider'ini kendisi ekledi ("apple ile giriş ekledim onun yerine") — buna karsilik
    `signInWithApple` eklendi (`OAuthProvider("apple.com")` + `signInWithPopup`, `email`/`name`
    scope'lari istenir, diger fonksiyonlarla ayni `AuthResult` deseni). Login sayfasinda artik
    **Google ile devam et** + **Apple ile devam et** butonlari var (`AppleIcon` inline SVG,
    `FacebookIcon` silindi). e2e testi (`e2e/login.spec.ts`) Apple butonunu da kapsayacak sekilde
    guncellendi. Google/Apple ile giris hala gercek kimlik bilgileriyle denenmedi (Firebase projesi
    kurulum asamasinda — `.env.local` henuz doldurulmadi).

22. ✅ **Gercek Firebase projesi baglandi + favoriler senkronu gercek uid'ye gecirildi (2026-08-10):**
    Kullanici kendi Firebase projesini (`cooksnap-dbb54`) kurdu — Email/Password + Google + Apple
    auth, Standard-edition Firestore (Production mode, Avrupa bolgesi). Web app config'i verdi,
    `.env.local` dolduruldu (`NEXT_PUBLIC_FIREBASE_*`, 5 deger). **Onemli guvenlik duzeltmesi:**
    `lib/firebase/favoritesSync.ts` onceden `lib/firebase/anonymousId.ts`'teki sahte/dogrulanamayan
    bir "anonim id" ile Firestore'a yaziyordu (gercek auth eklenmeden onceki tasarimdan kalma) —
    artik gercek Firebase Auth `uid`'sini parametre olarak aliyor, boylece Firestore guvenlik
    kurallari (`firestore.rules`, `request.auth.uid == uid`) bunu dogrulayabiliyor. `anonymousId.ts`
    ve testi kullanilmadigi icin tamamen silindi. `StoreProvider.tsx`: Firestore pull/push artik
    sadece `subscribeToAuthState` gercek bir kullanici dondurdugunde (giris yapilmisken) calisiyor,
    misafir modunda hic tetiklenmiyor (zaten `firestore.rules` da `request.auth != null` istiyor,
    misafirin yazma denemesi izin hatasiyla sessizce yutulurdu, ama artik hic denenmiyor bile).
    `firestore.rules` projeye eklendi — kullanicinin Firebase konsolunda **Firestore → Rules**
    sekmesine yapistirmasi gerekiyor (henuz yapilmadi, varsayilan "tumunu reddet" kurali gecerli
    kaldigi surece favoriler senkronu izin hatasiyla best-effort sessizce basarisiz olur, uygulama
    kirilmaz). `npm run lint`, `npx tsc --noEmit`, `npm run test:unit` (114/114) temiz.

23. ✅ **Firestore Rules yayinlandi + uctan uca dogrulandi (2026-08-10):** Kullanici
    `firestore.rules` icerigini Firebase konsolunda Publish etti. Dogrulama icin:
    - Tarayicida gercek bir hesapla (`claude-test-cooksnap@example.com`) kayit olundu,
      giris → ana sayfa yonlendirmesi, `/profile` erisimi calisti (bkz. madde 22).
    - Kurallarin gercekten calistigini kanitlamak icin Identity Toolkit + Firestore REST
      API'lerine dogrudan `fetch` ile istek atildi (gercek bir ID token alinip): kullanicinin
      kendi `favorites/{kendi-uid}` dokumanina yazma **200 basarili**, baska bir uid'nin
      dokumanina (`favorites/someone-elses-uid`) yazma denemesi **403 PERMISSION_DENIED** —
      kurallar tam beklenen sekilde calisiyor. Test amacli yazilan dokuman hemen silindi
      (production verisinde kalici test verisi birakilmadi).
    - Test hesabi (`claude-test-cooksnap@example.com`) kullanici tarafindan Firebase
      konsolundan silindi.
    - **Google ile giris kullanicinin kendi tarayicisinda gercek tiklamayla denendi ve basarili
      oldu** (2026-08-10) — otomasyon tarayicisinda popup engellendigi icin (bkz. yukarida) bu
      adim kullanicinin kendi gerçek tarayicisinda dogrulandi. Login/Firebase entegrasyonu artik
      butunuyle uctan uca calisiyor: e-posta/sifre + Google ile giris, Firestore favori senkronu,
      guvenlik kurallari. Apple ile giris hala gercek tiklamayla denenmedi (buton aktif oldugu
      dogrulandi, ama Apple Developer Program kurulumu/test hesabi tarafi ayri, henuz denenmedi).

24. ⏳ **Apple ile giris hatasi + Vercel prod deploy sorunlari (2026-08-10, devam ediyor):**
    - **Apple ile giris kullanicinin kendi tarayicisinda gercek tiklamayla denendi ama hata verdi**
      ("Bir seyler ters gitti, tekrar dene" — eslesmeyen/bilinmeyen bir Firebase hata kodu).
      `lib/firebase/auth.ts`'teki `toTurkishErrorMessage`'in `default` dalina
      `console.error("Firebase auth hatasi:", error)` eklendi (commit `c01f7db`) — bir sonraki
      denemede devtools console'da gercek `auth/xxx` kodu gorunecek. **Sirada:** kullanici Apple'i
      tekrar deneyip console'daki hata kodunu paylasacak, ona gore teshis edilecek (muhtemelen
      Apple Developer Program'da Services ID/Team ID/Key ID/private key eksik/yanlis — Apple girisi
      Firebase'de Google'dan farkli olarak bu ek kurulumu gerektiriyor).
    - **Vercel'deki canli site (`cooksnap-git-master-enes-projects-112ef54c.vercel.app`,
      `ne-pisirsem-mu.vercel.app`) henuz calismiyor** — `.env.local` gitignore'da oldugu icin
      Vercel'in bu degerleri hic gormedigi ortaya cikti. Kullanici Vercel proje ayarlarinda
      **Environment Variables**'a 5 `NEXT_PUBLIC_FIREBASE_*` degiskenini eklemeye basladi, ama bir
      veri bozulmasi sorunu yasadi: `NEXT_PUBLIC_FIREBASE_API_KEY` degerini yapistirirken (muhtemelen
      tarayicinin sifre yoneticisi/otomatik doldurma eklentisi "Value" alanini parola alani sanip
      kendi maskeli degerini enjekte etti) gercek anahtar yerine `•` (nokta) karakterleri kaydedildi
      — canli sitede `auth/api-key-not-valid` hatasina yol acti. Oturum sonunda kullanici bu
      degiskeni "Production and Preview" kapsaminda yeniden ekliyordu, Value alani bu sefer dogru
      gorunuyordu ama **Key alani** "gecersiz karakter iceriyor" hatasi veriyordu (kopyala-
      yapistirdan bulasan gorunmez bir karakter olasi) — kullaniciya Key'i elle yazmasi soylendi.
      **Sirada:**
      1. Kullanicinin bu son kayit denemesinin basarili olup olmadigini dogrula.
      2. Vercel'deki 5 `NEXT_PUBLIC_FIREBASE_*` degiskeninin hepsinin (goz ikonuyla acip kontrol
         ederek) gercek/bozulmamis degerlere sahip oldugunu dogrula (sadece API_KEY degil, digerleri
         de ayni sekilde bozulmus olabilir, kontrol edilmedi).
      3. Vercel'de **Redeploy** tetikle.
      4. Firebase konsolu → **Authentication → Settings → Authorized domains**'e Vercel'in
         deployment domain'i (ve varsa custom domain) eklenmeli — henuz yapilmadi, yapilmazsa env
         degiskenleri dogru olsa bile Google/Apple girisi prod'da "unauthorized domain" hatasi verir.
      5. Canli sitede e-posta/sifre + Google girisini tekrar test et.

Bir sonraki oturumda buradan devam edilecek.

## Günlük commit rutini için notlar

- Her gün küçük, tek konuya odaklı, gerçek bir adım ekle (bir API route, bir bileşen, bir test —
  sahte/anlamsız commit yok).
- Commit mesajları ve kod Türkçe (bkz. `gunluk-commit-rutini` scheduled task kuralları).
- Push/PR açmadan önce her seferinde kullanıcının açık onayı gerekir.
