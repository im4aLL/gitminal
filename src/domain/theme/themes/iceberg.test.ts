import { describe, expect, it } from "bun:test";
import { hex, readDefinition, readNames, readTokens } from "@/test/theme.harness";
import { ICEBERG_DEFINITIONS } from "./iceberg";

describe("Iceberg palette", () => {
  it("defines the single dark theme", () => {
    expect(readNames(ICEBERG_DEFINITIONS)).toEqual(["iceberg"]);
    expect(readDefinition(ICEBERG_DEFINITIONS, 0).label).toBe("Iceberg");
    expect(readDefinition(ICEBERG_DEFINITIONS, 0).variant).toBe("dark");
  });

  it("pins the upstream palette values", () => {
    const tokens = readTokens(ICEBERG_DEFINITIONS, 0);

    expect(tokens.background).toBe(hex("161821"));
    expect(tokens.surface).toBe(hex("1e2132"));
    expect(tokens.text).toBe(hex("c6c8d1"));
    expect(tokens.accent).toBe(hex("84a0c6"));
    expect(tokens.success).toBe(hex("b4be82"));
    expect(tokens.error).toBe(hex("e27878"));
  });

  it("pins the diff line backgrounds", () => {
    const tokens = readTokens(ICEBERG_DEFINITIONS, 0);

    expect(tokens.diffAddBackground).toBe(hex("1f2227"));
    expect(tokens.diffRemoveBackground).toBe(hex("221e26"));
  });

  it("freezes the definition and its token data", () => {
    expect(Object.isFrozen(ICEBERG_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(readTokens(ICEBERG_DEFINITIONS, 0))).toBe(true);
    expect(Object.isFrozen(readTokens(ICEBERG_DEFINITIONS, 0).graph)).toBe(true);
  });
});
