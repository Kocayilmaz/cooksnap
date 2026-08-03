import { describe, expect, it } from "vitest";
import { InvalidDataUrlError, parseDataUrl } from "./parseDataUrl";

describe("parseDataUrl", () => {
  it("gecerli bir data URL'i mimeType ve base64 olarak ayristirir", () => {
    const result = parseDataUrl("data:image/png;base64,aGVsbG8=");

    expect(result).toEqual({ mimeType: "image/png", base64: "aGVsbG8=" });
  });

  it("mimeType icinde alt tur olan formatlari da destekler", () => {
    const result = parseDataUrl("data:image/jpeg;base64,YWJj");

    expect(result.mimeType).toBe("image/jpeg");
  });

  it("gecersiz formatta InvalidDataUrlError firlatir", () => {
    expect(() => parseDataUrl("not-a-data-url")).toThrow(InvalidDataUrlError);
  });

  it("base64 belirteci olmayan data URL'lerde de hata firlatir", () => {
    expect(() => parseDataUrl("data:image/png,plain-not-base64")).toThrow(InvalidDataUrlError);
  });
});
