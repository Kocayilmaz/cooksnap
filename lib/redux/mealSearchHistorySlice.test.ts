import { describe, expect, it } from "vitest";
import reducer, {
  addMealSearchHistoryEntry,
  clearMealSearchHistory,
  MAX_MEAL_SEARCH_HISTORY,
  setMealSearchHistory,
} from "./mealSearchHistorySlice";
import type { MealSearchResult } from "@/lib/types/meal";

function makeMeal(id: string): MealSearchResult {
  return { id, name: `Tarif ${id}`, thumbnail: "https://example.com/x.jpg", category: "Vegetarian", area: "Italian" };
}

describe("mealSearchHistorySlice", () => {
  it("addMealSearchHistoryEntry yeni kaydi basa ekler", () => {
    const state = reducer([], addMealSearchHistoryEntry(makeMeal("1")));

    expect(state).toEqual([makeMeal("1")]);
  });

  it("en yeni arama listenin basinda olur", () => {
    let state = reducer([], addMealSearchHistoryEntry(makeMeal("1")));
    state = reducer(state, addMealSearchHistoryEntry(makeMeal("2")));

    expect(state.map((m) => m.id)).toEqual(["2", "1"]);
  });

  it("ayni tarif tekrar aranirsa kopyalanmaz, one alinir", () => {
    let state = reducer([], addMealSearchHistoryEntry(makeMeal("1")));
    state = reducer(state, addMealSearchHistoryEntry(makeMeal("2")));
    state = reducer(state, addMealSearchHistoryEntry(makeMeal("1")));

    expect(state.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("MAX_MEAL_SEARCH_HISTORY asilinca en eski (ilk aranan) arama unutulur", () => {
    let state: ReturnType<typeof reducer> = [];
    for (let i = 0; i < MAX_MEAL_SEARCH_HISTORY + 3; i++) {
      state = reducer(state, addMealSearchHistoryEntry(makeMeal(String(i))));
    }

    expect(state).toHaveLength(MAX_MEAL_SEARCH_HISTORY);
    expect(state[0].id).toBe(String(MAX_MEAL_SEARCH_HISTORY + 2));
    expect(state.some((m) => m.id === "0")).toBe(false);
  });

  it("clearMealSearchHistory listeyi bosaltir", () => {
    const state = reducer([makeMeal("1")], clearMealSearchHistory());

    expect(state).toEqual([]);
  });

  it("setMealSearchHistory tum state'i verilen degerle degistirir", () => {
    const replacement = [makeMeal("9")];

    expect(reducer([], setMealSearchHistory(replacement))).toEqual(replacement);
  });
});
