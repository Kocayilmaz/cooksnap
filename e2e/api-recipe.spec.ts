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

test("POST /api/recipe gecersiz mode degerinde 400 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      photoDataUrl: "data:image/png;base64,AAAA",
      personCount: 2,
      equipment: ["oven"],
      mode: "gourmet",
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
      mode: "home",
    },
  });

  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body.error).toContain("GEMINI_API_KEY");
});

test("POST /api/recipe gecersiz premiumProvider degerinde 400 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      ingredientsText: "2 yumurta",
      personCount: 2,
      equipment: ["oven"],
      mode: "home",
      premiumProvider: "gemini",
      premiumApiKey: "test-key",
    },
  });

  expect(response.status()).toBe(400);
});

test("POST /api/recipe premiumProvider olup premiumApiKey olmayinca 400 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      ingredientsText: "2 yumurta",
      personCount: 2,
      equipment: ["oven"],
      mode: "home",
      premiumProvider: "claude",
    },
  });

  expect(response.status()).toBe(400);
});

test("POST /api/recipe premiumApiKey olup premiumProvider olmayinca 400 doner", async ({ request }) => {
  const response = await request.post("/api/recipe", {
    data: {
      ingredientsText: "2 yumurta",
      personCount: 2,
      equipment: ["oven"],
      mode: "home",
      premiumApiKey: "test-key",
    },
  });

  expect(response.status()).toBe(400);
});
