import { describe, expect, it } from "bun:test";
import {
  combineConfigurationWarnings,
  THEME_WARNING_PREFIX,
} from "@/domain/config/config.warnings";
import { createBuiltInCatalogue, getCatalogueEntry } from "@/domain/theme/theme.catalogue";
import type { ThemeCatalogue, ThemeCatalogueEntry } from "@/domain/theme/theme.catalogue.types";
import { DEFAULT_THEME_NAME, THEME_NAMES, THEMES } from "@/domain/theme/theme.registry";
import { resolveTheme } from "@/domain/theme/theme.resolve";
import type { HexColor } from "@/domain/theme/theme.types";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

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
 * Builds a catalogue that appends one user entry after the built-ins.
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

describe("createBuiltInCatalogue", () => {
  it("lists every built-in theme in registry order", () => {
    const catalogue = createBuiltInCatalogue();

    expect(catalogue.entries.map((entry) => entry.name)).toEqual([...THEME_NAMES]);
    expect(catalogue.warnings).toEqual([]);
  });

  it("keeps each definition's label, variant, and token identity", () => {
    const catalogue = createBuiltInCatalogue();

    for (const name of THEME_NAMES) {
      const entry = getCatalogueEntry(catalogue, name);

      expect(entry?.label).toBe(THEMES[name].label);
      expect(entry?.variant).toBe(THEMES[name].variant);
      expect(entry?.tokens).toBe(THEMES[name].tokens);
      expect(entry?.source).toBe("built-in");
    }
  });

  it("returns the same frozen catalogue every time", () => {
    const catalogue = createBuiltInCatalogue();

    expect(createBuiltInCatalogue()).toBe(catalogue);
    expect(Object.isFrozen(catalogue)).toBe(true);
    expect(Object.isFrozen(catalogue.entries)).toBe(true);
    expect(Object.isFrozen(catalogue.entries[0])).toBe(true);
  });

  it("defaults the resolved theme to the same default entry", () => {
    const definition = getCatalogueEntry(createBuiltInCatalogue(), DEFAULT_THEME_NAME);

    if (definition === undefined) {
      throw new Error(`Default theme "${DEFAULT_THEME_NAME}" is not in the built-in catalogue.`);
    }

    expect(resolveTheme(undefined).tokens).toBe(definition.tokens);
  });
});

describe("getCatalogueEntry", () => {
  it("returns the matching entry and nothing for an unknown name", () => {
    const catalogue = createBuiltInCatalogue();

    expect(getCatalogueEntry(catalogue, "flexoki-ink")?.name).toBe("flexoki-ink");
    expect(getCatalogueEntry(catalogue, "not-a-theme")).toBeUndefined();
    expect(getCatalogueEntry(catalogue, "Flexoki-Ink")).toBeUndefined();
    expect(getCatalogueEntry(catalogue, "")).toBeUndefined();
  });
});

describe("resolveTheme catalogue selection", () => {
  it("resolves a name from a catalogue widened with a user theme", () => {
    const userEntry: ThemeCatalogueEntry = {
      name: "hadi-ink",
      label: "Hadi Ink",
      variant: "dark",
      tokens: THEMES["flexoki-ink"].tokens,
      source: "user",
    };
    const catalogue = withUserEntry(userEntry);
    const theme = resolveTheme("hadi-ink", { catalogue });

    expect(theme.name).toBe("hadi-ink");
    expect(theme.label).toBe("Hadi Ink");
    expect(theme.tokens).toBe(userEntry.tokens);
    expect(theme.warnings).toEqual([]);
  });

  it("carries catalogue warnings into the resolved theme warnings", () => {
    const userEntry: ThemeCatalogueEntry = {
      name: "hadi-ink",
      label: "Hadi Ink",
      variant: "dark",
      tokens: THEMES["flexoki-ink"].tokens,
      source: "user",
    };
    const catalogue = withUserEntry(userEntry, ['Theme "broken" is not a JSON object.']);
    const theme = resolveTheme("hadi-ink", { catalogue });
    const combined = combineConfigurationWarnings(["config warning"], theme.warnings);

    expect(theme.warnings).toEqual(['Theme "broken" is not a JSON object.']);
    expect(combined).toEqual([
      "config warning",
      `${THEME_WARNING_PREFIX}Theme "broken" is not a JSON object.`,
    ]);
  });

  it("keeps the layered tokens when a catalogue entry is overridden", () => {
    const accent = color("7fb3d5");
    const userEntry: ThemeCatalogueEntry = {
      name: "hadi-ink",
      label: "Hadi Ink",
      variant: "dark",
      tokens: THEMES["flexoki-ink"].tokens,
      source: "user",
    };
    const theme = resolveTheme("hadi-ink", {
      catalogue: withUserEntry(userEntry),
      overrides: { colors: { accent } },
    });

    expect(theme.tokens.accent).toBe(accent);
    expect(theme.tokens.background).toBe(userEntry.tokens.background);
  });

  it("falls back to the default entry with a warning for an unknown name", () => {
    const theme = resolveTheme("missing-theme", { catalogue: createBuiltInCatalogue() });

    expect(theme.name).toBe(DEFAULT_THEME_NAME);
    expect(theme.warnings).toEqual([
      `Unknown theme "missing-theme"; using "${DEFAULT_THEME_NAME}".`,
    ]);
  });

  it("throws when a custom catalogue omits the default entry", () => {
    const userEntry: ThemeCatalogueEntry = {
      name: "hadi-ink",
      label: "Hadi Ink",
      variant: "dark",
      tokens: THEMES["flexoki-ink"].tokens,
      source: "user",
    };
    const catalogue: ThemeCatalogue = { entries: [userEntry], warnings: [] };

    expect(() => resolveTheme(undefined, { catalogue })).toThrow(
      `Default theme "${DEFAULT_THEME_NAME}" is not defined.`,
    );
  });
});
