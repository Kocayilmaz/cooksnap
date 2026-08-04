import { describe, expect, it } from "vitest";
import reducer, { setCountry, setLanguage, setName } from "./userProfileSlice";

describe("userProfileSlice", () => {
  it("varsayilan durumda ad/ulke bos, dil 'tr' gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.name).toBe("");
    expect(state.language).toBe("tr");
    expect(state.country).toBe("");
  });

  it("setName ad soyad degerini gunceller", () => {
    const state = reducer(undefined, setName("Enes Kocayilmaz"));

    expect(state.name).toBe("Enes Kocayilmaz");
  });

  it("setLanguage dil tercihini gunceller", () => {
    const state = reducer(undefined, setLanguage("en"));

    expect(state.language).toBe("en");
  });

  it("setCountry ulke degerini gunceller", () => {
    const state = reducer(undefined, setCountry("Turkiye"));

    expect(state.country).toBe("Turkiye");
  });

  it("alanlar birbirinden bagimsiz guncellenir", () => {
    const step1 = reducer(undefined, setName("Enes"));
    const step2 = reducer(step1, setLanguage("en"));
    const step3 = reducer(step2, setCountry("Turkiye"));

    expect(step3).toEqual({ name: "Enes", language: "en", country: "Turkiye" });
  });
});
