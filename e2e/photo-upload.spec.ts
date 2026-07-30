import { test, expect } from "@playwright/test";

test("resim olmayan dosya yüklenince hata mesajı gösterilir", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[type="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bu bir resim değil"),
  });

  await expect(page.getByText("Sadece resim dosyaları yüklenebilir")).toBeVisible();
  await expect(page.getByText("Fotoğraf yüklemek için tıkla")).toBeVisible();
});

test("8MB'den büyük dosya yüklenince hata mesajı gösterilir", async ({ page }) => {
  await page.goto("/");

  const oversized = Buffer.alloc(8 * 1024 * 1024 + 1, 1);
  await page.locator('input[type="file"]').setInputFiles({
    name: "buyuk-foto.png",
    mimeType: "image/png",
    buffer: oversized,
  });

  await expect(page.getByText("Dosya çok büyük. En fazla 8 MB yükleyebilirsin.")).toBeVisible();
});
