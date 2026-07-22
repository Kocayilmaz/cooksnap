import { test, expect } from "@playwright/test";

test("ana sayfa fotoğraf, kişi sayısı ve ekipman seçimini gösterir", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
  await expect(page.getByText("Fotoğraf yüklemek için tıkla")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeVisible();
});

test("kişi sayısı artı/eksi butonlarıyla değişir", async ({ page }) => {
  await page.goto("/");

  const increment = page.getByRole("button", { name: "Kişi sayısını artır" });
  await increment.click();
  await increment.click();

  await expect(page.getByText("4", { exact: true })).toBeVisible();
});

test("tarif modu seçimi değiştirilebilir ve açıklama metni güncellenir", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Bulaşık kısıtı yok")).toBeVisible();

  await page.getByRole("button", { name: "Öğrenci" }).click();
  await expect(page.getByText("En az bulaşık çıkaran")).toBeVisible();

  await page.getByRole("button", { name: "Aşçı" }).click();
  await expect(page.getByText("elit/profesyonel şef")).toBeVisible();
});

test("tarif butonu fotoğraf seçilene kadar devre dışı kalır", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();
});

test("sadece malzeme metni girilse bile tarif butonu etkinleşir", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, peynir");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeEnabled();
});

test("sadece metinle gönderildiğinde fotoğraf tanıma atlanıp doğrudan Groq yapılandırma hatası gösterilir", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, peynir");
  await page.getByRole("button", { name: "Tarifi getir" }).click();

  await expect(page.getByText("GROQ_API_KEY tanımlı değil.")).toBeVisible();
});

test("fotoğraf seçilip gönderildiğinde AI yapılandırma hatası kullanıcıya gösterilir", async ({ page }) => {
  await page.goto("/");

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
