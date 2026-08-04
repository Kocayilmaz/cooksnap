import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredUsage, writeStoredUsage } from "./localUsageStorage";

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

describe("localUsageStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredUsage()).toBeNull();
  });

  it("yazilan sayac ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredUsage({ count: 3, lastResetAt: 1700000000000 });

    expect(readStoredUsage()).toEqual({ count: 3, lastResetAt: 1700000000000 });
  });

  it("eski format (duz sayi) geriye donuk olarak okunabilir", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:usageCount", "4");
    vi.stubGlobal("window", { localStorage });

    const result = readStoredUsage();

    expect(result?.count).toBe(4);
    expect(typeof result?.lastResetAt).toBe("number");
  });

  it("negatif sayimla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:usageCount", JSON.stringify({ count: -1, lastResetAt: 1700000000000 }));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredUsage()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:usageCount", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredUsage()).toBeNull();
  });
});
