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
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // e2e testleri gercek bir Firebase projesine (gelistiricinin kendi
    // .env.local'i) bagli olmamali — Google/Apple OAuth popup'lari headless
    // Playwright'ta tamamlanamaz ve e-posta/sifre ile gercek hesap
    // olusturmak gercek veriyi kirletir. process.env burada .env.local'den
    // once oncelikli oldugu icin bu degerler bos kalip Firebase her zaman
    // "yapilandirilmamis" (best-effort no-op) modda test edilir.
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: "",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "",
      NEXT_PUBLIC_FIREBASE_APP_ID: "",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
