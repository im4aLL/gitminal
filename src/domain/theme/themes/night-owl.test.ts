import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { NIGHT_OWL_DEFINITIONS } from "./night-owl";

describe("Night Owl palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(NIGHT_OWL_DEFINITIONS)).toEqual(["night-owl"]);
    expect(readDefinition(NIGHT_OWL_DEFINITIONS, 0).label).toBe("Night Owl");
    expect(readDefinition(NIGHT_OWL_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream palette values", () => {
    const tokens = readTokens(NIGHT_OWL_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("011627"));
    expect(tokens.surface).toBe(hex("0b2942"));
    expect(tokens.text).toBe(hex("d6deeb"));
    expect(tokens.accent).toBe(hex("82aaff"));
    expect(tokens.success).toBe(hex("22da6e"));
    expect(tokens.error).toBe(hex("ff5874"));
  });

  it("pins the diff line backgrounds", () => {
    const tokens = readTokens(NIGHT_OWL_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("03222b"));
    expect(tokens.diffRemoveBackground).toBe(hex("101a2c"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(NIGHT_OWL_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(NIGHT_OWL_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(NIGHT_OWL_DEFINITIONS, 0).graph)).toBe(true);
  });
});
