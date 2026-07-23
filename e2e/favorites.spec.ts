import { test, expect } from "@playwright/test";

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

test("tarif favorilere eklenip çıkarılabilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await submitWithPhoto(page);

  const favoriteButton = page.getByRole("button", { name: "Favorilere ekle" });
  await expect(favoriteButton).toBeVisible();
  await expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

  await favoriteButton.click();
  await expect(page.getByRole("button", { name: "Favorilerden çıkar" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("favori durumu sayfa yenilenince kalıcı kalır", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await submitWithPhoto(page);

  await page.getByRole("button", { name: "Favorilere ekle" }).click();
  await page.reload();
  await submitWithPhoto(page);

  await expect(page.getByRole("button", { name: "Favorilerden çıkar" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
