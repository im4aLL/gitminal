import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { AYU_DEFINITIONS } from "./ayu";

describe("Ayu palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(AYU_DEFINITIONS)).toEqual(["ayu"]);
    expect(readDefinition(AYU_DEFINITIONS, 0).label).toBe("Ayu");
    expect(readDefinition(AYU_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream surface and text colors", () => {
    const tokens = readTokens(AYU_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("0d1017"));
    expect(tokens.surface).toBe(hex("141821"));
    expect(tokens.border).toBe(hex("1b1f29"));
    expect(tokens.text).toBe(hex("bfbdb6"));
    expect(tokens.dim).toBe(hex("5a6673"));
  });

  it("pins the upstream accent, syntax, and VCS colors", () => {
    const tokens = readTokens(AYU_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("e6b450"));
    expect(tokens.success).toBe(hex("70bf56"));
    expect(tokens.warning).toBe(hex("ffb454"));
    expect(tokens.error).toBe(hex("f26d78"));
    expect(tokens.info).toBe(hex("59c2ff"));
    expect(tokens.tag).toBe(hex("ff8f40"));
    expect(tokens.branchLocal).toBe(hex("d2a6ff"));
    expect(tokens.branchRemote).toBe(hex("39bae6"));
  });

  it("flattens the published selection alpha over the background", () => {
    const tokens = readTokens(AYU_DEFINITIONS, 0);

    expect(tokens.selection).toBe(hex("212733"));
    expect(tokens.selection).not.toBe(tokens.background);
  });

  it("does not use the published muted tone that misses the contrast floor", () => {
    const tokens = readTokens(AYU_DEFINITIONS, 0);

    expect(tokens.muted).not.toBe(hex("5a6378"));
    expect(tokens.muted).toBe(hex("667381"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(AYU_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(AYU_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(AYU_DEFINITIONS, 0).graph)).toBe(true);
  });
});
