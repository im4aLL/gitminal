import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readTokens } from "@/test/theme.harness";
import { ZENBURN_DEFINITIONS } from "./zenburn";

describe("Zenburn palette", () => {
  it("defines the single dark theme", () => {
    expect(ZENBURN_DEFINITIONS).toHaveLength(1);
    expect(readDefinition(ZENBURN_DEFINITIONS, 0).name).toBe("zenburn");
    expect(readDefinition(ZENBURN_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream normal, comment, and syntax colors", () => {
    const tokens = readTokens(ZENBURN_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("3f3f3f"));
    expect(tokens.text).toBe(hex("dcdccc"));
    expect(tokens.accent).toBe(hex("f0dfaf"));
    expect(tokens.error).toBe(hex("cc9393"));
    expect(tokens.info).toBe(hex("8cd0d3"));
    expect(tokens.success).toBe(hex("9ece9e"));
    expect(tokens.tag).toBe(hex("dfaf8f"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(ZENBURN_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(ZENBURN_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(ZENBURN_DEFINITIONS, 0).graph)).toBe(true);
  });
});
