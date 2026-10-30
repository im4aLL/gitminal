import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { JELLYBEANS_DEFINITIONS } from "./jellybeans";

describe("Jellybeans palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(JELLYBEANS_DEFINITIONS)).toEqual(["jellybeans"]);
    expect(readDefinition(JELLYBEANS_DEFINITIONS, 0).label).toBe("Jellybeans");
    expect(readDefinition(JELLYBEANS_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream palette values", () => {
    const tokens = readTokens(JELLYBEANS_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("151515"));
    expect(tokens.surface).toBe(hex("333333"));
    expect(tokens.text).toBe(hex("e8e8d3"));
    expect(tokens.accent).toBe(hex("8fbfdc"));
    expect(tokens.success).toBe(hex("99ad6a"));
    expect(tokens.error).toBe(hex("cf6a4c"));
  });

  it("pins the diff line backgrounds", () => {
    const tokens = readTokens(JELLYBEANS_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("437019"));
    expect(tokens.diffRemoveBackground).toBe(hex("201a18"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(JELLYBEANS_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(JELLYBEANS_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(JELLYBEANS_DEFINITIONS, 0).graph)).toBe(true);
  });
});
