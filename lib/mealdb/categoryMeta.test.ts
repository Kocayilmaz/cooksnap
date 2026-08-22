import { describe, expect, it } from "vitest";
import { FEATURED_CATEGORY_ORDER, getCategoryLabel, sortCategoriesFeaturedFirst } from "./categoryMeta";

describe("getCategoryLabel", () => {
  it("bilinen kategori icin Turkce etiket doner", () => {
    expect(getCategoryLabel("Chicken")).toBe("Tavuk");
  });

  it("bilinmeyen kategori icin orijinal adi doner", () => {
    expect(getCategoryLabel("Unicorn")).toBe("Unicorn");
  });
});

describe("sortCategoriesFeaturedFirst", () => {
  it("one cikan kategorileri FEATURED_CATEGORY_ORDER sirasiyla basa alir", () => {
    const categories = [
      { name: "Bilinmeyen-Kategori" },
      { name: "Pasta" },
      { name: "Breakfast" },
      { name: "Lamb" },
    ];

    const sorted = sortCategoriesFeaturedFirst(categories);

    // Bilinmeyen-Kategori FEATURED_CATEGORY_ORDER'da yok, en sona duser.
    expect(sorted.map((c) => c.name)).toEqual(["Breakfast", "Pasta", "Lamb", "Bilinmeyen-Kategori"]);
  });

  it("one cikan olmayanlarin kendi aralarindaki sirasini korur", () => {
    const categories = [{ name: "Zeta" }, { name: "Alpha" }, { name: "Beta" }];

    const sorted = sortCategoriesFeaturedFirst(categories);

    expect(sorted.map((c) => c.name)).toEqual(["Zeta", "Alpha", "Beta"]);
  });

  it("orijinal diziyi degistirmez", () => {
    const categories = [{ name: "Goat" }, { name: "Breakfast" }];
    const original = [...categories];

    sortCategoriesFeaturedFirst(categories);

    expect(categories).toEqual(original);
  });

  it("FEATURED_CATEGORY_ORDER bos degildir", () => {
    expect(FEATURED_CATEGORY_ORDER.length).toBeGreaterThan(0);
  });
});
