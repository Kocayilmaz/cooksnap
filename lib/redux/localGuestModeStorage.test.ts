import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredGuestMode, writeStoredGuestMode } from "./localGuestModeStorage";

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

describe("localGuestModeStorage", () => {
  it("window tanimli degilse false doner", () => {
    expect(readStoredGuestMode()).toBe(false);
  });

  it("kayit yoksa false doner", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    expect(readStoredGuestMode()).toBe(false);
  });

  it("yazilan deger ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredGuestMode(true);

    expect(readStoredGuestMode()).toBe(true);
  });

  it("false yazilinca false olarak okunur", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredGuestMode(true);
    writeStoredGuestMode(false);

    expect(readStoredGuestMode()).toBe(false);
  });
});
