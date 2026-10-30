import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { KANAGAWA_DEFINITIONS } from "./kanagawa";

describe("Kanagawa palette", () => {
  it("defines the single Wave theme", () => {
    expect(readNames(KANAGAWA_DEFINITIONS)).toEqual(["kanagawa"]);
    expect(readDefinition(KANAGAWA_DEFINITIONS, 0).label).toBe("Kanagawa");
    expect(readDefinition(KANAGAWA_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream Wave sumi and accent colors", () => {
    const tokens = readTokens(KANAGAWA_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("1f1f28"));
    expect(tokens.panel).toBe(hex("16161d"));
    expect(tokens.surface).toBe(hex("2a2a37"));
    expect(tokens.text).toBe(hex("dcd7ba"));
    expect(tokens.accent).toBe(hex("7e9cd8"));
    expect(tokens.success).toBe(hex("98bb6c"));
    expect(tokens.warning).toBe(hex("e6c384"));
    expect(tokens.error).toBe(hex("e46876"));
    expect(tokens.tag).toBe(hex("ffa066"));
  });

  it("uses the upstream winter diff backgrounds", () => {
    const tokens = readTokens(KANAGAWA_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("2b3328"));
    expect(tokens.diffRemoveBackground).toBe(hex("43242b"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(KANAGAWA_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(KANAGAWA_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(KANAGAWA_DEFINITIONS, 0).graph)).toBe(true);
  });
});
