import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { FLEXOKI_DEFINITIONS } from "./flexoki";

describe("Flexoki palettes", () => {
  it("defines the ink and paper themes in picker order", () => {
    expect(readNames(FLEXOKI_DEFINITIONS)).toEqual(["flexoki-ink", "flexoki-paper"]);
    expect(FLEXOKI_DEFINITIONS.map((definition) => definition.variant)).toEqual(["dark", "light"]);
  });

  it("pins the documented black and paper backgrounds with their base ramps", () => {
    const ink = readTokens(FLEXOKI_DEFINITIONS, 0);
    const paper = readTokens(FLEXOKI_DEFINITIONS, 1);

    expect(ink.background).toBe(hex("100f0f"));
    expect(ink.surface).toBe(hex("282726"));
    expect(ink.text).toBe(hex("cecdc3"));

    expect(paper.background).toBe(hex("fffcf0"));
    expect(paper.surface).toBe(hex("e6e4d9"));
    expect(paper.text).toBe(hex("100f0f"));
  });

  it("uses the 400 accents on ink and the 600 accents on paper", () => {
    const ink = readTokens(FLEXOKI_DEFINITIONS, 0);
    const paper = readTokens(FLEXOKI_DEFINITIONS, 1);

    expect(ink.error).toBe(hex("d14d41"));
    expect(ink.success).toBe(hex("879a39"));
    expect(ink.accent).toBe(hex("4385be"));

    expect(paper.error).toBe(hex("af3029"));
    expect(paper.success).toBe(hex("66800b"));
    expect(paper.accent).toBe(hex("205ea6"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(FLEXOKI_DEFINITIONS)).toBe(true);

    for (const definition of FLEXOKI_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
