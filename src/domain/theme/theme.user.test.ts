import { describe, expect, it } from "bun:test";
import {
  combineConfigurationWarnings,
  THEME_WARNING_PREFIX,
} from "@/domain/config/config.warnings";
import { applyThemeCapability } from "@/domain/theme/theme.capability";
import { nearestPaletteColor } from "@/domain/theme/theme.capability.palette";
import { createBuiltInCatalogue } from "@/domain/theme/theme.catalogue";
import type { ThemeCatalogue, ThemeCatalogueEntry } from "@/domain/theme/theme.catalogue.types";
import { THEMES } from "@/domain/theme/theme.registry";
import { resolveTheme } from "@/domain/theme/theme.resolve";
import type { ThemeToken } from "@/domain/theme/theme.tokens";
import { THEME_TOKEN_NAMES } from "@/domain/theme/theme.tokens";
import type { HexColor, ResolvedTheme } from "@/domain/theme/theme.types";
import { readExportName, readUserTheme } from "@/domain/theme/theme.user";
import type { UserThemeDefinition } from "@/domain/theme/theme.user.types";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

/** Built-in theme used as the base of the sample themes. */
const BASE_NAME = "flexoki-ink";

/** Theme name used by most cases. */
const THEME_NAME = "hadi-ink";

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
 * Reads the base tokens of the sample theme.
 *
 * @returns The base token table.
 */
function baseTokens() {
  return THEMES[BASE_NAME].tokens;
}

/**
 * Builds a complete color map from the base theme, with optional overrides.
 *
 * @param overrides - Entries layered over the base colors.
 * @returns A complete `colors` object.
 */
function completeColors(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const { graph, ...scalars } = baseTokens();

  return { ...scalars, graph: [...graph], ...overrides };
}

/**
 * Reads a definition that the case expects to be accepted.
 *
 * @param raw - Raw theme file value.
 * @returns The accepted definition.
 */
function accepted(raw: unknown): UserThemeDefinition {
  const { definition } = readUserTheme(raw);

  if (definition === null) {
    throw new Error("Expected the theme file to be accepted.");
  }

  return definition;
}

/**
 * Wraps a definition as a truecolor resolved theme for capability mapping.
 *
 * @param definition - Accepted user definition.
 * @returns The resolved theme.
 */
function toResolved(definition: UserThemeDefinition): ResolvedTheme {
  return {
    name: definition.name,
    label: definition.label,
    variant: definition.variant,
    tokens: definition.tokens,
    capability: "truecolor",
    warnings: [],
  };
}

/**
 * Maps an accepted user definition onto a catalogue entry.
 *
 * @param definition - Accepted user definition.
 * @returns The user catalogue entry.
 */
function toCatalogueEntry(definition: UserThemeDefinition): ThemeCatalogueEntry {
  return {
    name: definition.name,
    label: definition.label,
    variant: definition.variant,
    tokens: definition.tokens,
    source: "user",
  };
}

/**
 * Builds a catalogue with the built-ins plus one user entry.
 *
 * @param entry - User entry to append.
 * @param warnings - Catalogue warnings to carry.
 * @returns The widened catalogue.
 */
