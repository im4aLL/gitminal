import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Iceberg definition, using the dark palette.
 *
 * Values come from `cocopon/iceberg.vim`, whose dark section assigns every interface color by hand.
 * The scheme paints diff lines with foreground colors only, so the added and removed line backgrounds
 * are derived tints of the theme background.
 */
const ICEBERG_TOKENS: ThemeTokens = Object.freeze({
  background: "#161821",
  panel: "#17171b",
  surface: "#1e2132",
  border: "#3e445e",
  focus: "#84a0c6",
  text: "#c6c8d1",
  muted: "#818596",
  dim: "#6b7089",
  selection: "#272c42",
  accent: "#84a0c6",
  success: "#b4be82",
  warning: "#e2a478",
  error: "#e27878",
  info: "#89b8c2",
  scrollbar: "#5b6389",
  tag: "#e2a478",
  branchLocal: "#a093c7",
  branchRemote: "#89b8c2",
  diffAdd: "#b4be82",
  diffRemove: "#e27878",
  diffAddBackground: "#1f2227",
  diffRemoveBackground: "#221e26",
  diffContext: "#6b7089",
  diffHunk: "#84a0c6",
  graph: Object.freeze(["#84a0c6", "#a093c7", "#89b8c2", "#b4be82", "#e2a478", "#e27878"] as const),
});

/** The single Iceberg definition. */
export const ICEBERG_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "iceberg",
    label: "Iceberg",
    variant: "dark",
    tokens: ICEBERG_TOKENS,
  }),
]);
