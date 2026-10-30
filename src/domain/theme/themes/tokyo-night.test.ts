import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { TOKYO_NIGHT_DEFINITIONS } from "./tokyo-night";

describe("Tokyo Night palettes", () => {
  it("defines the four styles in picker order", () => {
    expect(readNames(TOKYO_NIGHT_DEFINITIONS)).toEqual([
      "tokyo-night-night",
      "tokyo-night-storm",
      "tokyo-night-moon",
      "tokyo-night-day",
    ]);
    expect(TOKYO_NIGHT_DEFINITIONS.map((definition) => definition.label)).toEqual([
      "Tokyo Night",
      "Tokyo Night Storm",
      "Tokyo Night Moon",
      "Tokyo Night Day",
    ]);
    expect(TOKYO_NIGHT_DEFINITIONS.map((definition) => definition.variant)).toEqual([
      "dark",
      "dark",
      "dark",
      "light",
    ]);
  });

  it("pins the upstream backgrounds of every style", () => {
    expect(TOKYO_NIGHT_DEFINITIONS.map((definition) => definition.tokens.background)).toEqual([
      hex("1a1b26"),
      hex("24283b"),
      hex("222436"),
      hex("e1e2e7"),
    ]);
    expect(TOKYO_NIGHT_DEFINITIONS.map((definition) => definition.tokens.surface)).toEqual([
      hex("292e42"),
      hex("292e42"),
      hex("2f334d"),
      hex("e1e2e7"),
    ]);
  });

  it("pins the upstream text, accent, and status colors of the night style", () => {
    const tokens = readTokens(TOKYO_NIGHT_DEFINITIONS, 0);

    expect(tokens.text).toBe(hex("c0caf5"));
    expect(tokens.muted).toBe(hex("a9b1d6"));
    expect(tokens.dim).toBe(hex("565f89"));
    expect(tokens.accent).toBe(hex("7aa2f7"));
    expect(tokens.success).toBe(hex("9ece6a"));
    expect(tokens.warning).toBe(hex("e0af68"));
    expect(tokens.error).toBe(hex("f7768e"));
    expect(tokens.info).toBe(hex("7dcfff"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(TOKYO_NIGHT_DEFINITIONS)).toBe(true);

    for (const definition of TOKYO_NIGHT_DEFINITIONS) {
      expect(Object.isFrozen(definition), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