function withUserEntry(
  entry: ThemeCatalogueEntry,
  warnings: readonly string[] = [],
): ThemeCatalogue {
  const builtIn = createBuiltInCatalogue();

  return {
    entries: [...builtIn.entries, entry],
    warnings,
  };
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

describe("readUserTheme standalone themes", () => {
  it("reads a complete standalone theme with every token and no warnings", () => {
    const { definition, warnings } = readUserTheme({
      version: 1,
      name: THEME_NAME,
      label: "Hadi Ink",
      variant: "dark",
      colors: completeColors(),
    });

    if (definition === null) {
      throw new Error("Expected the theme file to be accepted.");
    }

    const scalarTokens = THEME_TOKEN_NAMES.filter(
      (token): token is Exclude<ThemeToken, "graph"> => token !== "graph",
    );

    expect(definition.name).toBe(THEME_NAME);
    expect(definition.label).toBe("Hadi Ink");
    expect(definition.extends).toBeNull();
    expect(definition.variant).toBe("dark");
    expect(scalarTokens).toHaveLength(24);

    for (const token of scalarTokens) {
      expect(definition.tokens[token]).toMatch(/^#[0-9a-f]{6}$/);
    }

    expect(definition.tokens.graph).toEqual(baseTokens().graph);
    expect(Object.isFrozen(definition.tokens)).toBe(true);
    expect(warnings).toEqual([]);
  });

  it("defaults the label to the theme name when it is absent or blank", () => {
    for (const label of [undefined, "", "   "]) {
      const definition = accepted({ name: THEME_NAME, label, colors: completeColors() });

      expect(definition.label).toBe(THEME_NAME);
    }
  });

  it("warns and falls back to the theme name when the label is not a string", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      label: 5,
      colors: completeColors(),
    });

    expect(definition?.label).toBe(THEME_NAME);
    expect(warnings).toEqual([
      `Invalid "label" in theme "${THEME_NAME}"; the theme name was used instead.`,
    ]);
  });

  it("rejects a partial theme with one warning naming every missing token", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      colors: { accent: color("7fb3d5"), background: color("101216"), text: color("dcd7ba") },
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `Theme "${THEME_NAME}" needs 22 more entries: border, branchLocal, branchRemote, diffAdd, diffAddBackground, diffContext, diffHunk, diffRemove, diffRemoveBackground, dim, error, focus, graph, info, muted, panel, scrollbar, selection, success, surface, tag, warning.`,
    ]);
  });

  it("rejects an incomplete theme that has no color map", () => {
    const { definition, warnings } = readUserTheme({ name: THEME_NAME });
    const message = `Theme "${THEME_NAME}" has no colors object; the file was ignored.`;

    expect(definition).toBeNull();
    expect(warnings).toEqual([message]);
  });

  it("derives the variant from the resolved background", () => {
    const light = accepted({
      name: THEME_NAME,
      colors: completeColors({ background: color("ffffff"), text: color("000000") }),
    });
    const dark = accepted({ name: THEME_NAME, colors: completeColors() });

    expect(light.variant).toBe("light");
    expect(dark.variant).toBe("dark");
  });

  it("lets an explicit variant win over the derived one", () => {
    const definition = accepted({
      name: THEME_NAME,
      variant: "dark",
      colors: completeColors({ background: color("ffffff"), text: color("000000") }),
    });

    expect(definition.variant).toBe("dark");
  });

  it("warns and derives the variant when an explicit variant is invalid", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      variant: "Dark",
      colors: completeColors({ background: color("ffffff"), text: color("000000") }),
    });

    expect(definition?.variant).toBe("light");
    expect(warnings).toEqual([
      `Invalid "variant" in theme "${THEME_NAME}"; it was derived from the background.`,
    ]);
  });

  it("reports low contrast without rejecting the theme", () => {
    const { definition, warnings } = readUserTheme({
      name: "low-contrast",
      colors: completeColors({ background: color("000000"), text: color("111111") }),
    });

    expect(definition).not.toBeNull();
    expect(warnings).toEqual([
      'Theme "low-contrast" text-on-background contrast is 1.11, below the 4.5 AA floor.',
    ]);
  });
});

describe("readUserTheme extends inheritance", () => {
  it("inherits every missing token from a built-in base", () => {
    const definition = accepted({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { accent: color("7fb3d5") },
    });

    expect(definition.extends).toBe(BASE_NAME);
    expect(definition.tokens.accent).toBe(color("7fb3d5"));
    expect(definition.tokens.background).toBe(baseTokens().background);
    expect(definition.tokens.graph).toBe(baseTokens().graph);
  });

  it("renders an inheriting partial theme in truecolor, 256-color, and monochrome", () => {
    const accent = color("7fb3d5");
    const definition = accepted({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { accent, graph: lanes(2) },
    });
    const resolved = toResolved(definition);

    const truecolor = applyThemeCapability(resolved, "truecolor");
    expect(truecolor.tokens).toBe(resolved.tokens);
    expect(truecolor.tokens.accent).toBe(accent);
    expect(truecolor.tokens.background).toBe(baseTokens().background);
    expect(truecolor.tokens.graph).toHaveLength(2);

    const palette = applyThemeCapability(resolved, "color-256");
    expect(palette.capability).toBe("color-256");
    expect(palette.tokens.accent).toBe(nearestPaletteColor(accent));
    expect(palette.tokens.background).toBe(nearestPaletteColor(baseTokens().background));
    expect(palette.tokens.graph).toHaveLength(2);

    const mono = applyThemeCapability(resolved, "monochrome");
    expect(mono.capability).toBe("monochrome");
    expect(mono.tokens.accent).toBe(mono.tokens.text);
    expect(mono.tokens.graph).toHaveLength(2);
    expect(mono.tokens.background).not.toBe(truecolor.tokens.background);
  });

  it("treats a null extends target as a standalone theme", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: null,
      colors: completeColors(),
    });

    expect(definition?.extends).toBeNull();
    expect(warnings).toEqual([]);
  });

  it("rejects an unknown extends target", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: "not-a-theme",
      colors: { accent: color("7fb3d5") },
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `Unknown "extends" target "not-a-theme" in theme "${THEME_NAME}"; the file was ignored.`,
    ]);
  });

  it("rejects an extends value that is not a theme name", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: 7,
      colors: { accent: color("7fb3d5") },
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `Invalid "extends" in theme "${THEME_NAME}"; it must name a built-in theme. The file was ignored.`,
    ]);
  });

  it("replaces the base lanes with a valid graph list", () => {
    const graph = lanes(3);
    const definition = accepted({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { graph },
    });

    expect(definition.tokens.graph).toEqual(graph);
    expect(definition.tokens.graph).not.toEqual(baseTokens().graph);
  });

  it("keeps the base lanes for an empty graph list", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { graph: [] },
    });

    expect(definition?.tokens.graph).toBe(baseTokens().graph);
    expect(warnings).toEqual([
      `The "graph" color list in theme "${THEME_NAME}" has no valid colors; the base lanes were kept.`,
    ]);
  });

  it("caps the accepted lane list at sixteen colors", () => {
    const graph = lanes(18);
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { graph },
    });

    expect(definition?.tokens.graph).toEqual(graph.slice(0, 16));
    expect(warnings).toEqual([
      `The "graph" color list in theme "${THEME_NAME}" keeps at most 16 colors; the rest were ignored.`,
    ]);
  });
});

