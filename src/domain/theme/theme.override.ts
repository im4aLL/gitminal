import { isPlainObject } from "@/lib/object";
import type { ThemeCatalogueEntry } from "./theme.catalogue.types";
import type {
  DroppedEntryWords,
  ReadThemeColorMapOptions,
  ThemeColorMap,
  ThemeOverrideLayer,
} from "./theme.override.types";
import type { ThemeToken } from "./theme.tokens";
import { THEME_TOKEN_NAMES } from "./theme.tokens";
import type { HexColor, ThemeTokens } from "./theme.types";

/** Every accepted color is a six-digit `#RRGGBB` value. */
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Largest graph lane list a color map may contribute.
 *
 * One to sixteen lanes render correctly because `GraphLanes` indexes with
 * `lane % laneColors.length`, and four to eight is the sensible visual range. The cap keeps a
 * hand-written file from contributing an unbounded list.
 */
const MAX_GRAPH_LANES = 16;

/** Wording of a warning suffix when a dropped entry falls back to a base color. */
const KEPT_WORDS: DroppedEntryWords = Object.freeze({
  color: "the base color was kept.",
  lane: "the base lane was kept.",
  lanes: "the base lanes were kept.",
});

/**
 * Wording of a warning suffix when a standalone theme has no base to fall back to.
 *
 * A dropped graph lane list makes such a theme incomplete, and the completeness warning is
 * suppressed for that same defect, so this suffix is the only place the rejection is stated. Dropped
 * colors and single lanes are either repeated by the completeness warning or simply degrade the
 * list, so they keep the plain ignored wording.
 */
const DROPPED_WORDS: DroppedEntryWords = Object.freeze({
  color: "the color was ignored.",
  lane: "the lane was ignored.",
  lanes: "the theme is incomplete without it.",
});

/**
 * Validates the color map shared by `theme.json` and user theme files.
 *
 * Both sources accept exactly the same token names, the same `#RRGGBB` values, and the same graph
 * list rule, so one reader owns the regex, the warning vocabulary, and the lane replacement rule.
 * An unknown token name or an invalid color is dropped with a warning; `graph` replaces the base
 * lanes rather than merging, and an absent, invalid, or empty list keeps them, or makes a standalone
 * theme incomplete. A list longer than `MAX_GRAPH_LANES` keeps its first sixteen entries with a
 * warning.
 *
 * The caller decides what a dropped entry means. `theme.json` and an extending theme file keep the
 * base color, while a standalone theme has no base to keep, so its dropped entry makes the token
 * missing for the completeness check.
 *
 * @param colors - Raw `colors` object from the file.
 * @param options - Source description, dropped-entry behavior, and warning accumulator.
 * @returns The accepted token colors and graph lanes.
 */
export function readThemeColorMap(
  colors: Record<string, unknown>,
  options: ReadThemeColorMapOptions,
): ThemeColorMap {
  return Object.freeze({
    tokens: Object.freeze(readTokenOverrides(colors, options)),
    graph: readGraphLanes(colors.graph, options),
  });
}

/**
 * Validates one raw `theme.json` value.
 *
 * The envelope is shared only by `theme.json`: it checks the object shape, the schema version, and
 * the required `colors` object before delegating the color map itself. A bad file never prevents
 * launch, because every failure keeps the base theme and reports one warning.
 *
 * @param raw - Parsed file value, or `null` and `undefined` when absent.
 * @param warnings - Warning accumulator.
 * @returns The validated override layer, or `null` when the file is absent or unusable.
 */
export function readOverrideLayer(raw: unknown, warnings: string[]): ThemeOverrideLayer | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (!isPlainObject(raw)) {
    warnings.push("theme.json is not a JSON object; the base theme is in use.");

    return null;
  }

  if (!isSupportedThemeVersion(raw.version)) {
    warnings.push("Unsupported version in theme.json; the file was ignored.");

    return null;
  }

  const colors = raw.colors;

  if (!isPlainObject(colors)) {
    warnings.push("theme.json has no colors object; the base theme is in use.");

    return null;
  }

  return readThemeColorMap(colors, { source: "theme.json", keepsBase: true, warnings });
}

/**
 * Layers the validated overrides over one catalogue entry.
 *
 * The entry's token object is returned by reference when nothing overrides it, so an unconfigured
 * theme keeps its frozen catalogue instance. `useThemeSyntaxStyle` memoizes on that identity and
 * destroys the previous native syntax style, so identity churn would cost a native rebuild per
 * render.
 *
 * @param entry - The selected catalogue entry.
 * @param layer - Validated overrides, or `null` when `theme.json` is absent.
 * @returns The token table with per-token overrides and graph lane colors applied.
 */
