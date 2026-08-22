import { afterEach, describe, expect, it, vi } from "vitest";
import { translateFoodQueryToEnglish, translateMealToTurkish } from "./groqTranslate";
import { ProviderNotConfiguredError, ProviderRequestError } from "./providers";
import type { MealDetail } from "@/lib/types/meal";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function groqResponse(content: string) {
  return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
}

const sampleMeal: MealDetail = {
  id: "1",
  name: "Spicy Arrabiata Penne",
  thumbnail: "https://www.themealdb.com/images/media/meals/example.jpg",
  category: "Vegetarian",
  area: "Italian",
  instructions: "Boil the pasta.",
  ingredients: [{ name: "penne", measure: "1 pound" }],
  tags: ["Pasta"],
  youtubeVideoId: "abc123",
};

describe("translateFoodQueryToEnglish", () => {
  it("GROQ_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "");

    await expect(translateFoodQueryToEnglish("tavuk")).rejects.toThrow(ProviderNotConfiguredError);
  });

  it("Groq istegi basarisiz olursa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(translateFoodQueryToEnglish("tavuk")).rejects.toThrow(ProviderRequestError);
  });

  it("basarili yanitta cevrilmis terimi trim'lenmis olarak doner", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(groqResponse("  chicken  ")));

    await expect(translateFoodQueryToEnglish("tavuk")).resolves.toBe("chicken");
  });
});

describe("translateMealToTurkish", () => {
  it("GROQ_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "");

    await expect(translateMealToTurkish(sampleMeal)).rejects.toThrow(ProviderNotConfiguredError);
  });

  it("gecersiz JSON donerse ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(groqResponse("not json")));

    await expect(translateMealToTurkish(sampleMeal)).rejects.toThrow(ProviderRequestError);
  });

  it("cevrilen alanlari birlestirip thumbnail/id gibi degismeyen alanlari korur", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        groqResponse(
          JSON.stringify({
            title: "Acılı Arrabiata Penne",
            category: "Vejetaryen",
            area: "İtalyan",
            instructions: "Makarnayı haşla.",
            ingredients: [{ name: "penne", measure: "500 gram" }],
          }),
        ),
      ),
    );

    const result = await translateMealToTurkish(sampleMeal);

    expect(result.name).toBe("Acılı Arrabiata Penne");
    expect(result.category).toBe("Vejetaryen");
    expect(result.area).toBe("İtalyan");
    expect(result.instructions).toBe("Makarnayı haşla.");
    expect(result.ingredients).toEqual([{ name: "penne", measure: "500 gram" }]);
    expect(result.id).toBe(sampleMeal.id);
    expect(result.thumbnail).toBe(sampleMeal.thumbnail);
    expect(result.youtubeVideoId).toBe(sampleMeal.youtubeVideoId);
  });
});