describe("readUserTheme dropped entries", () => {
  it("keeps the base color for an invalid color and an unknown token", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      extends: BASE_NAME,
      colors: { accent: "not-a-color", sparkle: color("abcdef") },
    });

    expect(definition?.tokens.accent).toBe(baseTokens().accent);
    expect(warnings).toEqual([
      `Invalid color for "accent" in theme "${THEME_NAME}"; the base color was kept.`,
      `Unknown token "sparkle" in theme "${THEME_NAME}"; the base color was kept.`,
    ]);
  });

  it("counts a dropped entry as missing in standalone mode", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      colors: completeColors({ accent: "not-a-color", sparkle: color("abcdef") }),
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `Invalid color for "accent" in theme "${THEME_NAME}"; the color was ignored.`,
      `Unknown token "sparkle" in theme "${THEME_NAME}"; the color was ignored.`,
      `Theme "${THEME_NAME}" needs 1 more color: accent.`,
    ]);
  });

  it("rejects a graph field that is not an array and states the theme is incomplete", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      colors: completeColors({ graph: 3 }),
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `The "graph" color list in theme "${THEME_NAME}" must be an array; the theme is incomplete without it.`,
    ]);
  });

  it("counts a graph field that is absent as a missing entry", () => {
    const scalars = Object.fromEntries(
      Object.entries(completeColors()).filter(([key]) => key !== "graph"),
    );
    const { definition, warnings } = readUserTheme({ name: THEME_NAME, colors: scalars });

    expect(definition).toBeNull();
    expect(warnings).toEqual([`Theme "${THEME_NAME}" needs 1 more entry: graph.`]);
  });

  it("rejects an empty graph list without repeating the graph defect", () => {
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      colors: completeColors({ graph: [] }),
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `The "graph" color list in theme "${THEME_NAME}" has no valid colors; the theme is incomplete without it.`,
    ]);
  });

  it("keeps the missing scalars in the completeness warning when the graph already warned", () => {
    const colors = Object.fromEntries(
      Object.entries(completeColors({ graph: [] })).filter(
        ([key]) => key !== "accent" && key !== "panel",
      ),
    );
    const { definition, warnings } = readUserTheme({ name: THEME_NAME, colors });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `The "graph" color list in theme "${THEME_NAME}" has no valid colors; the theme is incomplete without it.`,
      `Theme "${THEME_NAME}" needs 2 more colors: accent, panel.`,
    ]);
  });
});

