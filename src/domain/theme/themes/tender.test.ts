import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { TENDER_DEFINITIONS } from "./tender";

describe("Tender palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(TENDER_DEFINITIONS)).toEqual(["tender"]);
    expect(readDefinition(TENDER_DEFINITIONS, 0).label).toBe("Tender");
    expect(readDefinition(TENDER_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream palette values", () => {
    const tokens = readTokens(TENDER_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("282828"));
    expect(tokens.surface).toBe(hex("202020"));
    expect(tokens.text).toBe(hex("eeeeee"));
    expect(tokens.accent).toBe(hex("73cef4"));
    expect(tokens.success).toBe(hex("c9d05c"));
    expect(tokens.error).toBe(hex("f43753"));
  });

  it("pins the diff line backgrounds", () => {
    const tokens = readTokens(TENDER_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("32322b"));
    expect(tokens.diffRemoveBackground).toBe(hex("34292b"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(TENDER_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(TENDER_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(TENDER_DEFINITIONS, 0).graph)).toBe(true);
  });
});
