import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Jellybeans definition.
 *
 * Values come from `nanotech/jellybeans.vim`. The scheme's cursor line, visual selection, fold, and
 * popup backgrounds supply the surface ramp. The added line background is upstream's `DiffAdd` fill;
 * the removed line background is derived, because upstream's `DiffDelete` fill is darker than any
 * readable sign color would tolerate.
 */
const JELLYBEANS_TOKENS: ThemeTokens = Object.freeze({
  background: "#151515",
  panel: "#1c1c1c",
  surface: "#333333",
  border: "#403c41",
  focus: "#8fbfdc",
  text: "#e8e8d3",
  muted: "#a0a8b0",
  dim: "#888888",
  selection: "#404040",
  accent: "#8fbfdc",
  success: "#99ad6a",
  warning: "#ffb964",
  error: "#cf6a4c",
  info: "#8fbfdc",
  scrollbar: "#606060",
  tag: "#dad085",
  branchLocal: "#c6b6ee",
  branchRemote: "#8fbfdc",
  diffAdd: "#d2ebbe",
  diffRemove: "#cf6a4c",
  diffAddBackground: "#437019",
  diffRemoveBackground: "#201a18",
  diffContext: "#888888",
  diffHunk: "#8fbfdc",
  graph: Object.freeze(["#8fbfdc", "#c6b6ee", "#99ad6a", "#ffb964", "#f0a0c0", "#cf6a4c"] as const),
});

/** The single Jellybeans definition. */
export const JELLYBEANS_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "jellybeans",
    label: "Jellybeans",
    variant: "dark",
    tokens: JELLYBEANS_TOKENS,
  }),
]);
