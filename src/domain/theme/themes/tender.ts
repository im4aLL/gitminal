import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Tender definition.
 *
 * Values come from `jacoborus/tender.vim`. The scheme assigns a flat dark background with a darker
 * fold and popup tone, so the panel and surface tokens share that tone while the visual selection keeps
 * its own blue-gray. The diff line backgrounds are derived tints of the theme background.
 */
const TENDER_TOKENS: ThemeTokens = Object.freeze({
  background: "#282828",
  panel: "#202020",
  surface: "#202020",
  border: "#444444",
  focus: "#73cef4",
  text: "#eeeeee",
  muted: "#999999",
  dim: "#666666",
  selection: "#293b44",
  accent: "#73cef4",
  success: "#c9d05c",
  warning: "#ffc24b",
  error: "#f43753",
  info: "#73cef4",
  scrollbar: "#335261",
  tag: "#ffc24b",
  branchLocal: "#b3deef",
  branchRemote: "#73cef4",
  diffAdd: "#c9d05c",
  diffRemove: "#f43753",
  diffAddBackground: "#32322b",
  diffRemoveBackground: "#34292b",
  diffContext: "#666666",
  diffHunk: "#73cef4",
  graph: Object.freeze(["#73cef4", "#c9d05c", "#ffc24b", "#f43753", "#b3deef", "#d3b987"] as const),
});

/** The single Tender definition. */
export const TENDER_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "tender",
    label: "Tender",
    variant: "dark",
    tokens: TENDER_TOKENS,
  }),
]);
