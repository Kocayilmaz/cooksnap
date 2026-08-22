import { afterEach, describe, expect, it, vi } from "vitest";
import type { MealSearchHistoryState } from "./mealSearchHistorySlice";
import { readStoredMealSearchHistory, writeStoredMealSearchHistory } from "./localMealSearchHistoryStorage";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const meal: MealSearchHistoryState[number] = {
  id: "52771",
  name: "Spicy Arrabiata Penne",
  thumbnail: "https://www.themealdb.com/images/media/meals/example.jpg",
  category: "Vegetarian",
  area: "Italian",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localMealSearchHistoryStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredMealSearchHistory()).toBeNull();
  });

  it("yazilan gecmis ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    const value: MealSearchHistoryState = [meal];
    writeStoredMealSearchHistory(value);

    expect(readStoredMealSearchHistory()).toEqual(value);
  });

  it("bos gecmis de gecerli kabul edilir", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredMealSearchHistory([]);

    expect(readStoredMealSearchHistory()).toEqual([]);
  });

  it("eksik alan tasiyan kayitla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem(
      "cooksnap:mealSearchHistory",
      JSON.stringify([{ id: "1", name: "Eksik" }]),
    );
    vi.stubGlobal("window", { localStorage });

    expect(readStoredMealSearchHistory()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:mealSearchHistory", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredMealSearchHistory()).toBeNull();
  });
});
