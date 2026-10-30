import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { SRCERY_DEFINITIONS } from "./srcery";

describe("Srcery palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(SRCERY_DEFINITIONS)).toEqual(["srcery"]);
    expect(readDefinition(SRCERY_DEFINITIONS, 0).label).toBe("Srcery");
    expect(readDefinition(SRCERY_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream palette values", () => {
    const tokens = readTokens(SRCERY_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("1c1b19"));
    expect(tokens.surface).toBe(hex("262522"));
    expect(tokens.text).toBe(hex("fce8c3"));
    expect(tokens.accent).toBe(hex("fbb829"));
    expect(tokens.success).toBe(hex("519f50"));
    expect(tokens.error).toBe(hex("ef2f27"));
  });

  it("pins the diff line backgrounds", () => {
    const tokens = readTokens(SRCERY_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("294229"));
    expect(tokens.diffRemoveBackground).toBe(hex("4f2321"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(SRCERY_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(SRCERY_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(SRCERY_DEFINITIONS, 0).graph)).toBe(true);
  });
});
