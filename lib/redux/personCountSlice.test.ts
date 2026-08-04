import { describe, expect, it } from "vitest";
import reducer, { decrementPersonCount, incrementPersonCount, setPersonCount } from "./personCountSlice";

describe("personCountSlice", () => {
  it("varsayilan kisi sayisi 2 gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.value).toBe(2);
  });

  it("setPersonCount gecerli araliktaki degeri dogrudan kabul eder", () => {
    const state = reducer(undefined, setPersonCount(5));

    expect(state.value).toBe(5);
  });

  it("setPersonCount ust siniri (12) asan degeri 12'ye sabitler", () => {
    const state = reducer(undefined, setPersonCount(99));

    expect(state.value).toBe(12);
  });

  it("setPersonCount alt siniri (1) altina inen degeri 1'e sabitler", () => {
    const state = reducer(undefined, setPersonCount(-3));

    expect(state.value).toBe(1);
  });

  it("incrementPersonCount ust sinirda (12) artik artirmaz", () => {
    const atMax = reducer(undefined, setPersonCount(12));

    const state = reducer(atMax, incrementPersonCount());

    expect(state.value).toBe(12);
  });

  it("decrementPersonCount alt sinirda (1) artik azaltmaz", () => {
    const atMin = reducer(undefined, setPersonCount(1));

    const state = reducer(atMin, decrementPersonCount());

    expect(state.value).toBe(1);
  });

  it("increment/decrement sinir disinda beklendigi gibi calisir", () => {
    const incremented = reducer(reducer(undefined, setPersonCount(4)), incrementPersonCount());
    expect(incremented.value).toBe(5);

    const decremented = reducer(reducer(undefined, setPersonCount(4)), decrementPersonCount());
    expect(decremented.value).toBe(3);
  });
});
