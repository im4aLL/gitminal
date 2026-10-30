import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { NOCTIS_DEFINITIONS } from "./noctis";

describe("Noctis palette", () => {
  it("defines the single default dark theme", () => {
    expect(readNames(NOCTIS_DEFINITIONS)).toEqual(["noctis"]);
    expect(readDefinition(NOCTIS_DEFINITIONS, 0).label).toBe("Noctis");
    expect(readDefinition(NOCTIS_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream workbench surfaces", () => {
    const tokens = readTokens(NOCTIS_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("052529"));
    expect(tokens.panel).toBe(hex("041d20"));
    expect(tokens.surface).toBe(hex("073940"));
    expect(tokens.selection).toBe(hex("0e6671"));
    expect(tokens.text).toBe(hex("b2cacd"));
    expect(tokens.dim).toBe(hex("5b858b"));
  });

  it("pins the upstream syntax colors", () => {
    const tokens = readTokens(NOCTIS_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("40d4e7"));
    expect(tokens.success).toBe(hex("49e9a6"));
    expect(tokens.warning).toBe(hex("d5971a"));
    expect(tokens.error).toBe(hex("e3541c"));
    expect(tokens.info).toBe(hex("49ace9"));
    expect(tokens.tag).toBe(hex("e66533"));
    expect(tokens.branchLocal).toBe(hex("df769b"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(NOCTIS_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(NOCTIS_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(NOCTIS_DEFINITIONS, 0).graph)).toBe(true);
  });
});
