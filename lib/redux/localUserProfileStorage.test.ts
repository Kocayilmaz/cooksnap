import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredUserProfile, writeStoredUserProfile } from "./localUserProfileStorage";

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

describe("localUserProfileStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredUserProfile()).toBeNull();
  });

  it("yazilan profil ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredUserProfile({ name: "Enes", language: "en", country: "Turkiye" });

    expect(readStoredUserProfile()).toEqual({ name: "Enes", language: "en", country: "Turkiye" });
  });

  it("gecersiz dil degeriyle null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem(
      "cooksnap:userProfile",
      JSON.stringify({ name: "Enes", language: "fr", country: "Turkiye" }),
    );
    vi.stubGlobal("window", { localStorage });

    expect(readStoredUserProfile()).toBeNull();
  });

  it("eksik alanla null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:userProfile", JSON.stringify({ name: "Enes" }));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredUserProfile()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:userProfile", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredUserProfile()).toBeNull();
  });
});
