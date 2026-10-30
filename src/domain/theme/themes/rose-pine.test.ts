import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { ROSE_PINE_DEFINITIONS } from "./rose-pine";

describe("Rose Pine palettes", () => {
  it("defines the three variants in picker order", () => {
    expect(readNames(ROSE_PINE_DEFINITIONS)).toEqual([
      "rose-pine-main",
      "rose-pine-moon",
      "rose-pine-dawn",
    ]);
    expect(ROSE_PINE_DEFINITIONS.map((definition) => definition.label)).toEqual([
      "Rose Pine",
      "Rose Pine Moon",
      "Rose Pine Dawn",
    ]);
    expect(ROSE_PINE_DEFINITIONS.map((definition) => definition.variant)).toEqual([
      "dark",
      "dark",
      "light",
    ]);
  });

  it("pins the upstream base and surface colors", () => {
    expect(ROSE_PINE_DEFINITIONS.map((definition) => definition.tokens.background)).toEqual([
      hex("191724"),
      hex("232136"),
      hex("faf4ed"),
    ]);
    expect(ROSE_PINE_DEFINITIONS.map((definition) => definition.tokens.surface)).toEqual([
      hex("26233a"),
      hex("393552"),
      hex("f2e9e1"),
    ]);
  });

  it("pins the upstream accents", () => {
    const main = readTokens(ROSE_PINE_DEFINITIONS, 0);
    const moon = readTokens(ROSE_PINE_DEFINITIONS, 1);
    const dawn = readTokens(ROSE_PINE_DEFINITIONS, 2);

    expect(main.text).toBe(hex("e0def4"));
    expect(main.accent).toBe(hex("c4a7e7"));
    expect(main.error).toBe(hex("eb6f92"));
    expect(main.warning).toBe(hex("f6c177"));
    expect(main.success).toBe(hex("31748f"));

    expect(moon.success).toBe(hex("3e8fb0"));
    expect(moon.tag).toBe(hex("ea9a97"));

    expect(dawn.text).toBe(hex("464261"));
    expect(dawn.accent).toBe(hex("907aa9"));
    expect(dawn.error).toBe(hex("b4637a"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(ROSE_PINE_DEFINITIONS)).toBe(true);

    for (const definition of ROSE_PINE_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
