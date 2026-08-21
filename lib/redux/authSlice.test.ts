import { describe, expect, it } from "vitest";
import reducer, { setAuthenticatedUser, setUnauthenticated } from "./authSlice";

describe("authSlice", () => {
  it("varsayilan durumda status loading, uid/email/photoURL null gelir", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.status).toBe("loading");
    expect(state.uid).toBeNull();
    expect(state.email).toBeNull();
    expect(state.photoURL).toBeNull();
  });

  it("setAuthenticatedUser uid/email'i set edip status'u authenticated yapar", () => {
    const state = reducer(undefined, setAuthenticatedUser({ uid: "abc123", email: "test@example.com" }));

    expect(state.status).toBe("authenticated");
    expect(state.uid).toBe("abc123");
    expect(state.email).toBe("test@example.com");
    expect(state.photoURL).toBeNull();
  });

  it("setAuthenticatedUser photoURL verildiginde onu da set eder (Google girisi)", () => {
    const state = reducer(
      undefined,
      setAuthenticatedUser({ uid: "abc123", email: "test@example.com", photoURL: "https://lh3.googleusercontent.com/a/foo" }),
    );

    expect(state.photoURL).toBe("https://lh3.googleusercontent.com/a/foo");
  });

  it("setUnauthenticated uid/email/photoURL'i temizleyip status'u unauthenticated yapar", () => {
    const authenticated = reducer(
      undefined,
      setAuthenticatedUser({ uid: "abc123", email: "test@example.com", photoURL: "https://example.com/p.jpg" }),
    );

    const state = reducer(authenticated, setUnauthenticated());

    expect(state.status).toBe("unauthenticated");
    expect(state.uid).toBeNull();
    expect(state.email).toBeNull();
    expect(state.photoURL).toBeNull();
  });
});
