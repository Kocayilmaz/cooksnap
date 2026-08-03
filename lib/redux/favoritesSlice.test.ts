import { describe, expect, it } from "vitest";
import reducer, { makeFavoriteId, setFavorites, toggleFavorite } from "./favoritesSlice";

const recipe = {
  id: makeFavoriteId("oven", "Firinda Tavuk"),
  title: "Firinda Tavuk",
  equipment: "oven" as const,
  steps: ["Firini isit", "Tavugu yerlestir", "45 dakika pisir"],
  videoId: null,
};

describe("favoritesSlice", () => {
  it("makeFavoriteId ekipman ve baslikdan kararli bir id uretir", () => {
    expect(makeFavoriteId("oven", "Firinda Tavuk")).toBe("oven::Firinda Tavuk");
  });

  it("toggleFavorite favorilerde yoksa savedAt ile birlikte ekler", () => {
    const state = reducer({}, toggleFavorite(recipe));

    expect(state[recipe.id]).toMatchObject({ title: recipe.title, equipment: recipe.equipment });
    expect(typeof state[recipe.id].savedAt).toBe("number");
  });

  it("toggleFavorite zaten favorideyse kaldirir", () => {
    const withFavorite = reducer({}, toggleFavorite(recipe));
    const withoutFavorite = reducer(withFavorite, toggleFavorite(recipe));

    expect(withoutFavorite[recipe.id]).toBeUndefined();
  });

  it("setFavorites tum state'i verilen degerle degistirir", () => {
    const initial = reducer({}, toggleFavorite(recipe));
    const replaced = reducer(initial, setFavorites({}));

    expect(replaced).toEqual({});
  });
});
