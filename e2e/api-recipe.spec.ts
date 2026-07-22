import { test, expect } from "@playwright/test";

test("POST /api/recipe eksik alanlarda 400 döner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: { personCount: 2 },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBeTruthy();
});

test("POST /api/recipe gecersiz equipment degerinde 400 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      photoDataUrl: "data:image/png;base64,AAAA",
      personCount: 2,
      equipment: ["microwave"],
    },
  });

  expect(response.status()).toBe(400);
});

test("POST /api/recipe gecerli govdede AI saglayici yapilandirilmamissa 503 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      photoDataUrl: "data:image/png;base64,AAAA",
      personCount: 2,
      equipment: ["oven"],
    },
  });

  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body.error).toContain("GEMINI_API_KEY");
});
