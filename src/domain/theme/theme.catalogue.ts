import type { ThemeCatalogue, ThemeCatalogueEntry } from "./theme.catalogue.types";
import { THEME_NAMES, THEMES } from "./theme.registry";

/** Warnings of the built-in catalogue; the static registry is covered by tests, so it has none. */
const NO_WARNINGS: readonly string[] = Object.freeze([]);

/** Every built-in definition as a catalogue entry, in registry order. */
const BUILT_IN_ENTRIES: readonly ThemeCatalogueEntry[] = Object.freeze(
  THEME_NAMES.map((name) => Object.freeze({ ...THEMES[name], source: "built-in" as const })),
);

/**
 * The built-in catalogue, built once so its identity stays stable.
 *
 * A stable catalogue means a memoized resolution keeps the same definition and token object
 * references, which is what `useThemeSyntaxStyle` relies on to avoid rebuilding the native syntax
 * style on every render.
 */
const BUILT_IN_CATALOGUE: ThemeCatalogue = Object.freeze({
  entries: BUILT_IN_ENTRIES,
  warnings: NO_WARNINGS,
});

/**
 * Builds the catalogue of every built-in theme.
 *
 * The entries keep the registry's picker order and reuse each definition's frozen token table by
 * reference. The same frozen catalogue is returned on every call, so callers can memoize on its
 * identity. A user theme catalogue appends validated user entries after these built-ins and carries
 * the load warnings, which is why the catalogue, not the registry, is what the resolver reads.
 *
 * @returns The frozen built-in catalogue.
 */
export function createBuiltInCatalogue(): ThemeCatalogue {
  return BUILT_IN_CATALOGUE;
}

/**
 * Looks up one catalogue entry by identity.
 *
 * @param catalogue - Catalogue to search, built-in or widened with user themes.
 * @param name - Requested theme name.
 * @returns The matching entry, or `undefined` when the catalogue does not define the name.
 */
export function getCatalogueEntry(
  catalogue: ThemeCatalogue,
  name: string,
): ThemeCatalogueEntry | undefined {
  return catalogue.entries.find((entry) => entry.name === name);
}
