import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function mockRecipeResponse(page: import("@playwright/test").Page) {
  await page.route("**/api/recipe", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        recipes: [
          {
            equipment: "oven",
            title: "Fırında Sebzeli Tavuk",
            steps: ["Fırını ısıt", "Malzemeleri hazırla", "Pişir"],
            videoId: null,
          },
        ],
      }),
    });
  });
}

async function submitWithPhoto(page: import("@playwright/test").Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
}

test("basarili tarif istegi ChatSidebar'daki eski sohbetler listesine eklenir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");

  await expect(page.getByText("Eski sohbetler")).toBeHidden();

  await submitWithPhoto(page);

  await expect(page.getByText("Eski sohbetler")).toBeVisible();
  await expect(page.getByText("Fırında Sebzeli Tavuk", { exact: false }).last()).toBeVisible();
});

test("gecmis sayfa yenilenince kalicidir ve temizlenebilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");
  await submitWithPhoto(page);
  await expect(page.getByText("Eski sohbetler")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Eski sohbetler")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Temizle" }).click();
  await expect(page.getByText("Eski sohbetler")).toBeHidden();
  await expect(page.getByText("Henüz bir sohbet geçmişin yok.")).toBeVisible();
});

test("gecmisi temizle onay istemi reddedilirse gecmis silinmez", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");
  await submitWithPhoto(page);
  await expect(page.getByText("Eski sohbetler")).toBeVisible();

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Temizle" }).click();
  await expect(page.getByText("Eski sohbetler")).toBeVisible();
});
