import { describe, expect, it } from "vitest";
import reducer, { EQUIPMENT_KEYS, setEquipment, toggleEquipment } from "./equipmentSlice";

describe("equipmentSlice", () => {
  it("varsayilan durumda sadece firin ve tava secili gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.oven).toBe(true);
    expect(state.pan).toBe(true);
    expect(state.pot).toBe(false);
  });

  it("toggleEquipment secili olmayan bir ekipmani secer", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    const toggled = reducer(state, toggleEquipment("wok"));

    expect(toggled.wok).toBe(true);
  });

  it("toggleEquipment secili bir ekipmanin secimini kaldirir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    const toggled = reducer(state, toggleEquipment("oven"));

    expect(toggled.oven).toBe(false);
  });

  it("EQUIPMENT_KEYS listesindeki her ekipman icin state alani bulunur", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    for (const key of EQUIPMENT_KEYS) {
      expect(typeof state[key]).toBe("boolean");
    }
  });

  it("setEquipment tum state'i verilen degerle degistirir", () => {
    const replacement = Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, true])) as Record<
      (typeof EQUIPMENT_KEYS)[number],
      boolean
    >;

    const state = reducer(undefined, setEquipment(replacement));

    expect(state).toEqual(replacement);
  });
});