export function mergeOverrideLayer(
  entry: ThemeCatalogueEntry,
  layer: ThemeOverrideLayer | null,
): ThemeTokens {
  if (layer === null) {
    return entry.tokens;
  }

  if (layer.graph === null && Object.keys(layer.tokens).length === 0) {
    return entry.tokens;
  }

  return Object.freeze({
    ...entry.tokens,
    ...layer.tokens,
    graph: Object.freeze(layer.graph ?? entry.tokens.graph),
  });
}

/**
 * Reads the warning wording for one dropped color-map entry.
 *
 * @param options - Source and dropped-entry behavior.
 * @returns The color, single-lane, and lane-list suffixes for the source's fallback rule.
 */
function readDroppedWords(options: ReadThemeColorMapOptions): DroppedEntryWords {
  return options.keepsBase ? KEPT_WORDS : DROPPED_WORDS;
}

/**
 * Reports whether a theme file schema version is supported.
 *
 * `theme.json` and user theme files share the same schema version, so both readers call this one
 * helper instead of repeating the accepted-value rule.
 *
 * @param version - Raw version value.
 * @returns True when the version is absent or one, per F-20.
 */
export function isSupportedThemeVersion(version: unknown): boolean {
  return version === undefined || version === 1;
}

/**
 * Reads every accepted per-token color.
 *
 * @param colors - The required `colors` object.
 * @param options - Source description, dropped-entry behavior, and warning accumulator.
 * @returns The accepted token colors; `graph` is handled separately.
 */
function readTokenOverrides(
  colors: Record<string, unknown>,
  options: ReadThemeColorMapOptions,
): Partial<Record<Exclude<ThemeToken, "graph">, HexColor>> {
  const tokens: Partial<Record<Exclude<ThemeToken, "graph">, HexColor>> = {};
  const dropped = readDroppedWords(options);

  for (const [token, value] of Object.entries(colors)) {
    if (token === "graph") {
      continue;
    }

    if (!THEME_TOKEN_NAMES.includes(token as ThemeToken)) {
      options.warnings.push(`Unknown token "${token}" in ${options.source}; ${dropped.color}`);

      continue;
    }

    if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) {
      options.warnings.push(`Invalid color for "${token}" in ${options.source}; ${dropped.color}`);

      continue;
    }

    tokens[token as Exclude<ThemeToken, "graph">] = value.toLowerCase() as HexColor;
  }

  return tokens;
}

/**
 * Reads the optional graph lane list.
 *
 * An entry that is not a valid color is dropped with a warning, and an invalid, empty, or missing
 * list keeps the base lanes, or makes a standalone theme incomplete. A list longer than
 * `MAX_GRAPH_LANES` keeps the first sixteen entries, so the graph never receives an unbounded lane
 * list.
 *
 * @param raw - Raw `graph` value.
 * @param options - Source description, dropped-entry behavior, and warning accumulator.
 * @returns The lane colors, or `null` when the base lanes are kept.
 */
function readGraphLanes(
  raw: unknown,
  options: ReadThemeColorMapOptions,
): readonly HexColor[] | null {
  if (raw === undefined) {
    return null;
  }

  const dropped = readDroppedWords(options);

  if (!Array.isArray(raw)) {
    options.warnings.push(
      `The "graph" color list in ${options.source} must be an array; ${dropped.lanes}`,
    );

    return null;
  }

  const lanes: HexColor[] = [];

  for (const value of raw) {
    if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) {
      options.warnings.push(`Invalid graph lane color in ${options.source}; ${dropped.lane}`);

      continue;
    }

    lanes.push(value.toLowerCase() as HexColor);
  }

  if (lanes.length === 0) {
    options.warnings.push(
      `The "graph" color list in ${options.source} has no valid colors; ${dropped.lanes}`,
    );

    return null;
  }

  if (lanes.length > MAX_GRAPH_LANES) {
    options.warnings.push(
      `The "graph" color list in ${options.source} keeps at most ${MAX_GRAPH_LANES} colors; the rest were ignored.`,
    );

    return Object.freeze(lanes.slice(0, MAX_GRAPH_LANES));
  }

  return Object.freeze(lanes);
}
