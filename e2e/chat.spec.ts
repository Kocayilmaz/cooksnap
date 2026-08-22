import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

test("chat fotoğraf, kişi sayısı ve ekipman seçimini gösterir", async ({ page }) => {
  await page.goto("/chat");

  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
  await expect(page.getByText("Fotoğraf yüklemek için tıkla")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeVisible();
});

test("kişi sayısı artı/eksi butonlarıyla değişir", async ({ page }) => {
  await page.goto("/chat");

  const increment = page.getByRole("button", { name: "Kişi sayısını artır" });
  await increment.click();
  await increment.click();

  await expect(page.getByText("4", { exact: true })).toBeVisible();
});

test("tarif modu seçimi değiştirilebilir ve açıklama metni güncellenir", async ({ page }) => {
  await page.goto("/chat");

  await expect(page.getByText("Bulaşık kısıtı yok")).toBeVisible();

  await page.getByRole("button", { name: "Öğrenci" }).click();
  await expect(page.getByText("En az bulaşık çıkaran")).toBeVisible();

  await page.getByRole("button", { name: "Aşçı" }).click();
  await expect(page.getByText("elit/profesyonel şef")).toBeVisible();
});

test("tarif butonu fotoğraf seçilene kadar devre dışı kalır", async ({ page }) => {
  await page.goto("/chat");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();
});

test("genişletilmiş ekipman seçenekleri gösterilir ve toggle edilebilir", async ({ page }) => {
  await page.goto("/chat");

  const airfryer = page.getByRole("button", { name: "Airfryer" });
  await expect(airfryer).toBeVisible();
  await expect(airfryer).toHaveAttribute("aria-pressed", "false");
  await airfryer.click();
  await expect(airfryer).toHaveAttribute("aria-pressed", "true");

  await expect(page.getByRole("button", { name: "Mikrodalga" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Düdüklü Tencere" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tost Makinesi" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Izgara" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yavaş Pişirici" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wok" })).toBeVisible();
});

test("ekipman seçimi sayfa yenilenince kalıcı kalır", async ({ page }) => {
  await page.goto("/chat");

  const airfryer = page.getByRole("button", { name: "Airfryer" });
  const pot = page.getByRole("button", { name: "Tencere", exact: true });

  await airfryer.click();
  await pot.click();

  await page.reload();

  await expect(page.getByRole("button", { name: "Airfryer" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Tencere", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("sadece malzeme metni girilse bile tarif butonu etkinleşir", async ({ page }) => {
  await page.goto("/chat");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, peynir");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeEnabled();
});

test("sadece metinle gönderildiğinde fotoğraf tanıma atlanıp doğrudan Groq yapılandırma hatası gösterilir", async ({
  page,
}) => {
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, peynir");
  await page.getByRole("button", { name: "Tarifi getir" }).click();

  await expect(page.getByText("GROQ_API_KEY tanımlı değil.")).toBeVisible();
});

test("fotoğraf seçilip gönderildiğinde AI yapılandırma hatası kullanıcıya gösterilir", async ({ page }) => {
  await page.goto("/chat");

  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(tinyPngBase64, "base64"),
    });

  await page.getByRole("button", { name: "Tarifi getir" }).click();

  await expect(page.getByText("GEMINI_API_KEY tanımlı değil.")).toBeVisible();
});
