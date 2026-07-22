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

## Ekran yapısı ve gezinme (2026-07-22 kullanıcı notu — henüz uygulanmadı)

Uygulama 3 ana ekrandan oluşacak (şu anki tek sayfalık form akışı bu yapıya evrilecek):

1. **Login ekranı:** Login formu ortada (mevcut basit merkez kart yerleşimi zaten buna uygun).
2. **Profil ekranı:** Ad soyad, premium API anahtarları (Claude/OpenAI) burada girilir, dil
   seçeneği burada ayarlanır, "Need help?" bölümü, logout ve delete account seçenekleri, ayrıca
   bir "ülke" alanı — seçilen ülkenin mutfağından tarifler öncelikli önerilir ama bu kesin bir
   kısıtlama/filtre değil, genel bir eğilim.
3. **Chat ekranı:** Tasarım Claude'un kendi chat arayüzüne benzeyecek — solda üstte "New" butonu,
   altında "Favoriler" ve kullanıcının kendi gruplandırabildiği favori chat'ler, altında geçmiş
   chat listesi. Yeni bir tarif chat'i başlatıldığında ana alan bugünkü ana sayfadaki form
   (fotoğraf yükleme + kişi sayısı + ekipman seçimi) ile açılır.

## Görsel kimlik notu (2026-07-22)

Renk paleti Liferando, Trendyol Yemek ve Nefis Yemek Tarifleri gibi sitelerdeki canlı/vibrant
renklerden ilham alacak (şu anki nötr zinc paleti yerine). Uygulamaya geçmeden önce `DESIGN.md`
tarzı bir palet kararı çıkar.

## Backlog (henüz planlanmadı, ileride ele alınacak)

1. **Tarif videosu:** Tarif sonucunda ilgili YouTube tarif videosunu uygulama içinde (embed) göster.
2. **3 tarif modu:** Kullanıcı tarif isterken mod seçebilsin:
   - **Öğrenci modu:** en az bulaşık çıkaran, en kolay tarifler.
   - **Ev yemeği modu:** bulaşık kısıtı yok, en lezzetli/bilindik ev yemeği tarifleri.
   - **Aşçı modu:** en lezzetli, elit/profesyonel şef tarifleri.
3. **Fotoğrafsız kullanım:** Fotoğraf yüklemek zorunlu olmasın; kullanıcı elindeki malzemeleri
   yazıyla da girebilsin.
4. **Fotoğraf + yazı birlikte:** İkisi aynı anda da kullanılabilsin (hem fotoğraf hem metin girişi
   aynı istekte birleştirilebilsin).

## Günlük commit rutini için notlar

- Her gün küçük, tek konuya odaklı, gerçek bir adım ekle (bir API route, bir bileşen, bir test —
  sahte/anlamsız commit yok).
- Commit mesajları ve kod Türkçe (bkz. `gunluk-commit-rutini` scheduled task kuralları).
- Push/PR açmadan önce her seferinde kullanıcının açık onayı gerekir.
