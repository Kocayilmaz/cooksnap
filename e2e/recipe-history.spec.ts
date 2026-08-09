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

test("basarili tarif istegi son aramalar listesine eklenir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");

  await expect(page.getByText("Son aramalar")).toBeHidden();

  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();

  await expect(page.getByText("Son aramalar")).toBeVisible();
  await expect(page.getByText("Fırında Sebzeli Tavuk", { exact: false }).last()).toBeVisible();
});

test("gecmis sayfa yenilenince kalicidir ve temizlenebilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Son aramalar")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Son aramalar")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Geçmişi temizle" }).click();
  await expect(page.getByText("Son aramalar")).toBeHidden();
});

test("gecmisi temizle onay istemi reddedilirse gecmis silinmez", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await expect(page.getByText("Son aramalar")).toBeVisible();

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Geçmişi temizle" }).click();
  await expect(page.getByText("Son aramalar")).toBeVisible();
});
