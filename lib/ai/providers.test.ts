import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderNotConfiguredError, ProviderRequestError, recognizeFoodItem } from "./providers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("recognizeFoodItem", () => {
  it("GEMINI_API_KEY tanimli degilse ProviderNotConfiguredError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    await expect(recognizeFoodItem("data:image/png;base64,aGVsbG8=")).rejects.toThrow(
      ProviderNotConfiguredError,
    );
  });

  it("gecersiz data URL ile ProviderRequestError firlatir (InvalidDataUrlError disari sizmaz)", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");

    await expect(recognizeFoodItem("not-a-data-url")).rejects.toThrow(ProviderRequestError);
  });

  it("Gemini istegi basarisiz olursa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("yanittan metin okunamazsa ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ candidates: [] }) }),
    );

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("bos/bosluk metin de ProviderRequestError firlatir", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "   " }] } }] }),
      }),
    );

    await expect(
      recognizeFoodItem("data:image/png;base64,aGVsbG8="),
    ).rejects.toThrow(ProviderRequestError);
  });

  it("basarili yanittan urun adini kirpilmis olarak doner", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "  Dondurulmuş lazanya  " }] } }],
        }),
      }),
    );

    await expect(recognizeFoodItem("data:image/png;base64,aGVsbG8=")).resolves.toBe(
      "Dondurulmuş lazanya",
    );
  });
});
