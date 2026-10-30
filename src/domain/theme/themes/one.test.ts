import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { ONE_DEFINITIONS } from "./one";

describe("Atom One palettes", () => {
  it("defines One Dark and One Light in picker order", () => {
    expect(readNames(ONE_DEFINITIONS)).toEqual(["one-dark", "one-light"]);
    expect(ONE_DEFINITIONS.map((definition) => definition.variant)).toEqual(["dark", "light"]);
  });

  it("pins the One Dark colors converted from the official HSL palette", () => {
    const tokens = readTokens(ONE_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("282c34"));
    expect(tokens.text).toBe(hex("abb2bf"));
    expect(tokens.muted).toBe(hex("828997"));
    expect(tokens.dim).toBe(hex("5c6370"));
    expect(tokens.accent).toBe(hex("528bff"));
    expect(tokens.success).toBe(hex("98c379"));
    expect(tokens.warning).toBe(hex("e5c07b"));
    expect(tokens.error).toBe(hex("e06c75"));
    expect(tokens.info).toBe(hex("56b6c2"));
  });

  it("pins the One Light colors converted from the official HSL palette", () => {
    const tokens = readTokens(ONE_DEFINITIONS, 1);

    expect(tokens.background).toBe(hex("fafafa"));
    expect(tokens.text).toBe(hex("383a42"));
    expect(tokens.muted).toBe(hex("696c77"));
    expect(tokens.dim).toBe(hex("a0a1a7"));
    expect(tokens.accent).toBe(hex("526eff"));
    expect(tokens.success).toBe(hex("50a14f"));
    expect(tokens.error).toBe(hex("e45649"));
  });

  it("separates the diff sign colors from the official status colors on One Light", () => {
    const tokens = readTokens(ONE_DEFINITIONS, 1);

    expect(tokens.diffAdd).not.toBe(tokens.success);
    expect(tokens.diffRemove).not.toBe(tokens.error);
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(ONE_DEFINITIONS)).toBe(true);

    for (const definition of ONE_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
