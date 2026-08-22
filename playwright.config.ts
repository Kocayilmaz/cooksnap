import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Next.js dev modunda ilk kez ziyaret edilen bir route (ör. /chat, /meal/[id])
  // Turbopack tarafindan istek anında derleniyor; 6 paralel worker ayni anda
  // farkli route'lari tetikleyince bu derleme varsayilan 5s'i asip
  // "click calisti ama toHaveURL zaman asimina ugradi" seklinde flaky
  // testlere yol aciyordu (navigasyon mantigi degil, dev-server yuku).
  expect: {
    timeout: 15000,
  },
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // e2e testleri gercek bir Firebase projesine (gelistiricinin kendi
    // .env.local'i) bagli olmamali — Google OAuth popup'lari headless
    // Playwright'ta tamamlanamaz ve e-posta/sifre ile gercek hesap
    // olusturmak gercek veriyi kirletir. process.env burada .env.local'den
    // once oncelikli oldugu icin bu degerler bos kalip Firebase her zaman
    // "yapilandirilmamis" (best-effort no-op) modda test edilir.
    //
    // MEALDB_API_KEY de ayni sebeple bos birakiliyor: Anasayfa artik
    // sunucu tarafinda TheMealDB'den kategori/tarif cekiyor (bkz.
    // app/page.tsx) — bu gercek bir dis servis, testler ona bagimli olursa
    // paralel worker'lar altinda yavaslayip zaman asimina takilabiliyor.
    // Key bossa lib/mealdb/client.ts hemen ProviderNotConfiguredError
    // firlatir, ilgili sayfalar best-effort bos/notFound ile devam eder.
    // Arama kutusu testleri zaten page.route ile /api/meals/search'u
    // taraycidan mock'luyor, bu degisiklikten etkilenmiyor.
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: "",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "",
      NEXT_PUBLIC_FIREBASE_APP_ID: "",
      MEALDB_API_KEY: "",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
