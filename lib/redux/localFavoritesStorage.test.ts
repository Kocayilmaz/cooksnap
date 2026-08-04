import { afterEach, describe, expect, it, vi } from "vitest";
import type { FavoriteRecipe, FavoritesState } from "./favoritesSlice";
import { readStoredFavorites, writeStoredFavorites } from "./localFavoritesStorage";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const recipe: FavoriteRecipe = {
  id: "oven::Firinda Tavuk",
  title: "Firinda Tavuk",
  equipment: "oven",
  steps: ["Firini isit", "Tavugu yerlestir"],
  videoId: null,
  savedAt: 1700000000000,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localFavoritesStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredFavorites()).toBeNull();
  });

  it("yazilan favoriler ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    const value: FavoritesState = { [recipe.id]: recipe };
    writeStoredFavorites(value);

    expect(readStoredFavorites()).toEqual(value);
  });

  it("bos favori listesi de gecerli kabul edilir", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredFavorites({});

    expect(readStoredFavorites()).toEqual({});
  });

  it("gecersiz ekipman degeriyle null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem(
      "cooksnap:favorites",
      JSON.stringify({ [recipe.id]: { ...recipe, equipment: "firincik" } }),
    );
    vi.stubGlobal("window", { localStorage });

    expect(readStoredFavorites()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:favorites", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredFavorites()).toBeNull();
  });
});
