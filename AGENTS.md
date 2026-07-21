<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NePişirsem

Fotoğraftan yemek/ürün tanıyıp, kaç kişilik ve hangi araçla (fırın/tava/tencere) pişirileceğine
göre AI ile tarif öneren bir uygulama. Detaylı fikir ve mimari için `README.md`.

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

## Günlük commit rutini için notlar

- Her gün küçük, tek konuya odaklı, gerçek bir adım ekle (bir API route, bir bileşen, bir test —
  sahte/anlamsız commit yok).
- Commit mesajları ve kod Türkçe (bkz. `gunluk-commit-rutini` scheduled task kuralları).
- Push/PR açmadan önce her seferinde kullanıcının açık onayı gerekir.
