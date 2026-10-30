import { describe, expect, it } from "bun:test";
import { hex, readNames, readTokens } from "@/test/theme.harness";
import { DRACULA_DEFINITIONS } from "./dracula";

describe("Dracula palettes", () => {
  it("defines Dracula and Alucard in picker order", () => {
    expect(readNames(DRACULA_DEFINITIONS)).toEqual(["dracula", "dracula-alucard"]);
    expect(DRACULA_DEFINITIONS.map((definition) => definition.label)).toEqual([
      "Dracula",
      "Dracula Alucard",
    ]);
    expect(DRACULA_DEFINITIONS.map((definition) => definition.variant)).toEqual(["dark", "light"]);
  });

  it("pins the official Dracula palette", () => {
    const tokens = readTokens(DRACULA_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("282a36"));
    expect(tokens.text).toBe(hex("f8f8f2"));
    expect(tokens.muted).toBe(hex("6272a4"));
    expect(tokens.accent).toBe(hex("bd93f9"));
    expect(tokens.success).toBe(hex("50fa7b"));
    expect(tokens.warning).toBe(hex("f1fa8c"));
    expect(tokens.error).toBe(hex("ff5555"));
    expect(tokens.info).toBe(hex("8be9fd"));
    expect(tokens.tag).toBe(hex("ffb86c"));
  });

  it("pins the official Alucard palette", () => {
    const tokens = readTokens(DRACULA_DEFINITIONS, 1);

    expect(tokens.background).toBe(hex("fffbeb"));
    expect(tokens.text).toBe(hex("1f1f1f"));
    expect(tokens.accent).toBe(hex("644ac9"));
    expect(tokens.success).toBe(hex("14710a"));
    expect(tokens.error).toBe(hex("cb3a2a"));
    expect(tokens.info).toBe(hex("036a96"));
    expect(tokens.tag).toBe(hex("a34d14"));
  });

  it("freezes every definition and its token data", () => {
    expect(Object.isFrozen(DRACULA_DEFINITIONS)).toBe(true);

    for (const definition of DRACULA_DEFINITIONS) {
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
