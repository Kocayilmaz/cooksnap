import { describe, expect, it } from "vitest";
import { formatTimerDuration } from "./cookingTimerUtils";

describe("formatTimerDuration", () => {
  it("dakika ve saniyeyi dk:ss olarak biçimlendirir", () => {
    expect(formatTimerDuration(125)).toBe("2:05");
  });

  it("saniyeyi iki hane olacak şekilde sıfırla doldurur", () => {
    expect(formatTimerDuration(61)).toBe("1:01");
  });

  it("sıfırı 0:00 olarak gösterir", () => {
    expect(formatTimerDuration(0)).toBe("0:00");
  });

  it("bir saatten uzun süreleri de dakika cinsinden gösterir", () => {
    expect(formatTimerDuration(3661)).toBe("61:01");
  });
});
