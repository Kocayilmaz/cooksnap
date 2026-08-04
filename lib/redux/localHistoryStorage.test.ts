import { afterEach, describe, expect, it, vi } from "vitest";
import type { HistoryEntry, HistoryState } from "./historySlice";
import { readStoredHistory, writeStoredHistory } from "./localHistoryStorage";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const entry: HistoryEntry = {
  id: "1700000000000-abc123",
  hadPhoto: true,
  personCount: 4,
  equipment: ["oven", "pan"],
  mode: "home",
  recipeTitles: ["Firinda Tavuk"],
  createdAt: 1700000000000,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localHistoryStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredHistory()).toBeNull();
  });

  it("yazilan gecmis ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    const value: HistoryState = [entry];
    writeStoredHistory(value);

    expect(readStoredHistory()).toEqual(value);
  });

  it("bos gecmis de gecerli kabul edilir", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredHistory([]);

    expect(readStoredHistory()).toEqual([]);
  });

  it("gecersiz ekipman degeri tasiyan kayitla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem(
      "cooksnap:history",
      JSON.stringify([{ ...entry, equipment: ["firincik"] }]),
    );
    vi.stubGlobal("window", { localStorage });

    expect(readStoredHistory()).toBeNull();
  });

  it("gecersiz mod degeri tasiyan kayitla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:history", JSON.stringify([{ ...entry, mode: "usta" }]));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredHistory()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:history", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredHistory()).toBeNull();
  });
});
