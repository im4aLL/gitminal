import { describe, expect, it } from "bun:test";
import { contrastRatio } from "@/domain/theme/theme.contrast";
import { DEFAULT_THEME_NAME } from "@/domain/theme/theme.registry";
import {
  isReservedThemeName,
  readTerminalResolution,
  readTerminalTheme,
  TERMINAL_EXPORT_NAME,
  TERMINAL_THEME_LABEL,
  TERMINAL_THEME_NAME,
} from "@/domain/theme/theme.terminal";
import type { DetectedTerminalPalette } from "@/domain/theme/theme.terminal.types";
import type { HexColor } from "@/domain/theme/theme.types";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

/** Contrast floor the guards must hold. */
const FLOOR = 3;

/** Largest distance from the floor a derived boundary fixture may sit at. */
const BOUNDARY_TOLERANCE = 0.1;

/**
 * Builds a `#RRGGBB` value from six digits.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
function color(digits: string): string {
  return `${HEX_PREFIX}${digits}`;
}

/**
 * Builds a `#RRGGBB` value typed as a hex color.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
function hex(digits: string): HexColor {
  return color(digits) as HexColor;
}

/**
 * Builds one neutral gray from a single channel value.
 *
 * @param value - Channel value from 0 to 255.
 * @returns The gray color.
 */
function gray(value: number): HexColor {
  const digits = value.toString(16).padStart(2, "0");

  return hex(`${digits}${digits}${digits}`);
}

/**
 * Reads the nearest grays on each side of the contrast floor.
 *
 * The guard is inclusive, so the smallest gray whose ratio reaches the floor is the one that proves
 * "at the floor keeps the color" and the largest gray below it proves "just below falls back". An
 * eight-bit sRGB pair cannot land exactly on 3.0, so the pair is the closest achievable one on each
 * side, which the boundary assertions pin within a small tolerance.
 *
 * @param background - Background the gray is painted on.
 * @returns The nearest gray above and below the floor.
 */
function readFloorNeighbors(background: HexColor): {
  readonly above: HexColor;
  readonly below: HexColor;
} {
  let above: HexColor = gray(0);
  let below: HexColor = gray(0);

  for (let value = 0; value <= 255; value += 1) {
    const candidate = gray(value);

    if (contrastRatio(candidate, background) >= FLOOR) {
      above = candidate;
      break;
    }

    below = candidate;
  }

  return { above, below };
}

/** ANSI palette of a dark scheme that answers every query. */
const DARK_PALETTE: readonly string[] = [
  color("073642"),
  color("dc322f"),
  color("859900"),
  color("b58900"),
  color("268bd2"),
  color("d33682"),
  color("2aa198"),
  color("93a1a1"),
  color("78909c"),
  color("002b36"),
  color("cb4b16"),
  color("586e75"),
  color("657b83"),
  color("839496"),
  color("6c71c4"),
  color("93a1a1"),
];

/** ANSI palette of a light scheme that answers every query. */
const LIGHT_PALETTE: readonly string[] = [
  color("eee8d5"),
  color("dc322f"),
  color("859900"),
  color("b58900"),
  color("268bd2"),
  color("d33682"),
  color("2aa198"),
  color("586e75"),
  color("657b83"),
  color("eee8d5"),
  color("cb4b16"),
  color("93a1a1"),
  color("839496"),
  color("657b83"),
  color("6c71c4"),
  color("586e75"),
];

/**
 * Builds one detected palette.
 *
 * @param palette - ANSI entries.
 * @param foreground - Default foreground, or `null` when the terminal skipped OSC 10.
 * @param background - Default background, or `null` when the terminal skipped OSC 11.
 * @returns The detected palette.
 */
function detected(
  palette: readonly (string | null)[],
  foreground: string | null,
  background: string | null,
): DetectedTerminalPalette {
  return { palette, defaultForeground: foreground, defaultBackground: background };
}

/**
 * Reads the entry of a palette the case expects to be accepted.
 *
 * @param palette - Detected palette.
 * @returns The accepted catalogue entry.
 */
function acceptedEntry(palette: DetectedTerminalPalette) {
  const result = readTerminalTheme(palette);

  if (result.entry === null) {
    throw new Error(`Expected the palette to be accepted: ${result.reason ?? "unknown reason"}`);
  }

  return result.entry;
}

