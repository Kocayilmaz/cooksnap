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

test("sohbet '...' menüsünden sabitlenebilir ve yeniden adlandırılabilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");
  await submitWithPhoto(page);

  const sidebar = page.locator("aside");
  const row = sidebar.locator("li", { hasText: "Fırında Sebzeli Tavuk" });
  await expect(row).toBeVisible();

  await row.hover();
  await row.getByRole("button", { name: "Sohbeti sabitle" }).click();

  await expect(sidebar.getByText("Favoriler")).toBeVisible();
  await expect(row.getByRole("button", { name: "Sohbeti sabitlemeyi kaldır" })).toBeVisible();

  await row.hover();
  await row.getByRole("button", { name: "Sohbet seçenekleri" }).click();
  await page.getByRole("menuitem", { name: "Yeniden adlandır" }).click();

  const renameInput = page.getByRole("textbox", { name: "Sohbet başlığını düzenle" });
  await renameInput.fill("Pazar Kahvaltısı");
  await renameInput.press("Enter");

  await expect(sidebar.getByText("Pazar Kahvaltısı")).toBeVisible();
  await expect(sidebar.getByText("Fırında Sebzeli Tavuk")).toBeHidden();
});

test("sohbet '...' menüsündeki Sil ile silinebilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");
  await submitWithPhoto(page);

  const sidebar = page.locator("aside");
  const row = sidebar.locator("li", { hasText: "Fırında Sebzeli Tavuk" });
  await expect(row).toBeVisible();

  await row.hover();
  await row.getByRole("button", { name: "Sohbet seçenekleri" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("menuitem", { name: "Sil" }).click();

  await expect(sidebar.getByText("Fırında Sebzeli Tavuk")).toBeHidden();
  await expect(sidebar.getByText("Henüz bir sohbet geçmişin yok.")).toBeVisible();
});

test("Sil onayı reddedilirse sohbet silinmez", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");
  await submitWithPhoto(page);

  const sidebar = page.locator("aside");
  const row = sidebar.locator("li", { hasText: "Fırında Sebzeli Tavuk" });
  await expect(row).toBeVisible();

  await row.hover();
  await row.getByRole("button", { name: "Sohbet seçenekleri" }).click();

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("menuitem", { name: "Sil" }).click();

  await expect(sidebar.getByText("Fırında Sebzeli Tavuk")).toBeVisible();
});
