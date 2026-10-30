import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { SEOUL256_DEFINITIONS } from "./seoul256";

describe("Seoul256 palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(SEOUL256_DEFINITIONS)).toEqual(["seoul256"]);
    expect(readDefinition(SEOUL256_DEFINITIONS, 0).label).toBe("Seoul256");
    expect(readDefinition(SEOUL256_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the default 256-color background and foreground entries", () => {
    const tokens = readTokens(SEOUL256_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("3a3a3a"));
    expect(tokens.panel).toBe(hex("262626"));
    expect(tokens.text).toBe(hex("d0d0d0"));
    expect(tokens.dim).toBe(hex("5f875f"));
  });

  it("pins the scheme syntax colors", () => {
    const tokens = readTokens(SEOUL256_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("87afd7"));
    expect(tokens.success).toBe(hex("87af87"));
    expect(tokens.warning).toBe(hex("d7af5f"));
    expect(tokens.error).toBe(hex("d75f87"));
    expect(tokens.tag).toBe(hex("d7875f"));
    expect(tokens.branchRemote).toBe(hex("87d7d7"));
  });

  it("uses the scheme DiffAdd and DiffDelete fills as diff backgrounds", () => {
    const tokens = readTokens(SEOUL256_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("005f00"));
    expect(tokens.diffRemoveBackground).toBe(hex("875f5f"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(SEOUL256_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(SEOUL256_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(SEOUL256_DEFINITIONS, 0).graph)).toBe(true);
  });
});
