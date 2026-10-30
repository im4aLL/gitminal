import type { SyntaxStyle } from "@opentui/core";
import type { ThemeCatalogue } from "@/domain/theme/theme.catalogue.types";
import type { ResolvedTheme } from "@/domain/theme/theme.types";

/**
 * Session-only theme controls.
 *
 * The picker swaps the resolved tokens while it highlights a row, then either commits the previewed
 * theme or restores the one that was active when it opened. None of these controls read or write a
 * file; persistence stays with the config writer.
 */
export interface ThemeControls {
  /**
   * Previews a theme for the rest of the session without persisting it.
   *
   * @param name - Catalogue theme name to resolve and render.
   */
  readonly preview: (name: string) => void;
  /**
   * Makes a theme the active base name after it was persisted.
   *
   * @param name - Theme name that was written to configuration.
   */
  readonly commit: (name: string) => void;
  /**
   * Restores a previously active theme.
   *
   * @param previous - Theme name that was active before the preview started.
   */
  readonly restore: (previous: string) => void;
}

/** Value carried by `ThemeContext`. */
export interface ThemeContextValue {
  /** The resolved theme for the current capability, including override warnings. */
  readonly theme: ResolvedTheme;
  /** Session-only preview, commit, and restore controls. */
  readonly controls: ThemeControls;
  /** Renderer-bound syntax style built from the active tokens and rebuilt on every theme change. */
  readonly syntaxStyle: SyntaxStyle;
  /** Catalogue the active name resolves against, including any loaded user themes. */
  readonly catalogue: ThemeCatalogue;
}
