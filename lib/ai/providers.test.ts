import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateRecipes,
  ProviderNotConfiguredError,
  ProviderRequestError,
  recognizeFoodItem,
} from "./providers";
import type { RecipeRequest } from "@/lib/types/recipe";

const BASE_REQUEST: Pick<
  RecipeRequest,
  "personCount" | "equipment" | "mode" | "language" | "country"
> = {
  personCount: 2,
  equipment: ["oven"],
  mode: "home",
  language: "tr",
  country: undefined,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("recognizeFoodItem", () => {
  it("GEMINI_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    await expect(recognizeFoodItem("data:image/png;base64,aGVsbG8=")).rejects.toThrow(
      ProviderNotConfiguredError,
    );
  });

  it("gecersiz data URL ile ProviderRequestError firlatir (InvalidDataUrlError disari sizmaz)", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");

    await expect(recognizeFoodItem("not-a-data-url")).rejects.toThrow(ProviderRequestError);
  });

  it("Gemini istegi basarisiz olursa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("yanittan metin okunamazsa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ candidates: [] }) }),
    );

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("bos/bosluk metin de ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "   " }] } }] }),
      }),
    );

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("basarili yanittan urun adini kirpilmis olarak doner", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "  Dondurulmuş lazanya  " }] } }],
        }),
      }),
    );

    await expect(recognizeFoodItem("data:image/png;base64,aGVsbG8=")).resolves.toBe(
      "Dondurulmuş lazanya",
    );
  });
});

describe("generateRecipes", () => {
  it("GROQ_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "");

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).rejects.toThrow(
      ProviderNotConfiguredError,
    );
  });

  it("Groq istegi basarisiz olursa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).rejects.toThrow(
      ProviderRequestError,
    );
  });

  it("yanittan mesaj icerigi okunamazsa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) }),
    );

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).rejects.toThrow(
      ProviderRequestError,
    );
  });

  it("icerik gecerli JSON degilse ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "{bozuk json" } }] }),
      }),
    );

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).rejects.toThrow(
      ProviderRequestError,
    );
  });

  it("recipes alani dizi degilse ProviderRequestError firlatir", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ recipes: "not-an-array" }) } }],
        }),
      }),
    );

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).rejects.toThrow(
      ProviderRequestError,
    );
  });

  it("basarili yanittan tarif listesini doner", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const recipes = [{ equipment: "oven", title: "Fırında yumurta", steps: ["Karıştır", "Pişir"] }];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: JSON.stringify({ recipes }) } }] }),
      }),
    );

    await expect(generateRecipes("yumurta, peynir", BASE_REQUEST)).resolves.toEqual(recipes);
  });
});
