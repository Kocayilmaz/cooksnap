import { describe, expect, it } from "vitest";
import reducer, { RECIPE_MODE_KEYS, setRecipeMode } from "./recipeModeSlice";

describe("recipeModeSlice", () => {
  it("varsayilan mod 'home' gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.value).toBe("home");
  });

  it("setRecipeMode secili modu degistirir", () => {
    const state = reducer(undefined, setRecipeMode("chef"));

    expect(state.value).toBe("chef");
  });

  it("RECIPE_MODE_KEYS listesindeki her mod setRecipeMode ile secilebilir", () => {
    for (const mode of RECIPE_MODE_KEYS) {
      const state = reducer(undefined, setRecipeMode(mode));
      expect(state.value).toBe(mode);
    }
  });
});
