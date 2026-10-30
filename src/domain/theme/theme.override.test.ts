import { describe, expect, it } from "bun:test";
import { createBuiltInCatalogue, getCatalogueEntry } from "@/domain/theme/theme.catalogue";
import type { ThemeCatalogueEntry } from "@/domain/theme/theme.catalogue.types";
import {
  mergeOverrideLayer,
  readOverrideLayer,
  readThemeColorMap,
} from "@/domain/theme/theme.override";
import type { ThemeOverrideLayer } from "@/domain/theme/theme.override.types";
import type { HexColor } from "@/domain/theme/theme.types";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

/** Source label used by a theme file in the shared warning vocabulary. */
const THEME_SOURCE = 'theme "hadi-ink"';

/**
 * Builds a `#RRGGBB` value from six digits.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
function color(digits: string): HexColor {
  return `${HEX_PREFIX}${digits}` as HexColor;
}

/**
 * Reads one built-in catalogue entry, failing loudly instead of returning `undefined`.
 *
 * @param name - Built-in theme name.
 * @returns The catalogue entry.
 */
function entry(name = "catppuccin-mocha"): ThemeCatalogueEntry {
  const found = getCatalogueEntry(createBuiltInCatalogue(), name);

  if (found === undefined) {
    throw new Error(`Missing built-in theme "${name}".`);
  }

  return found;
}

/**
 * Builds a lane list of `count` distinct colors.
 *
 * @param count - Number of lanes.
 * @returns The lane colors.
 */
function lanes(count: number): readonly HexColor[] {
  return Array.from({ length: count }, (_, index) =>
    color((index + 1).toString(16).padStart(6, "0")),
  );
}

describe("readThemeColorMap shared validation", () => {
  it("accepts known tokens and lowercases their colors", () => {
    const result = readThemeColorMap(
      { accent: `${HEX_PREFIX}ABCDEF`, graph: [`${HEX_PREFIX}112233`] },
      { source: "theme.json", keepsBase: true, warnings: [] },
    );

    expect(result.tokens).toEqual({ accent: color("abcdef") });
    expect(result.graph).toEqual([color("112233")]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.tokens)).toBe(true);
    expect(Object.isFrozen(result.graph)).toBe(true);
  });

  it("keeps base wording for theme.json drops", () => {
    const warnings: string[] = [];

    readThemeColorMap(
      { accent: "red", sparkle: color("abcdef") },
      { source: "theme.json", keepsBase: true, warnings },
    );

    expect(warnings).toEqual([
      'Invalid color for "accent" in theme.json; the base color was kept.',
      'Unknown token "sparkle" in theme.json; the base color was kept.',
    ]);
  });

  it("uses ignored wording for a standalone theme drop", () => {
    const warnings: string[] = [];

    readThemeColorMap(
      { accent: "red", sparkle: color("abcdef") },
      { source: THEME_SOURCE, keepsBase: false, warnings },
    );

    expect(warnings).toEqual([
      `Invalid color for "accent" in ${THEME_SOURCE}; the color was ignored.`,
      `Unknown token "sparkle" in ${THEME_SOURCE}; the color was ignored.`,
    ]);
  });

  it("states incompleteness for a dropped graph list in a standalone theme", () => {
    const warnings: string[] = [];

    expect(
      readThemeColorMap({ graph: 3 }, { source: THEME_SOURCE, keepsBase: false, warnings }).graph,
    ).toBeNull();
    expect(
      readThemeColorMap({ graph: [] }, { source: THEME_SOURCE, keepsBase: false, warnings }).graph,
    ).toBeNull();

    expect(warnings).toEqual([
      `The "graph" color list in ${THEME_SOURCE} must be an array; the theme is incomplete without it.`,
      `The "graph" color list in ${THEME_SOURCE} has no valid colors; the theme is incomplete without it.`,
    ]);
  });

  it("keeps the base lanes for a non-list, an empty list, and invalid entries", () => {
    const warnings: string[] = [];

    expect(
      readThemeColorMap({ graph: 3 }, { source: THEME_SOURCE, keepsBase: true, warnings }).graph,
    ).toBeNull();
    expect(
      readThemeColorMap({ graph: [] }, { source: THEME_SOURCE, keepsBase: true, warnings }).graph,
    ).toBeNull();
    expect(
      readThemeColorMap(
        { graph: [color("111111"), "nope"] },
        { source: THEME_SOURCE, keepsBase: true, warnings },
      ).graph,
    ).toEqual([color("111111")]);

    expect(warnings).toEqual([
      `The "graph" color list in ${THEME_SOURCE} must be an array; the base lanes were kept.`,
      `The "graph" color list in ${THEME_SOURCE} has no valid colors; the base lanes were kept.`,
      `Invalid graph lane color in ${THEME_SOURCE}; the base lane was kept.`,
    ]);
  });

  it("returns a null graph when the field is absent", () => {
    const result = readThemeColorMap(
      { accent: color("112233") },
      { source: THEME_SOURCE, keepsBase: true, warnings: [] },
    );

    expect(result.graph).toBeNull();
  });

  it("caps an accepted lane list at sixteen colors", () => {
    const warnings: string[] = [];
    const raw = lanes(18);
    const result = readThemeColorMap(
      { graph: raw },
      { source: THEME_SOURCE, keepsBase: true, warnings },
    );

    expect(result.graph).toEqual(raw.slice(0, 16));
    expect(result.graph).toHaveLength(16);
    expect(warnings).toEqual([
      `The "graph" color list in ${THEME_SOURCE} keeps at most 16 colors; the rest were ignored.`,
    ]);
  });
});

