import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { SONOKAI_DEFINITIONS } from "./sonokai";

describe("Sonokai palette", () => {
  it("defines the single default style", () => {
    expect(readNames(SONOKAI_DEFINITIONS)).toEqual(["sonokai"]);
    expect(readDefinition(SONOKAI_DEFINITIONS, 0).label).toBe("Sonokai");
    expect(readDefinition(SONOKAI_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream background ramp and text colors", () => {
    const tokens = readTokens(SONOKAI_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("2c2e34"));
    expect(tokens.panel).toBe(hex("222327"));
    expect(tokens.surface).toBe(hex("33353f"));
    expect(tokens.border).toBe(hex("3b3e48"));
    expect(tokens.text).toBe(hex("e2e2e3"));
    expect(tokens.muted).toBe(hex("7f8490"));
    expect(tokens.dim).toBe(hex("595f6f"));
  });

  it("pins the upstream accent and signal colors", () => {
    const tokens = readTokens(SONOKAI_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("76cce0"));
    expect(tokens.success).toBe(hex("9ed072"));
    expect(tokens.warning).toBe(hex("e7c664"));
    expect(tokens.error).toBe(hex("fc5d7c"));
    expect(tokens.tag).toBe(hex("f39660"));
    expect(tokens.branchLocal).toBe(hex("b39df3"));
  });

  it("uses the upstream bg_green and bg_red diff backgrounds", () => {
    const tokens = readTokens(SONOKAI_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("394634"));
    expect(tokens.diffRemoveBackground).toBe(hex("55393d"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(SONOKAI_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(SONOKAI_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(SONOKAI_DEFINITIONS, 0).graph)).toBe(true);
  });
});
