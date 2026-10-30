import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { GRUVBOX_DEFINITIONS } from "./gruvbox";

describe("Gruvbox palettes", () => {
  it("defines the dark and light variants in picker order", () => {
    expect(readNames(GRUVBOX_DEFINITIONS)).toEqual(["gruvbox-dark", "gruvbox-light"]);
    expect(GRUVBOX_DEFINITIONS.map((definition) => definition.variant)).toEqual(["dark", "light"]);
  });

  it("pins the upstream medium-contrast backgrounds", () => {
    expect(GRUVBOX_DEFINITIONS.map((definition) => definition.tokens.background)).toEqual([
      hex("282828"),
      hex("fbf1c7"),
    ]);
    expect(GRUVBOX_DEFINITIONS.map((definition) => definition.tokens.surface)).toEqual([
      hex("3c3836"),
      hex("ebdbb2"),
    ]);
  });

  it("pins the bright accents on dark and the faded accents on light", () => {
    const dark = readTokens(GRUVBOX_DEFINITIONS, 0);
    const light = readTokens(GRUVBOX_DEFINITIONS, 1);

    expect(dark.success).toBe(hex("b8bb26"));
    expect(dark.error).toBe(hex("fb4934"));
    expect(dark.warning).toBe(hex("fabd2f"));
    expect(dark.accent).toBe(hex("fe8019"));

    expect(light.success).toBe(hex("79740e"));
    expect(light.error).toBe(hex("9d0006"));
    expect(light.warning).toBe(hex("b57614"));
    expect(light.accent).toBe(hex("af3a03"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(GRUVBOX_DEFINITIONS)).toBe(true);

    for (const definition of GRUVBOX_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
