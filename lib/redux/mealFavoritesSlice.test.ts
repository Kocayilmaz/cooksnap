import { describe, expect, it } from "vitest";
import reducer, { setMealFavorites, toggleMealFavorite } from "./mealFavoritesSlice";
import type { MealSearchResult } from "@/lib/types/meal";

const meal: MealSearchResult = {
  id: "52771",
  name: "Spicy Arrabiata Penne",
  thumbnail: "https://www.themealdb.com/images/media/meals/example.jpg",
  category: "Vegetarian",
  area: "Italian",
};

describe("mealFavoritesSlice", () => {
  it("toggleMealFavorite favorilerde yoksa savedAt ile birlikte ekler", () => {
    const state = reducer({}, toggleMealFavorite(meal));

    expect(state[meal.id]).toMatchObject(meal);
    expect(typeof state[meal.id].savedAt).toBe("number");
  });

  it("toggleMealFavorite zaten favorideyse kaldirir", () => {
    const withFavorite = reducer({}, toggleMealFavorite(meal));
    const withoutFavorite = reducer(withFavorite, toggleMealFavorite(meal));

    expect(withoutFavorite[meal.id]).toBeUndefined();
  });

  it("setMealFavorites tum state'i verilen degerle degistirir", () => {
    const initial = reducer({}, toggleMealFavorite(meal));
    const replaced = reducer(initial, setMealFavorites({}));

    expect(replaced).toEqual({});
  });
});
