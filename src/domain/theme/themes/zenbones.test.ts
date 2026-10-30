import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { ZENBONES_DEFINITIONS } from "./zenbones";

describe("Zenbones palette", () => {
  it("defines the single Zenwritten dark theme", () => {
    expect(readNames(ZENBONES_DEFINITIONS)).toEqual(["zenbones"]);
    expect(readDefinition(ZENBONES_DEFINITIONS, 0).label).toBe("Zenbones");
    expect(readDefinition(ZENBONES_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream near-monochrome surfaces and text", () => {
    const tokens = readTokens(ZENBONES_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("191919"));
    expect(tokens.surface).toBe(hex("2c2c2c"));
    expect(tokens.selection).toBe(hex("444444"));
    expect(tokens.text).toBe(hex("bbbbbb"));
    expect(tokens.muted).toBe(hex("8e8e8e"));
    expect(tokens.dim).toBe(hex("686868"));
  });

  it("pins the diagnostic colors that carry meaning in the scheme", () => {
    const tokens = readTokens(ZENBONES_DEFINITIONS, 0);

    expect(tokens.success).toBe(hex("819b69"));
    expect(tokens.warning).toBe(hex("b77e64"));
    expect(tokens.error).toBe(hex("de6e7c"));
    expect(tokens.info).toBe(hex("6099c0"));
    expect(tokens.branchLocal).toBe(hex("b279a7"));
    expect(tokens.branchRemote).toBe(hex("66a5ad"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(ZENBONES_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(ZENBONES_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(ZENBONES_DEFINITIONS, 0).graph)).toBe(true);
  });
});