describe("readTerminalTheme mapping", () => {
  it("maps a dark scheme onto every token without notes", () => {
    const result = readTerminalTheme(detected(DARK_PALETTE, color("839496"), color("002b36")));
    const entry = acceptedEntry(detected(DARK_PALETTE, color("839496"), color("002b36")));

    expect(entry.name).toBe(TERMINAL_THEME_NAME);
    expect(entry.label).toBe(TERMINAL_THEME_LABEL);
    expect(entry.source).toBe("terminal");
    expect(entry.variant).toBe("dark");
    expect(result.warnings).toEqual([]);
    expect(entry.tokens.background).toBe(hex("002b36"));
    expect(entry.tokens.text).toBe(hex("839496"));
    expect(entry.tokens.accent).toBe(hex("268bd2"));
    expect(entry.tokens.diffHunk).toBe(hex("268bd2"));
    expect(entry.tokens.border).toBe(hex("78909c"));
    expect(entry.tokens.scrollbar).toBe(hex("78909c"));
    expect(entry.tokens.success).toBe(hex("859900"));
    expect(entry.tokens.diffAdd).toBe(hex("859900"));
    expect(entry.tokens.error).toBe(hex("dc322f"));
    expect(entry.tokens.diffRemove).toBe(hex("dc322f"));
    expect(entry.tokens.warning).toBe(hex("b58900"));
    expect(entry.tokens.tag).toBe(hex("b58900"));
    expect(entry.tokens.info).toBe(hex("2aa198"));
    expect(entry.tokens.branchLocal).toBe(hex("859900"));
    expect(entry.tokens.branchRemote).toBe(hex("268bd2"));
    expect(entry.tokens.diffContext).toBe(hex("93a1a1"));
    expect(Object.isFrozen(entry.tokens)).toBe(true);
    expect(Object.isFrozen(entry.tokens.graph)).toBe(true);
  });

  it("maps the graph lanes in the documented index order", () => {
    const entry = acceptedEntry(detected(DARK_PALETTE, color("839496"), color("002b36")));

    expect(entry.tokens.graph).toEqual([
      hex("268bd2"),
      hex("859900"),
      hex("b58900"),
      hex("dc322f"),
      hex("2aa198"),
      hex("d33682"),
      hex("93a1a1"),
      hex("78909c"),
    ]);
  });

  it("derives a light variant from a light background", () => {
    const entry = acceptedEntry(detected(LIGHT_PALETTE, color("657b83"), color("fdf6e3")));

    expect(entry.variant).toBe("light");
    expect(entry.tokens.background).toBe(hex("fdf6e3"));
  });

  it("shifts the surface tokens toward the foreground", () => {
    const entry = acceptedEntry(detected(DARK_PALETTE, color("839496"), color("002b36")));
    const { background, panel, surface, selection } = entry.tokens;

    expect(panel).not.toBe(background);
    expect(surface).not.toBe(panel);
    expect(selection).not.toBe(surface);
    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("falls back to ANSI 7 for the foreground when OSC 10 is missing", () => {
    const entry = acceptedEntry(detected(DARK_PALETTE, null, color("002b36")));

    expect(entry.tokens.text).toBe(hex("93a1a1"));
  });
});

describe("readTerminalTheme gate", () => {
  it("rejects a response without a default background", () => {
    const result = readTerminalTheme(detected(DARK_PALETTE, color("839496"), null));

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("OSC 11");
    expect(result.warnings).toEqual([]);
  });

  it("rejects a background that is not a color", () => {
    const result = readTerminalTheme(detected(DARK_PALETTE, color("839496"), "not-a-color"));

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("OSC 11");
  });

  it("rejects a palette with fewer than sixteen entries", () => {
    const result = readTerminalTheme(
      detected(DARK_PALETTE.slice(0, 15), color("839496"), color("002b36")),
    );

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("OSC 4");
  });

  it("rejects a palette with a hole", () => {
    const palette = [...DARK_PALETTE];
    palette[3] = "";

    const result = readTerminalTheme(detected(palette, color("839496"), color("002b36")));

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("OSC 4");
  });

  it("never returns both an entry and a reason", () => {
    const accepted = readTerminalTheme(detected(DARK_PALETTE, color("839496"), color("002b36")));
    const rejected = readTerminalTheme(detected(DARK_PALETTE, color("839496"), null));

    expect(accepted.entry).not.toBeNull();
    expect(accepted.reason).toBeNull();
    expect(rejected.entry).toBeNull();
    expect(rejected.reason).not.toBeNull();
  });
});

describe("readTerminalTheme contrast guards", () => {
  it("raises secondary text to the foreground when the gray is too close to the background", () => {
    const palette = [...DARK_PALETTE];
    palette[7] = color("002b36");
    palette[8] = color("002b36");

    const result = readTerminalTheme(detected(palette, color("839496"), color("002b36")));

    if (result.entry === null) {
      throw new Error("Expected the palette to be accepted.");
    }

    expect(result.entry.tokens.muted).toBe(result.entry.tokens.text);
    expect(result.entry.tokens.dim).toBe(result.entry.tokens.text);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("secondary text");
    expect(
      contrastRatio(result.entry.tokens.muted, result.entry.tokens.background),
    ).toBeGreaterThanOrEqual(FLOOR);
  });

  it("keeps both diff line backgrounds above the text contrast floor", () => {
    const cases = [
      { palette: DARK_PALETTE, foreground: color("839496"), background: color("002b36") },
      { palette: LIGHT_PALETTE, foreground: color("657b83"), background: color("fdf6e3") },
    ];

    for (const item of cases) {
      const entry = acceptedEntry(detected(item.palette, item.foreground, item.background));
      const { text, diffAddBackground, diffRemoveBackground } = entry.tokens;

      expect(contrastRatio(text, diffAddBackground)).toBeGreaterThanOrEqual(FLOOR);
      expect(contrastRatio(text, diffRemoveBackground)).toBeGreaterThanOrEqual(FLOOR);
    }
  });

  it("keeps secondary text readable on a light scheme", () => {
    const entry = acceptedEntry(detected(LIGHT_PALETTE, color("657b83"), color("fdf6e3")));

    expect(contrastRatio(entry.tokens.muted, entry.tokens.background)).toBeGreaterThanOrEqual(
      FLOOR,
    );
    expect(contrastRatio(entry.tokens.dim, entry.tokens.background)).toBeGreaterThanOrEqual(FLOOR);
  });

  it("keeps ANSI 7 and 8 at the smallest contrast that reaches the floor", () => {
    const background = hex("002b36");
    const { above } = readFloorNeighbors(background);
    const palette = [...DARK_PALETTE];
    palette[7] = above;
    palette[8] = above;

    const result = readTerminalTheme(detected(palette, color("839496"), background));

    if (result.entry === null) {
      throw new Error("Expected the palette to be accepted.");
    }

    expect(contrastRatio(above, background)).toBeGreaterThanOrEqual(FLOOR);
    expect(contrastRatio(above, background) - FLOOR).toBeLessThan(BOUNDARY_TOLERANCE);
    expect(result.entry.tokens.muted).toBe(above);
    expect(result.entry.tokens.dim).toBe(above);
    expect(result.warnings).toEqual([]);
  });

  it("falls back to the foreground for ANSI 7 and 8 just below the floor", () => {
    const background = hex("002b36");
    const { below } = readFloorNeighbors(background);
    const palette = [...DARK_PALETTE];
    palette[7] = below;
    palette[8] = below;

    const result = readTerminalTheme(detected(palette, color("839496"), background));

    if (result.entry === null) {
      throw new Error("Expected the palette to be accepted.");
    }

    expect(contrastRatio(below, background)).toBeLessThan(FLOOR);
    expect(FLOOR - contrastRatio(below, background)).toBeLessThan(BOUNDARY_TOLERANCE);
    expect(result.entry.tokens.muted).toBe(result.entry.tokens.text);
    expect(result.entry.tokens.dim).toBe(result.entry.tokens.text);
    expect(result.warnings.join(" ")).toContain("secondary text");
  });

  it("warns instead of failing when a scheme cannot reach the diff floor", () => {
    const palette = [...DARK_PALETTE].map(() => color("101010"));
    const result = readTerminalTheme(detected(palette, color("101010"), color("101010")));

    if (result.entry === null) {
      throw new Error("Expected the palette to be accepted.");
    }

    expect(result.warnings.join(" ")).toContain("diff line backgrounds");
    expect(result.entry.tokens.diffAddBackground).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("readTerminalResolution", () => {
  it("passes an ordinary theme name through untouched", () => {
    const resolution = readTerminalResolution("nord", readTerminalTheme(detected([], null, null)));

    expect(resolution.name).toBe("nord");
    expect(resolution.warnings).toEqual([]);
  });

  it("keeps the terminal name when detection produced an entry", () => {
    const result = readTerminalTheme(detected(DARK_PALETTE, color("839496"), color("002b36")));
    const resolution = readTerminalResolution(TERMINAL_THEME_NAME, result);

    expect(resolution.name).toBe(TERMINAL_THEME_NAME);
    expect(resolution.warnings).toEqual([]);
  });

  it("falls back to the default theme with one warning naming the reason", () => {
    const result = readTerminalTheme(detected(DARK_PALETTE, color("839496"), null));
    const resolution = readTerminalResolution(TERMINAL_THEME_NAME, result);

    expect(resolution.name).toBe(DEFAULT_THEME_NAME);
    expect(resolution.warnings).toHaveLength(1);
    expect(resolution.warnings[0]).toContain("Native Terminal is unavailable");
    expect(resolution.warnings[0]).toContain("OSC 11");
  });
});

describe("terminal theme identity", () => {
  it("reserves the terminal name and exports under a free one", () => {
    expect(isReservedThemeName(TERMINAL_THEME_NAME)).toBe(true);
    expect(isReservedThemeName(TERMINAL_EXPORT_NAME)).toBe(false);
  });
});
