import type { ThemeCatalogue } from "./theme.catalogue.types";

/** Options accepted by the theme resolver. */
export interface ResolveThemeOptions {
  /** Raw parsed `theme.json` from the config loader, or `null` when absent. */
  readonly overrides?: unknown;
  /**
   * Catalogue to resolve against.
   *
   * Defaults to the built-in catalogue, so an existing one-argument call keeps resolving a built-in
   * theme. A caller that loaded user theme files passes a widened catalogue; its warnings are part
   * of the resolved theme's warnings.
   */
  readonly catalogue?: ThemeCatalogue;
}
