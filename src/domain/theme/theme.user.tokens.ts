import type { ThemeColorMap } from "./theme.override.types";
import type { ThemeToken } from "./theme.tokens";
import { THEME_TOKEN_NAMES } from "./theme.tokens";
import type { HexColor, ThemeDefinition, ThemeTokens } from "./theme.types";

/** Every scalar token a complete theme must define. */
const REQUIRED_TOKEN_NAMES: readonly Exclude<ThemeToken, "graph">[] = THEME_TOKEN_NAMES.filter(
  (token): token is Exclude<ThemeToken, "graph"> => token !== "graph",
);

/**
 * Builds the complete tokens of a standalone theme.
 *
 * Every scalar token and a non-empty graph lane list are required, because a standalone theme has
 * no base to inherit from. `panel` is required too, even though it has no consumer today; exempting
 * it would be a permanent special case.
 *
 * @param map - Validated color map.
 * @returns The frozen complete tokens, or `null` when the map is incomplete.
 */
export function readStandaloneTokens(map: ThemeColorMap): ThemeTokens | null {
  if (map.graph === null) {
    return null;
  }

  if (REQUIRED_TOKEN_NAMES.some((token) => map.tokens[token] === undefined)) {
    return null;
  }

  return buildTokens(map.tokens, map.graph);
}

/**
 * Collects the tokens a standalone theme is missing, in alphabetical order.
 *
 * A `graph` field that was present but invalid or empty already produced its own dropped-list
 * warning, and for a standalone theme that warning also states the theme is incomplete, so
 * `graphWarned` keeps the completeness warning from repeating the same defect. An absent graph
 * field has no such warning, so it is still reported as missing.
 *
 * @param map - Validated color map.
 * @param graphWarned - True when a present graph field already produced a dropped-list warning that
 * names the defect and, for a standalone theme, the resulting rejection.
 * @returns The missing token names, including `graph` when no lane list was accepted and no earlier
 * graph warning was emitted.
 */
export function readMissingTokens(map: ThemeColorMap, graphWarned: boolean): readonly string[] {
  const missing: string[] = REQUIRED_TOKEN_NAMES.filter((token) => map.tokens[token] === undefined);

  if (map.graph === null && !graphWarned) {
    missing.push("graph");
  }

  return missing.sort();
}

/**
 * Builds a frozen token table from a complete scalar map and its graph lanes.
 *
 * @param tokens - Scalar tokens, already checked for completeness.
 * @param graph - Accepted graph lane colors.
 * @returns The frozen complete token table.
 */
function buildTokens(
  tokens: Partial<Record<Exclude<ThemeToken, "graph">, HexColor>>,
  graph: readonly HexColor[],
): ThemeTokens {
  // Completeness was checked by `readStandaloneTokens`, so every scalar token is present here.
  return Object.freeze({ ...tokens, graph }) as ThemeTokens;
}

/**
 * Layers an extending theme's accepted colors over its built-in base.
 *
 * A missing token is inherited silently, and an invalid or empty `graph` list keeps the base lanes,
 * because the shared reader returns `null` for it.
 *
 * @param base - Built-in base definition.
 * @param map - Validated color map.
 * @returns The frozen token table.
 */
export function mergeWithBase(base: ThemeDefinition, map: ThemeColorMap): ThemeTokens {
  return Object.freeze({
    ...base.tokens,
    ...map.tokens,
    graph: map.graph ?? base.tokens.graph,
  });
}

/**
 * Builds the single warning that names every missing token of an incomplete theme.
 *
 * @param name - Theme identity.
 * @param missing - Missing token names.
 * @returns The completeness warning.
 */
export function readMissingWarning(name: string, missing: readonly string[]): string {
  const noun = readMissingNoun(missing);

  return `Theme "${name}" needs ${missing.length} more ${noun}: ${missing.join(", ")}.`;
}

/**
 * Reads the noun for the completeness warning.
 *
 * Scalar tokens are colors, matching the documented ticket example. A missing graph entry is a lane
 * list rather than a color, so any list that includes it uses the generic entry wording.
 *
 * @param missing - Missing token names.
 * @returns `color` or `colors` for scalar tokens, `entry` or `entries` when the graph is included.
 */
function readMissingNoun(missing: readonly string[]): string {
  if (missing.includes("graph")) {
    return missing.length === 1 ? "entry" : "entries";
  }

  return missing.length === 1 ? "color" : "colors";
}