describe("readUserTheme identity", () => {
  it("rejects a version other than one", () => {
    const { definition, warnings } = readUserTheme({
      version: 2,
      name: THEME_NAME,
      colors: completeColors(),
    });

    expect(definition).toBeNull();
    expect(warnings).toEqual([
      `Unsupported version in theme "${THEME_NAME}"; the file was ignored.`,
    ]);
  });

  it("rejects a name that shadows a built-in theme", () => {
    const { definition, warnings } = readUserTheme({ name: "nord", colors: completeColors() });

    expect(definition).toBeNull();
    expect(warnings).toEqual(['Theme "nord" is already defined; the file was ignored.']);
  });

  it("rejects a built-in name even when the caller catalogue omits built-ins", () => {
    const userEntry: ThemeCatalogueEntry = {
      name: "user-one",
      label: "User One",
      variant: "dark",
      tokens: THEMES[BASE_NAME].tokens,
      source: "user",
    };
    const catalogue: ThemeCatalogue = { entries: [userEntry], warnings: [] };
    const { definition, warnings } = readUserTheme(
      { name: "nord", colors: completeColors() },
      { catalogue },
    );

    expect(definition).toBeNull();
    expect(warnings).toEqual(['Theme "nord" is already defined; the file was ignored.']);
  });

  it("keeps the first user theme and rejects a later file with the same name", () => {
    const raw = { name: THEME_NAME, colors: completeColors() };
    const first = readUserTheme(raw);

    expect(first.definition?.name).toBe(THEME_NAME);
    expect(first.warnings).toEqual([]);

    if (first.definition === null) {
      throw new Error("Expected the first theme file to be accepted.");
    }

    const second = readUserTheme(raw, {
      catalogue: withUserEntry(toCatalogueEntry(first.definition)),
    });

    expect(second.definition).toBeNull();
    expect(second.warnings).toEqual([
      `Theme "${THEME_NAME}" is already defined; the file was ignored.`,
    ]);
  });

  it("accepts a 64-character name", () => {
    const name = "a".repeat(64);
    const { definition, warnings } = readUserTheme({ name, colors: completeColors() });

    expect(definition?.name).toBe(name);
    expect(warnings).toEqual([]);
  });

  it("rejects a missing or invalid name", () => {
    const colors = completeColors();
    const longName = "a".repeat(65);

    expect(readUserTheme({ colors }).warnings).toEqual([
      "A theme file has no valid name; the file was ignored.",
    ]);
    expect(readUserTheme({ name: "Hadi Ink", colors }).warnings).toEqual([
      'Theme name "Hadi Ink" is invalid; the file was ignored.',
    ]);
    expect(readUserTheme({ name: longName, colors }).warnings).toEqual([
      `Theme name "${longName}" is invalid; the file was ignored.`,
    ]);
  });

  it("rejects a value that is not a JSON object", () => {
    expect(readUserTheme(["theme"]).warnings).toEqual([
      "A theme file is not a JSON object; the file was ignored.",
    ]);
  });
});

describe("readUserTheme catalogue resolution", () => {
  it("resolves an accepted theme file through a user catalogue entry", () => {
    const accent = color("7fb3d5");
    const { definition, warnings } = readUserTheme({
      version: 1,
      name: THEME_NAME,
      label: "Hadi Ink",
      variant: "dark",
      extends: BASE_NAME,
      colors: { accent },
    });

    expect(warnings).toEqual([]);

    if (definition === null) {
      throw new Error("Expected the theme file to be accepted.");
    }

    const entry = toCatalogueEntry(definition);
    const theme = resolveTheme(THEME_NAME, { catalogue: withUserEntry(entry) });

    expect(entry.source).toBe("user");
    expect(theme.name).toBe(THEME_NAME);
    expect(theme.label).toBe("Hadi Ink");
    expect(theme.variant).toBe("dark");
    expect(theme.tokens).toBe(definition.tokens);
    expect(theme.tokens.accent).toBe(accent);
    expect(theme.tokens.background).toBe(baseTokens().background);
    expect(theme.warnings).toEqual([]);
  });

  it("resolves a standalone theme file through a user catalogue entry", () => {
    const accent = color("7fb3d5");
    const { definition, warnings } = readUserTheme({
      name: THEME_NAME,
      label: "Hadi Ink",
      colors: completeColors({ accent }),
    });

    expect(warnings).toEqual([]);

    if (definition === null) {
      throw new Error("Expected the theme file to be accepted.");
    }

    const entry = toCatalogueEntry(definition);
    const theme = resolveTheme(THEME_NAME, { catalogue: withUserEntry(entry) });

    expect(definition.extends).toBeNull();
    expect(entry.name).toBe(THEME_NAME);
    expect(entry.source).toBe("user");
    expect(theme.name).toBe(THEME_NAME);
    expect(theme.label).toBe("Hadi Ink");
    expect(theme.variant).toBe("dark");
    expect(theme.tokens).toBe(definition.tokens);
    expect(theme.tokens.accent).toBe(accent);
    expect(theme.tokens.graph).toEqual(baseTokens().graph);
    expect(theme.warnings).toEqual([]);
  });
});

describe("readExportName", () => {
  it("keeps a free identity and derives one that cannot shadow", () => {
    expect(readExportName("hadi-ink")).toBe("hadi-ink");
    expect(readExportName("nord")).toBe("nord-custom");
    expect(readExportName("terminal")).toBe("native-terminal");
  });
});

describe("readUserTheme warning pipeline", () => {
  it("prefixes theme warnings and keeps configuration warnings first", () => {
    const { warnings } = readUserTheme({ name: THEME_NAME });
    const combined = combineConfigurationWarnings(["config warning"], warnings);

    expect(combined).toEqual(["config warning", `${THEME_WARNING_PREFIX}${warnings[0]}`]);
  });
});
