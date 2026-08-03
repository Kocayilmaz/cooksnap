import { describe, expect, it } from "vitest";
import { buildRecipePrompt } from "./buildRecipePrompt";

describe("buildRecipePrompt", () => {
  it("kişi sayısını tekil/çoğul olarak doğru yazar", () => {
    const singular = buildRecipePrompt(
      { personCount: 1, equipment: ["oven"], mode: "home", language: "en" },
      "chicken",
    );
    const plural = buildRecipePrompt(
      { personCount: 4, equipment: ["oven"], mode: "home", language: "en" },
      "chicken",
    );

    expect(singular).toContain("Suggest a recipe for 1 person.");
    expect(plural).toContain("Suggest a recipe for 4 people.");
  });

  it("seçilen tüm ekipmanları isimleriyle listeler", () => {
    const prompt = buildRecipePrompt(
      { personCount: 2, equipment: ["airfryer", "pressureCooker", "wok"], mode: "home", language: "en" },
      "vegetables",
    );

    expect(prompt).toContain("Available cooking equipment: air fryer, pressure cooker, wok.");
  });

  it("tarif moduna göre doğru talimatı ekler", () => {
    const student = buildRecipePrompt(
      { personCount: 1, equipment: ["pan"], mode: "student", language: "en" },
      "eggs",
    );
    const chef = buildRecipePrompt(
      { personCount: 1, equipment: ["pan"], mode: "chef", language: "en" },
      "eggs",
    );

    expect(student).toContain("Optimize for a student");
    expect(chef).toContain("professional chef");
  });

  it("ülke belirtilmişse soft-preference cümlesini ekler, belirtilmemişse eklemez", () => {
    const withCountry = buildRecipePrompt(
      { personCount: 1, equipment: ["pot"], mode: "home", language: "en", country: "Italy" },
      "tomatoes",
    );
    const withoutCountry = buildRecipePrompt(
      { personCount: 1, equipment: ["pot"], mode: "home", language: "en" },
      "tomatoes",
    );

    expect(withCountry).toContain("Prefer recipes inspired by Italy cuisine");
    expect(withoutCountry).not.toContain("Prefer recipes inspired by");
  });

  it("dil belirtilmezse İngilizce'ye varsayılan olarak düşer", () => {
    const prompt = buildRecipePrompt(
      { personCount: 1, equipment: ["oven"], mode: "home" },
      "fish",
    );

    expect(prompt).toContain("Write the recipe title and steps in English.");
  });

  it("dil Türkçe seçilirse Türkçe talimatı ekler", () => {
    const prompt = buildRecipePrompt(
      { personCount: 1, equipment: ["oven"], mode: "home", language: "tr" },
      "fish",
    );

    expect(prompt).toContain("Write the recipe title and steps in Turkish.");
  });
});
