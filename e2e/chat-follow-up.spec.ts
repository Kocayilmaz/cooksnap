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
  // Baslik hem "Eski sohbetler" sidebar onizlemesinde hem de tarif kartinda
  // gorunuyor, bu yuzden .last() ile ana akistaki karti hedefliyoruz.
  await expect(page.getByText("Ispanaklı Omlet", { exact: true }).last()).toBeVisible();

  const followUpInput = page.getByPlaceholder("Ek bir şey sor ya da malzeme ekle…");
  await expect(followUpInput).toBeVisible();
  await followUpInput.fill("biraz da domates ekleyebilir miyim?");
  await page.getByRole("button", { name: "Gönder" }).click();

  await expect(page.getByText("biraz da domates ekleyebilir miyim?")).toBeVisible();
  await expect(page.getByText("Domatesli Ispanaklı Omlet", { exact: true })).toBeVisible();
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
