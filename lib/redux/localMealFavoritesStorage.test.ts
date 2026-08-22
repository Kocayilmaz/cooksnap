import { afterEach, describe, expect, it, vi } from "vitest";
import type { MealFavorite, MealFavoritesState } from "./mealFavoritesSlice";
import { readStoredMealFavorites, writeStoredMealFavorites } from "./localMealFavoritesStorage";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const meal: MealFavorite = {
  id: "52771",
  name: "Spicy Arrabiata Penne",
  thumbnail: "https://www.themealdb.com/images/media/meals/example.jpg",
  category: "Vegetarian",
  area: "Italian",
  savedAt: 1700000000000,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localMealFavoritesStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredMealFavorites()).toBeNull();
  });

  it("yazilan favoriler ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    const value: MealFavoritesState = { [meal.id]: meal };
    writeStoredMealFavorites(value);

    expect(readStoredMealFavorites()).toEqual(value);
  });

  it("bos favori listesi de gecerli kabul edilir", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredMealFavorites({});

    expect(readStoredMealFavorites()).toEqual({});
  });

  it("eksik alan tasiyan kayitla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem(
      "cooksnap:mealFavorites",
      JSON.stringify({ [meal.id]: { id: meal.id, name: meal.name } }),
    );
    vi.stubGlobal("window", { localStorage });

    expect(readStoredMealFavorites()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:mealFavorites", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredMealFavorites()).toBeNull();
  });
});
