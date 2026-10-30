import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { SOLARIZED_DEFINITIONS } from "./solarized";

describe("Solarized palettes", () => {
  it("defines the dark and light variants in picker order", () => {
    expect(readNames(SOLARIZED_DEFINITIONS)).toEqual(["solarized-dark", "solarized-light"]);
    expect(SOLARIZED_DEFINITIONS.map((definition) => definition.variant)).toEqual([
      "dark",
      "light",
    ]);
  });

  it("pins the official base and accent colors", () => {
    const dark = readTokens(SOLARIZED_DEFINITIONS, 0);
    const light = readTokens(SOLARIZED_DEFINITIONS, 1);

    expect(dark.background).toBe(hex("002b36"));
    expect(dark.surface).toBe(hex("073642"));
    expect(dark.text).toBe(hex("93a1a1"));
    expect(dark.accent).toBe(hex("268bd2"));
    expect(dark.warning).toBe(hex("b58900"));
    expect(dark.error).toBe(hex("dc322f"));

    expect(light.background).toBe(hex("fdf6e3"));
    expect(light.selection).toBe(hex("eee8d5"));
    expect(light.text).toBe(hex("586e75"));
    expect(light.accent).toBe(hex("268bd2"));
    expect(light.error).toBe(hex("dc322f"));
  });

  it("keeps the Solarized green as the success color and darkens only the light diff sign", () => {
    const light = readTokens(SOLARIZED_DEFINITIONS, 1);

    expect(light.success).toBe(hex("859900"));
    expect(light.diffAdd).toBe(hex("738500"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(SOLARIZED_DEFINITIONS)).toBe(true);

    for (const definition of SOLARIZED_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
