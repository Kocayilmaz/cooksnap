import { describe, expect, it } from "vitest";
import { AREAS, AREA_LABELS_TR, getAreaLabel } from "./areaMeta";

describe("getAreaLabel", () => {
  it("bilinen mutfak icin Turkce etiket doner", () => {
    expect(getAreaLabel("Turkish")).toBe("Türk");
  });

  it("bilinmeyen mutfak icin orijinal adi doner", () => {
    expect(getAreaLabel("Narnian")).toBe("Narnian");
  });
});

describe("AREAS", () => {
  it("AREA_LABELS_TR ile ayni anahtarlari icerir", () => {
    expect(AREAS).toEqual(Object.keys(AREA_LABELS_TR));
  });

  it("bos degildir", () => {
    expect(AREAS.length).toBeGreaterThan(0);
  });
});
