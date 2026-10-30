import type { ThemeTokens, ThemeVariant } from "./theme.types";

/** Where one catalogue entry came from. */
export type ThemeDefinitionSource = "built-in" | "user";

/**
 * One theme the resolver can select by name.
 *
 * The entry is how the theme layer widens past `ThemeName`, which stays the built-in union. A user
 * theme is a catalogue entry as well, so resolution, the picker, and `theme.json` layering never
 * branch on the source: a catalogue entry always carries a complete token table, and a theme that
 * could not be completed never becomes one.
 */
export interface ThemeCatalogueEntry {
  /** Theme identity written to `config.json` `theme` and used as the definition name. */
  readonly name: string;
  /** Display name used by the picker, help, and status messages. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Final token colors; every token is present in a catalogue entry. */
  readonly tokens: ThemeTokens;
  /** Where the entry came from. */
  readonly source: ThemeDefinitionSource;
}

/** Every theme the resolver can select, in identity order. */
export interface ThemeCatalogue {
  /** Built-ins in registry order, then user themes in load order. Entry names are the identities. */
  readonly entries: readonly ThemeCatalogueEntry[];
  /** Warnings produced while building the catalogue, for example rejected theme files. */
  readonly warnings: readonly string[];
}
