import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { NIGHTFOX_DEFINITIONS } from "./nightfox";

describe("Nightfox palette", () => {
  it("defines the single canonical theme", () => {
    expect(readNames(NIGHTFOX_DEFINITIONS)).toEqual(["nightfox"]);
    expect(readDefinition(NIGHTFOX_DEFINITIONS, 0).label).toBe("Nightfox");
    expect(readDefinition(NIGHTFOX_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream bg and fg ramps", () => {
    const tokens = readTokens(NIGHTFOX_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("192330"));
    expect(tokens.panel).toBe(hex("131a24"));
    expect(tokens.surface).toBe(hex("212e3f"));
    expect(tokens.border).toBe(hex("29394f"));
    expect(tokens.text).toBe(hex("cdcecf"));
    expect(tokens.muted).toBe(hex("aeafb0"));
    expect(tokens.dim).toBe(hex("738091"));
  });

  it("pins the upstream palette colors", () => {
    const tokens = readTokens(NIGHTFOX_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("719cd6"));
    expect(tokens.success).toBe(hex("81b29a"));
    expect(tokens.warning).toBe(hex("dbc074"));
    expect(tokens.error).toBe(hex("c94f6d"));
    expect(tokens.info).toBe(hex("63cdcf"));
    expect(tokens.tag).toBe(hex("f4a261"));
    expect(tokens.branchLocal).toBe(hex("9d79d6"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(NIGHTFOX_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(NIGHTFOX_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(NIGHTFOX_DEFINITIONS, 0).graph)).toBe(true);
  });
});
