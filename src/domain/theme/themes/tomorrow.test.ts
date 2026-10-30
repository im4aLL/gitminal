import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { TOMORROW_DEFINITIONS } from "./tomorrow";

describe("Tomorrow palette", () => {
  it("defines the single base light theme", () => {
    expect(readNames(TOMORROW_DEFINITIONS)).toEqual(["tomorrow"]);
    expect(readDefinition(TOMORROW_DEFINITIONS, 0).label).toBe("Tomorrow");
    expect(readDefinition(TOMORROW_DEFINITIONS, 0).variant).toBe("light");
  });

  it("pins the original palette values", () => {
    const tokens = readTokens(TOMORROW_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("ffffff"));
    expect(tokens.panel).toBe(hex("efefef"));
    expect(tokens.selection).toBe(hex("d6d6d6"));
    expect(tokens.text).toBe(hex("4d4d4c"));
    expect(tokens.dim).toBe(hex("8e908c"));
    expect(tokens.accent).toBe(hex("4271ae"));
    expect(tokens.success).toBe(hex("718c00"));
    expect(tokens.error).toBe(hex("c82829"));
    expect(tokens.info).toBe(hex("3e999f"));
    expect(tokens.branchLocal).toBe(hex("8959a8"));
  });

  it("reuses the text color for muted text and the orange for warning", () => {
    const tokens = readTokens(TOMORROW_DEFINITIONS, 0);

    expect(tokens.muted).toBe(tokens.text);
    expect(tokens.warning).toBe(hex("f5871f"));
    expect(tokens.warning).not.toBe(hex("eab700"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(TOMORROW_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(TOMORROW_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(TOMORROW_DEFINITIONS, 0).graph)).toBe(true);
  });
});
