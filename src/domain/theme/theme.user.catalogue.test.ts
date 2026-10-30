import { describe, expect, it } from "bun:test";
import { getCatalogueEntry } from "@/domain/theme/theme.catalogue";
import type { ThemeFileSource } from "@/domain/theme/theme.catalogue.types";
import { THEMES } from "@/domain/theme/theme.registry";
import {
  MAX_THEME_FILE_WARNINGS,
  readUserThemeCatalogue,
} from "@/domain/theme/theme.user.catalogue";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

/**
 * Builds a `#RRGGBB` value from six digits.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
function color(digits: string): string {
  return `${HEX_PREFIX}${digits}`;
}

/** Base tokens used as a complete standalone color map. */
const BASE_TOKENS = THEMES["flexoki-ink"].tokens;

/**
 * Builds a complete standalone theme file value.
 *
 * @param name - Theme identity.
 * @param accent - Optional accent override.
 * @returns The parsed file value.
 */
function themeFile(name: string, accent?: string): Record<string, unknown> {
  const { graph, ...scalars } = BASE_TOKENS;

  return {
    version: 1,
    name,
    label: `Label ${name}`,
    colors: { ...scalars, graph: [...graph], ...(accent === undefined ? {} : { accent }) },
  };
}

/**
 * Builds one loaded theme file entry.
 *
 * @param fileName - File name the loader reported.
 * @param value - Parsed value.
 * @returns The catalogue input.
 */
function file(fileName: string, value: unknown): ThemeFileSource {
  return { fileName, value, reason: null };
}

describe("readUserThemeCatalogue", () => {
  it("returns the shared built-in catalogue when no files were loaded", () => {
    const catalogue = readUserThemeCatalogue([]);

    expect(catalogue.entries.every((entry) => entry.source === "built-in")).toBe(true);
    expect(catalogue.warnings).toEqual([]);
    expect(readUserThemeCatalogue([])).toBe(catalogue);
  });

  it("appends accepted user themes after the built-ins in file order", () => {
    const catalogue = readUserThemeCatalogue([
      file("a.json", themeFile("aaa-theme")),
      file("b.json", themeFile("bbb-theme")),
    ]);
    const names = catalogue.entries.map((entry) => entry.name);

    expect(names.slice(-2)).toEqual(["aaa-theme", "bbb-theme"]);
    expect(getCatalogueEntry(catalogue, "aaa-theme")?.source).toBe("user");
    expect(getCatalogueEntry(catalogue, "aaa-theme")?.label).toBe("Label aaa-theme");
    expect(catalogue.warnings).toEqual([]);
  });

  it("keeps the first registration and warns once for a shadowing file", () => {
    const catalogue = readUserThemeCatalogue([
      file("a.json", themeFile("same-name")),
      file("b.json", themeFile("same-name", color("7fb3d5"))),
    ]);

    expect(catalogue.entries.filter((entry) => entry.name === "same-name")).toHaveLength(1);
    expect(catalogue.warnings).toHaveLength(1);
    expect(catalogue.warnings[0]).toContain('b.json: Theme "same-name" is already defined');
  });

  it("keeps the loader reason as the file warning", () => {
    const catalogue = readUserThemeCatalogue([
      { fileName: "broken.json", value: null, reason: 'Could not parse theme file "broken.json"' },
    ]);

    expect(catalogue.entries.every((entry) => entry.source === "built-in")).toBe(true);
    expect(catalogue.warnings).toEqual(['Could not parse theme file "broken.json"']);
  });

  it("bounds the file warnings and counts the omitted themes", () => {
    const files = Array.from({ length: MAX_THEME_FILE_WARNINGS + 3 }, (_, index) =>
      file(`broken-${index}.json`, null),
    );
    const catalogue = readUserThemeCatalogue(files);

    expect(catalogue.warnings).toHaveLength(MAX_THEME_FILE_WARNINGS + 1);
    expect(catalogue.warnings.at(-1)).toBe("+3 more themes could not be loaded.");
  });

  it("keeps scan warnings ahead of the file warnings", () => {
    const catalogue = readUserThemeCatalogue(
      [file("a.json", null)],
      ["Could not read the themes directory (/cfg/themes)"],
    );

    expect(catalogue.warnings[0]).toContain("Could not read the themes directory");
    expect(catalogue.warnings).toHaveLength(2);
  });

  it("resolves a loaded user theme through the catalogue", () => {
    const catalogue = readUserThemeCatalogue([file("ink.json", themeFile("my-ink"))]);
    const entry = getCatalogueEntry(catalogue, "my-ink");

    expect(entry?.tokens.background).toBe(BASE_TOKENS.background);
    expect(Object.isFrozen(catalogue.entries)).toBe(true);
    expect(Object.isFrozen(catalogue.warnings)).toBe(true);
  });
});
