import { describe, expect, it } from "vitest";
import reducer, { clearApiKey, setKey, setProvider } from "./apiKeySlice";

describe("apiKeySlice", () => {
  it("varsayilan durumda saglayici claude ve anahtar bos gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.provider).toBe("claude");
    expect(state.key).toBe("");
  });

  it("setProvider secili saglayiciyi degistirir", () => {
    const state = reducer(undefined, setProvider("openai"));

    expect(state.provider).toBe("openai");
  });

  it("setKey anahtar degerini gunceller", () => {
    const state = reducer(undefined, setKey("sk-test-123"));

    expect(state.key).toBe("sk-test-123");
  });

  it("clearApiKey saglayiciyi koruyup sadece anahtari temizler", () => {
    const withKey = reducer(reducer(undefined, setProvider("openai")), setKey("sk-test-123"));

    const cleared = reducer(withKey, clearApiKey());

    expect(cleared.key).toBe("");
    expect(cleared.provider).toBe("openai");
  });
});
