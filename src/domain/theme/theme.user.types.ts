import type { ThemeCatalogue } from "./theme.catalogue.types";
import type { ThemeName, ThemeTokens, ThemeVariant } from "./theme.types";

/** Inputs accepted by `readUserTheme`. */
export interface ReadUserThemeOptions {
  /**
   * Catalogue whose existing entries the new theme may not shadow.
   *
   * The catalogue supplies the user themes loaded before this file. Built-in names are always
   * rejected directly against the registry, even when the supplied catalogue omits them, so a
   * caller cannot replace the collision rule with a narrower name list. An absent catalogue keeps
   * the rule limited to the built-in names.
   */
  readonly catalogue?: ThemeCatalogue;
}

/** One validated user theme definition, ready to become a catalogue entry. */
export interface UserThemeDefinition {
  /** Theme identity, matching `/^[a-z0-9][a-z0-9-]*$/` and at most 64 characters. */
  readonly name: string;
  /**
   * Display name; the theme name when the file omits, blanks, or gives a non-string `label`, which
   * also warns before falling back.
   */
  readonly label: string;
  /** Explicit variant, or the variant derived from the resolved background. */
  readonly variant: ThemeVariant;
  /** Built-in theme this definition extends, or `null` when the file is standalone. */
  readonly extends: ThemeName | null;
  /** Complete token table after inheritance and completeness validation. */
  readonly tokens: ThemeTokens;
}

/** Outcome of reading one theme file value. */
export interface UserThemeReadResult {
  /** The validated definition, or `null` when the file was rejected. */
  readonly definition: UserThemeDefinition | null;
  /** Non-blocking warnings produced while reading; a rejected file warns at least once. */
  readonly warnings: readonly string[];
}
