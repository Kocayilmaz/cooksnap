import { describe, expect, it } from "vitest";
import { buildRecipeText } from "./formatRecipeText";

describe("buildRecipeText", () => {
  it("başlığı ve numaralandırılmış adımları birleştirir", () => {
    const text = buildRecipeText("Omlet", ["Yumurtaları çırp", "Tavada pişir"]);

    expect(text).toBe("Omlet\n\n1. Yumurtaları çırp\n2. Tavada pişir");
  });

  it("adım yoksa sadece başlığı döner", () => {
    const text = buildRecipeText("Omlet", []);

    expect(text).toBe("Omlet\n\n");
  });

  it("adım sırasını korur", () => {
    const text = buildRecipeText("Salata", ["Sebzeleri doğra", "Sosu hazırla", "Karıştır"]);

    expect(text.split("\n")).toEqual([
      "Salata",
      "",
      "1. Sebzeleri doğra",
      "2. Sosu hazırla",
      "3. Karıştır",
    ]);
  });
});
