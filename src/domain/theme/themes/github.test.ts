import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { GITHUB_DEFINITIONS } from "./github";

describe("GitHub Light palette", () => {
  it("defines the single light theme", () => {
    expect(readNames(GITHUB_DEFINITIONS)).toEqual(["github-light"]);
    expect(readDefinition(GITHUB_DEFINITIONS, 0).label).toBe("GitHub Light");
    expect(readDefinition(GITHUB_DEFINITIONS, 0).variant).toBe("light");
  });

  it("pins the Primer canvas, fg, and border tokens", () => {
    const tokens = readTokens(GITHUB_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("f6f8fa"));
    expect(tokens.panel).toBe(hex("ffffff"));
    expect(tokens.surface).toBe(hex("eaeef2"));
    expect(tokens.border).toBe(hex("d0d7de"));
    expect(tokens.text).toBe(hex("1f2328"));
    expect(tokens.muted).toBe(hex("656d76"));
    expect(tokens.dim).toBe(hex("6e7781"));
  });

  it("pins the Primer signal colors", () => {
    const tokens = readTokens(GITHUB_DEFINITIONS, 0);

    expect(tokens.accent).toBe(hex("0969da"));
    expect(tokens.success).toBe(hex("1a7f37"));
    expect(tokens.warning).toBe(hex("9a6700"));
    expect(tokens.error).toBe(hex("cf222e"));
    expect(tokens.branchLocal).toBe(hex("8250df"));
    expect(tokens.tag).toBe(hex("bc4c00"));
  });

  it("uses the Primer diffBlob line fills as diff backgrounds", () => {
    const tokens = readTokens(GITHUB_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("e6ffec"));
    expect(tokens.diffRemoveBackground).toBe(hex("ffebe9"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(GITHUB_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(GITHUB_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(GITHUB_DEFINITIONS, 0).graph)).toBe(true);
  });
});