describe("readOverrideLayer", () => {
  it("returns the validated theme.json layer", () => {
    expect(readOverrideLayer({ colors: { accent: color("112233") } }, [])).toEqual({
      tokens: { accent: color("112233") },
      graph: null,
    });
  });

  it("caps the graph lane list through the theme.json envelope", () => {
    const warnings: string[] = [];
    const raw = lanes(18);
    const layer = readOverrideLayer({ colors: { graph: raw } }, warnings);

    expect(layer?.graph).toEqual(raw.slice(0, 16));
    expect(layer?.graph).toHaveLength(16);
    expect(warnings).toEqual([
      'The "graph" color list in theme.json keeps at most 16 colors; the rest were ignored.',
    ]);
  });

  it("keeps the theme.json envelope warnings", () => {
    const warnings: string[] = [];

    expect(readOverrideLayer({ version: 2, colors: {} }, warnings)).toBeNull();
    expect(readOverrideLayer({ version: 1 }, warnings)).toBeNull();
    expect(warnings).toEqual([
      "Unsupported version in theme.json; the file was ignored.",
      "theme.json has no colors object; the base theme is in use.",
    ]);
  });
});

describe("mergeOverrideLayer", () => {
  it("returns the catalogue token object by reference when nothing is layered", () => {
    const definition = entry();
    const emptyLayer: ThemeOverrideLayer = { tokens: {}, graph: null };

    expect(mergeOverrideLayer(definition, null)).toBe(definition.tokens);
    expect(mergeOverrideLayer(definition, emptyLayer)).toBe(definition.tokens);
    expect(mergeOverrideLayer(definition, emptyLayer)).toBe(mergeOverrideLayer(definition, null));
  });

  it("layers token overrides without mutating the base", () => {
    const definition = entry();
    const accent = color("112233");
    const merged = mergeOverrideLayer(definition, { tokens: { accent }, graph: null });

    expect(merged).not.toBe(definition.tokens);
    expect(merged.accent).toBe(accent);
    expect(merged.background).toBe(definition.tokens.background);
    expect(Object.isFrozen(merged)).toBe(true);
  });

  it("replaces the lane list instead of merging it", () => {
    const definition = entry();
    const graph = lanes(2);
    const merged = mergeOverrideLayer(definition, { tokens: {}, graph });

    expect(merged.graph).toEqual(graph);
    expect(merged.graph).not.toEqual(definition.tokens.graph);
    expect(Object.isFrozen(merged.graph)).toBe(true);
  });
});
