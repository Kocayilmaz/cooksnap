import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredApiKey, writeStoredApiKey } from "./localApiKeyStorage";

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

describe("localApiKeyStorage", () => {
  it("window tanimli degilse null doner", () => {
    expect(readStoredApiKey()).toBeNull();
  });

  it("yazilan deger ayniyla geri okunur (roundtrip)", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    writeStoredApiKey({ provider: "openai", key: "sk-test-123" });

    expect(readStoredApiKey()).toEqual({ provider: "openai", key: "sk-test-123" });
  });

  it("gecersiz provider degeriyle null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:apiKey", JSON.stringify({ provider: "invalid", key: "x" }));
    vi.stubGlobal("window", { localStorage });

    expect(readStoredApiKey()).toBeNull();
  });

  it("bozuk JSON ile null doner", () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem("cooksnap:apiKey", "{bozuk json");
    vi.stubGlobal("window", { localStorage });

    expect(readStoredApiKey()).toBeNull();
  });

  it("kayit yoksa null doner", () => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });

    expect(readStoredApiKey()).toBeNull();
  });
});
