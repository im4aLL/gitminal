import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { contrastRatio } from "../theme.contrast";
import type { HexColor, ThemeTokens } from "../theme.types";
import { HIGH_CONTRAST_DEFINITIONS } from "./high-contrast";

/** Contrast ratio the high contrast family must clear for every painted pair. */
const HIGH_CONTRAST_FLOOR = 7;

/**
 * Reads one token as a color.
 *
 * @param tokens - Theme tokens.
 * @param token - Token name.
 * @returns The token color.
 */
function colorOf(tokens: ThemeTokens, token: keyof ThemeTokens): HexColor {
  const value = tokens[token];

  if (typeof value !== "string") {
    throw new Error(`Token "${String(token)}" is not a single color.`);
  }

  return value;
}

describe("High contrast palettes", () => {
  it("defines the dark and light variants in picker order", () => {
    expect(readNames(HIGH_CONTRAST_DEFINITIONS)).toEqual([
      "high-contrast-dark",
      "high-contrast-light",
    ]);
    expect(HIGH_CONTRAST_DEFINITIONS.map((definition) => definition.variant)).toEqual([
      "dark",
      "light",
    ]);
  });

  it("uses pure black and white backgrounds with neutral primary text", () => {
    const dark = readTokens(HIGH_CONTRAST_DEFINITIONS, 0);
    const light = readTokens(HIGH_CONTRAST_DEFINITIONS, 1);

    expect(dark.background).toBe(hex("000000"));
    expect(dark.text).toBe(hex("ffffff"));
    expect(light.background).toBe(hex("ffffff"));
    expect(light.text).toBe(hex("000000"));
  });

  it("clears the AAA contrast floor on every painted pair", () => {
    const pairs: readonly (readonly [keyof ThemeTokens, keyof ThemeTokens])[] = [
      ["text", "background"],
      ["text", "panel"],
      ["text", "surface"],
      ["text", "selection"],
      ["muted", "background"],
      ["muted", "surface"],
      ["accent", "surface"],
      ["success", "background"],
      ["warning", "background"],
      ["error", "background"],
      ["info", "background"],
      ["diffAdd", "diffAddBackground"],
      ["diffRemove", "diffRemoveBackground"],
    ];

    for (const definition of HIGH_CONTRAST_DEFINITIONS) {
      for (const [foreground, background] of pairs) {
        const ratio = contrastRatio(
          colorOf(definition.tokens, foreground),
          colorOf(definition.tokens, background),
        );

        expect(
          ratio,
          `${definition.name}: ${String(foreground)} on ${String(background)} is ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(HIGH_CONTRAST_FLOOR);
      }
    }
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(HIGH_CONTRAST_DEFINITIONS)).toBe(true);

    for (const definition of HIGH_CONTRAST_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
