# NePişirsem

Elindeki yemeği (çiğ malzeme ya da hazır/dondurulmuş ürün) fotoğraflayınca, kaç kişilik ve
hangi araçla (fırın / tava / tencere) pişireceğine göre AI'nın tarif önerdiği bir uygulama.

## Fikir

1. Fotoğraf yükle — çiğ malzeme (örn. köfte harcı) veya paketli/hazır ürün (örn. dondurulmuş lazanya).
2. Kaç kişilik olduğunu seç.
3. Elindeki pişirme araçlarını işaretle (fırın / tava / tencere).
4. AI ürünü tanır, seçilen araçlara göre kişi sayısına ölçeklenmiş tarif(ler) döner.

## AI motoru — çoklu sağlayıcı, ücretsiz + premium

- **Ücretsiz mod (varsayılan):** Gemini (görsel tanıma) + Groq (tarif metni), kullanıcı başına
  limitli (rate limit).
- **Premium mod:** Kullanıcı kendi Claude veya OpenAI API key'ini girerse limit kalkar, daha
  kaliteli çıktı alır. Key hiçbir zaman sunucuda saklanmaz, sadece tarayıcıda tutulur.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Redux Toolkit
- **Backend:** Next.js API routes (Gemini / Groq / Claude / OpenAI çağrıları)
- **Veri:** Firebase (Firestore) — favori tarifler + ücretsiz mod kullanım sayacı
- **Test:** Playwright (e2e — fotoğraf yükle → tarif al akışı)
- **CI/CD:** GitHub Actions → Vercel

## Durum

Proje henüz iskelet aşamasında; özellikler günlük küçük commit'lerle geliştiriliyor.

## Geliştirme

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresinde açılır.
