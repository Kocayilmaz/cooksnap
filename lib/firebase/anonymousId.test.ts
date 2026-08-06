import { afterEach, describe, expect, it, vi } from "vitest";
import { getAnonymousId } from "./anonymousId";

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

describe("getAnonymousId", () => {
  it("window tanimli degilse null doner", () => {
    expect(getAnonymousId()).toBeNull();
  });

  it("kayitli id yoksa uretir, localStorage'a yazar ve doner", () => {
    const localStorage = createLocalStorageMock();
    vi.stubGlobal("window", { localStorage });

    const id = getAnonymousId();

    expect(id).toMatch(/^anon-/);
    expect(localStorage.getItem("cooksnap:anonymousId")).toBe(id);
  });

  it("kayitli id varsa yeni id uretmeden ayniyla doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:anonymousId", "anon-existing-123");
    vi.stubGlobal("window", { localStorage });

    expect(getAnonymousId()).toBe("anon-existing-123");
  });

  it("ayni oturumda iki kez cagrilinca ayni id'yi doner", () => {
    const localStorage = createLocalStorageMock();
    vi.stubGlobal("window", { localStorage });

    const first = getAnonymousId();
    const second = getAnonymousId();

    expect(second).toBe(first);
  });
});
