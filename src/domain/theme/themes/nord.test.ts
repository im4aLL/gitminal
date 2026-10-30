import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readTokens } from "@/test/theme.harness";
import { NORD_DEFINITIONS } from "./nord";

describe("Nord palette", () => {
  it("defines the single dark theme", () => {
    expect(NORD_DEFINITIONS).toHaveLength(1);
    expect(readDefinition(NORD_DEFINITIONS, 0).name).toBe("nord");
    expect(readDefinition(NORD_DEFINITIONS, 0).label).toBe("Nord");
    expect(readDefinition(NORD_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream Polar Night, Snow Storm, Frost, and Aurora colors", () => {
    const tokens = readTokens(NORD_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("2e3440"));
    expect(tokens.surface).toBe(hex("3b4252"));
    expect(tokens.border).toBe(hex("4c566a"));
    expect(tokens.text).toBe(hex("d8dee9"));
    expect(tokens.accent).toBe(hex("88c0d0"));
    expect(tokens.success).toBe(hex("a3be8c"));
    expect(tokens.warning).toBe(hex("ebcb8b"));
    expect(tokens.error).toBe(hex("bf616a"));
    expect(tokens.branchLocal).toBe(hex("b48ead"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(NORD_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(NORD_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(NORD_DEFINITIONS, 0).graph)).toBe(true);
  });
});
