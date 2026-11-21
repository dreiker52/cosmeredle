import { describe, expect, it } from "vitest";
import { resolveTheme } from "../src/lib/theme";

describe("tema", () => {
  it("respeta la elección explícita y, si no hay, sigue al sistema", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme(undefined, false)).toBe("light");
  });
});
