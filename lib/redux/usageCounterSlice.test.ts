import { describe, expect, it } from "vitest";
import reducer, { FREE_USAGE_LIMIT, incrementUsage, setUsage } from "./usageCounterSlice";

describe("usageCounterSlice", () => {
  it("incrementUsage sayaci bir artirir, lastResetAt'i degistirmez", () => {
    const initial = { count: 0, lastResetAt: 1000 };

    const state = reducer(initial, incrementUsage());

    expect(state).toEqual({ count: 1, lastResetAt: 1000 });
  });

  it("art arda incrementUsage cagrilari birikir", () => {
    let state = { count: 0, lastResetAt: 1000 };
    for (let i = 0; i < FREE_USAGE_LIMIT; i++) {
      state = reducer(state, incrementUsage());
    }

    expect(state.count).toBe(FREE_USAGE_LIMIT);
  });

  it("setUsage tum state'i verilen degerle degistirir", () => {
    const initial = { count: 3, lastResetAt: 1000 };
    const replacement = { count: 0, lastResetAt: 2000 };

    expect(reducer(initial, setUsage(replacement))).toEqual(replacement);
  });
});
