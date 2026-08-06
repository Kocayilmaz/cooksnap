import { afterEach, describe, expect, it, vi } from "vitest";
import { findRecipeVideoId } from "./youtube";
import { ProviderNotConfiguredError, ProviderRequestError } from "./providers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("findRecipeVideoId", () => {
  it("YOUTUBE_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");

    await expect(findRecipeVideoId("mercimek corbasi")).rejects.toThrow(
      ProviderNotConfiguredError,
    );
  });

  it("YouTube istegi basarisiz olursa ProviderRequestError firlatir", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );

    await expect(findRecipeVideoId("mercimek corbasi")).rejects.toThrow(
      ProviderRequestError,
    );
  });

  it("basarili yanittan videoId'yi doner", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: "abc123" } }] }),
      }),
    );

    await expect(findRecipeVideoId("mercimek corbasi")).resolves.toBe("abc123");
  });

  it("sonuc bulunamazsa null doner", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [] }) }),
    );

    await expect(findRecipeVideoId("mercimek corbasi")).resolves.toBeNull();
  });

  it("aranan basligi ve anahtari istek parametrelerine dogru sekilde koyar", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    await findRecipeVideoId("kuru fasulye");

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("key")).toBe("test-key");
    expect(calledUrl.searchParams.get("q")).toBe("kuru fasulye tarifi");
  });
});
