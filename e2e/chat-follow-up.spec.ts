import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

async function mockSequentialRecipeResponses(page: import("@playwright/test").Page) {
  let call = 0;
  await page.route("**/api/recipe", async (route) => {
    call += 1;
    const title = call === 1 ? "Ispanaklı Omlet" : "Domatesli Ispanaklı Omlet";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        recipes: [{ equipment: "pan", title, steps: ["Adım 1", "Adım 2"], videoId: null }],
      }),
    });
  });
}

test("ilk istekten sonra sohbet akisina gecilir ve takip mesaji gonderilebilir", async ({ page }) => {
  await mockSequentialRecipeResponses(page);
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, ıspanak");
  await page.getByRole("button", { name: "Tarifi getir" }).click();

  await expect(page.getByText("2 yumurta, ıspanak", { exact: true })).toBeVisible();
  // Baslik hem "Sohbetler" sidebar onizlemesinde hem de tarif kartinda
  // gorunuyor, bu yuzden .last() ile ana akistaki karti hedefliyoruz.
  await expect(page.getByText("Ispanaklı Omlet", { exact: true }).last()).toBeVisible();

  const followUpInput = page.getByPlaceholder("Ek bir şey sor ya da malzeme ekle…");
  await expect(followUpInput).toBeVisible();
  await followUpInput.fill("biraz da domates ekleyebilir miyim?");
  await page.getByRole("button", { name: "Gönder" }).click();

  await expect(page.getByText("biraz da domates ekleyebilir miyim?")).toBeVisible();
  await expect(page.getByText("Domatesli Ispanaklı Omlet", { exact: true })).toBeVisible();
});

test("takip mesaji sadece fotograf ekleyip metin yazmadan gonderilebilir", async ({ page }) => {
  await mockSequentialRecipeResponses(page);
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, ıspanak");
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Ispanaklı Omlet", { exact: true }).last()).toBeVisible();

  const sendButton = page.getByRole("button", { name: "Gönder" });
  await expect(sendButton).toBeDisabled();

  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  await page.locator('input[type="file"]').setInputFiles({
    name: "domates.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });

  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  await expect(page.getByText("Domatesli Ispanaklı Omlet", { exact: true })).toBeVisible();
});

test("takip mesajina resim olmayan dosya eklenince hata mesaji gosterilir", async ({ page }) => {
  await mockSequentialRecipeResponses(page);
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, ıspanak");
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Ispanaklı Omlet", { exact: true }).last()).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "notlar.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bu bir resim değil"),
  });

  await expect(page.getByText("Sadece resim dosyaları yüklenebilir")).toBeVisible();
});

test("takip mesajina 8MB'den buyuk dosya eklenince hata mesaji gosterilir", async ({ page }) => {
  await mockSequentialRecipeResponses(page);
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, ıspanak");
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Ispanaklı Omlet", { exact: true }).last()).toBeVisible();

  const oversized = Buffer.alloc(8 * 1024 * 1024 + 1, 1);
  await page.locator('input[type="file"]').setInputFiles({
    name: "buyuk-foto.png",
    mimeType: "image/png",
    buffer: oversized,
  });

  await expect(page.getByText("Dosya çok büyük. En fazla 8 MB yükleyebilirsin.")).toBeVisible();
});

test("yeni sohbet sohbet akisini kapatip formu geri gosterir", async ({ page }) => {
  await mockSequentialRecipeResponses(page);
  await page.goto("/chat");

  await page.getByPlaceholder("Örn: 2 yumurta, bir avuç ıspanak, biraz peynir").fill("2 yumurta, ıspanak");
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Adım 1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Yeni sohbet" }).click();

  await expect(page.getByText("Fotoğraf yüklemek için tıkla")).toBeVisible();
  // Tarif adimlari sadece sohbet akisindaki karta ait — sidebar gecmisi
  // (baslik onizlemesi) etkilenmeden akis kapanmis olmali.
  await expect(page.getByText("Adım 1", { exact: true })).toBeHidden();
});
