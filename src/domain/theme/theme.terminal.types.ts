import type { ThemeCatalogueEntry } from "./theme.catalogue.types";
import type { HexColor } from "./theme.types";

/**
 * The sixteen ANSI palette colors as a fixed tuple.
 *
 * A fixed tuple means `readTerminalTheme` can destructure any index it needs without a second
 * length or hole check, and the reader can build it only after validating all sixteen entries.
 */
export type AnsiPalette = readonly [
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
];

/** Outcome of blending one diff line background. */
export interface DiffBackground {
  /** Final blended color. */
  readonly color: HexColor;
  /** True when the blend cleared the text contrast floor. */
  readonly reachedFloor: boolean;
}

/**
 * One palette response from the terminal.
 *
 * The shape mirrors what `renderer.getPalette()` returns, kept as plain values so the mapper stays
 * free of the renderer, the filesystem, and React. An entry is `null` when the terminal did not
 * answer that part of the query.
 */
export interface DetectedTerminalPalette {
  /** ANSI palette entries, ideally sixteen, in index order. */
  readonly palette: readonly (string | null)[];
  /** Default foreground reported by OSC 10, or `null` when the terminal did not answer. */
  readonly defaultForeground: string | null;
  /** Default background reported by OSC 11, or `null` when the terminal did not answer. */
  readonly defaultBackground: string | null;
}

/**
 * Outcome of mapping a detected palette onto a theme.
 *
 * Exactly one of `entry` and `reason` is set. A gated-out palette keeps the app on a defined theme
 * and states why in one line instead of guessing at the missing half.
 */
export interface TerminalThemeResult {
  /** Complete catalogue entry for the detected scheme, or `null` when it was gated out. */
  readonly entry: ThemeCatalogueEntry | null;
  /** One-line reason the entry is unavailable, or `null` when it was built. */
  readonly reason: string | null;
  /**
   * Non-blocking notes about adjustments made to keep the scheme readable.
   *
   * `ThemeProvider` publishes these through the resolved theme warnings while Native Terminal is the
   * rendered theme, so a scheme whose floors cannot be met still reports why instead of only rendering
   * the best blend it could reach.
   */
  readonly warnings: readonly string[];
}

/** Theme name and warnings the provider publishes for a requested terminal theme. */
export interface TerminalResolution {
  /** Name the provider resolves through its catalogue. */
  readonly name: string;
  /** Warnings to publish, always empty unless Native Terminal was requested and failed. */
  readonly warnings: readonly string[];
}
