import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

async function mockMealSearch(page: import("@playwright/test").Page) {
  await page.route("**/api/meals/search*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        meals: [
          {
            id: "52771",
            name: "Spicy Arrabiata Penne",
            thumbnail: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            category: "Vegetarian",
            area: "Italian",
          },
        ],
      }),
    });
  });
}

test("arama kutusuna yazinca acilir listede sonuc gosterilir", async ({ page }) => {
  await mockMealSearch(page);
  await page.goto("/");

  await page.getByPlaceholder("Tarif, malzeme ara").fill("arrabiata");

  await expect(page.getByRole("link", { name: /Spicy Arrabiata Penne/ })).toBeVisible();
  await expect(page.getByText("Vegetarian · Italian")).toBeVisible();
});

test("sonuca tiklaninca tarif detay sayfasina gider", async ({ page }) => {
  await mockMealSearch(page);
  await page.goto("/");

  await page.getByPlaceholder("Tarif, malzeme ara").fill("arrabiata");
  await page.getByRole("link", { name: /Spicy Arrabiata Penne/ }).click();

  await expect(page).toHaveURL(/\/meal\/52771$/);
});

test("sonuc bulunamayinca Chat'e yonlendiren not gosterilir", async ({ page }) => {
  await page.route("**/api/meals/search*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"meals":[]}' });
  });
  await page.goto("/");

  await page.getByPlaceholder("Tarif, malzeme ara").fill("menemen");

  await expect(page.getByText('"menemen" için sonuç bulunamadı.')).toBeVisible();
  const chatLink = page.getByRole("link", { name: "Chat'te AI'dan bu tarifi iste →" });
  await expect(chatLink).toBeVisible();

  await chatLink.click();
  await expect(page).toHaveURL(/\/chat$/);
});

test("2 karakterden kisa sorguda arama yapilmaz", async ({ page }) => {
  let requested = false;
  await page.route("**/api/meals/search*", async (route) => {
    requested = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"meals":[]}' });
  });
  await page.goto("/");

  await page.getByPlaceholder("Tarif, malzeme ara").fill("a");
  await page.waitForTimeout(500);

  expect(requested).toBe(false);
});
