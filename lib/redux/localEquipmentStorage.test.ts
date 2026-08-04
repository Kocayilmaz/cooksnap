import { afterEach, describe, expect, it, vi } from "vitest";
import { EQUIPMENT_KEYS } from "./equipmentSlice";
import { readStoredEquipment, writeStoredEquipment } from "./localEquipmentStorage";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localEquipmentStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredEquipment()).toBeNull();
  });

  it("yazilan ekipman secimi ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    const value = Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, key === "oven"])) as Record<
      (typeof EQUIPMENT_KEYS)[number],
      boolean
    >;
    writeStoredEquipment(value);

    expect(readStoredEquipment()).toEqual(value);
  });

  it("eksik ekipman alaniyla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:equipment", JSON.stringify({ oven: true }));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredEquipment()).toBeNull();
  });

  it("boolean olmayan bir deger tasiyan alanla null doner", () => {
    const localStorage = createLocalStorageMock();
    const invalid = Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, "evet"]));
    localStorage.setItem("cooksnap:equipment", JSON.stringify(invalid));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredEquipment()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:equipment", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredEquipment()).toBeNull();
  });
});
