import { describe, expect, it } from "vitest";
import reducer, { setGuestMode } from "./guestModeSlice";

describe("guestModeSlice", () => {
  it("varsayilan durumda isGuest false gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.isGuest).toBe(false);
  });

  it("setGuestMode(true) misafir moduna gecirir", () => {
    const state = reducer(undefined, setGuestMode(true));

    expect(state.isGuest).toBe(true);
  });

  it("setGuestMode(false) misafir modundan cikarir", () => {
    const guest = reducer(undefined, setGuestMode(true));

    const state = reducer(guest, setGuestMode(false));

    expect(state.isGuest).toBe(false);
  });
});
