import type { ThemeToken } from "./theme.tokens";
import type { HexColor } from "./theme.types";

/** A validated color map with the graph lanes kept separate from the per-token colors. */
export interface ThemeColorMap {
  /** Accepted per-token colors, keyed by known token name. */
  readonly tokens: Partial<Record<Exclude<ThemeToken, "graph">, HexColor>>;
  /** Accepted graph lane colors, or `null` when the map keeps the base lanes. */
  readonly graph: readonly HexColor[] | null;
}

/**
 * Validated `theme.json` override layer ready to merge over a catalogue entry.
 *
 * This is the shared color-map shape, so the validator's output type is the single representation
 * of both a parsed `theme.json` layer and a user theme's accepted colors.
 */
export type ThemeOverrideLayer = ThemeColorMap;

/**
 * Warning suffix wording for one dropped color-map entry.
 *
 * Both variants share this shape and differ only in their sentences: a source with a base keeps it,
 * while a standalone theme has nothing to fall back to. Typing the selected map as this interface
 * keeps `readDroppedWords` free of a cast over two differently worded literals.
 */
export interface DroppedEntryWords {
  /** Suffix appended when a per-token color is dropped. */
  readonly color: string;
  /** Suffix appended when a single graph lane color is dropped. */
  readonly lane: string;
  /**
   * Suffix appended when a graph lane list is dropped or empty.
   *
   * A source with a base keeps that base's lanes; a standalone theme has none, so its wording states
   * that the theme is incomplete without the list.
   */
  readonly lanes: string;
}

/** Inputs for one color-map read, shared by `theme.json` and user theme files. */
export interface ReadThemeColorMapOptions {
  /** Source description used verbatim in warnings, for example `theme.json`. */
  readonly source: string;
  /**
   * Whether a dropped entry falls back to a base color.
   *
   * `theme.json` always layers over a built-in theme, and an extending theme file layers over its
   * base, so a dropped entry keeps the base color. A standalone theme file has no base, so the same
   * entry is simply dropped and the token counts as missing during the completeness check.
   */
  readonly keepsBase: boolean;
  /** Warning accumulator; one warning is appended per dropped entry. */
  readonly warnings: string[];
}
