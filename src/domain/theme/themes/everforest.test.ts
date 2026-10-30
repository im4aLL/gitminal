import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { EVERFOREST_DEFINITIONS } from "./everforest";

describe("Everforest palette", () => {
  it("defines the single medium-contrast dark theme", () => {
    expect(readNames(EVERFOREST_DEFINITIONS)).toEqual(["everforest"]);
    expect(readDefinition(EVERFOREST_DEFINITIONS, 0).label).toBe("Everforest");
    expect(readDefinition(EVERFOREST_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream medium background ramp", () => {
    const tokens = readTokens(EVERFOREST_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("2d353b"));
    expect(tokens.panel).toBe(hex("232a2e"));
    expect(tokens.surface).toBe(hex("343f44"));
    expect(tokens.border).toBe(hex("3d484d"));
  });

  it("pins the upstream foreground and signal colors", () => {
    const tokens = readTokens(EVERFOREST_DEFINITIONS, 0);

    expect(tokens.text).toBe(hex("d3c6aa"));
    expect(tokens.muted).toBe(hex("859289"));
    expect(tokens.accent).toBe(hex("a7c080"));
    expect(tokens.warning).toBe(hex("dbbc7f"));
    expect(tokens.error).toBe(hex("e67e80"));
    expect(tokens.info).toBe(hex("7fbbb3"));
    expect(tokens.branchLocal).toBe(hex("d699b6"));
  });

  it("uses the upstream bg_green and bg_red diff backgrounds", () => {
    const tokens = readTokens(EVERFOREST_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("425047"));
    expect(tokens.diffRemoveBackground).toBe(hex("514045"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(EVERFOREST_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(EVERFOREST_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(EVERFOREST_DEFINITIONS, 0).graph)).toBe(true);
  });
});
