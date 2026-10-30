import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Zenbones definition, using the Zenwritten dark scheme.
 *
 * Values come from `zenbones-theme/zenbones.nvim`, whose generated colorschemes assign color almost
 * exclusively to diagnostics and diffs and carry the rest of the interface with contrast and type
 * weight. This catalogue keeps the dark Zenwritten scheme, the one the upstream collection presents
 * as its default. The added and removed line backgrounds are derived tints, because the scheme
 * colors diff text instead of filling diff rows.
 */
const ZENBONES_TOKENS: ThemeTokens = Object.freeze({
  background: "#191919",
  panel: "#191919",
  surface: "#2c2c2c",
  border: "#555555",
  focus: "#819b69",
  text: "#bbbbbb",
  muted: "#8e8e8e",
  dim: "#686868",
  selection: "#444444",
  accent: "#819b69",
  success: "#819b69",
  warning: "#b77e64",
  error: "#de6e7c",
  info: "#6099c0",
  scrollbar: "#595959",
  tag: "#b77e64",
  branchLocal: "#b279a7",
  branchRemote: "#66a5ad",
  diffAdd: "#819b69",
  diffRemove: "#de6e7c",
  diffAddBackground: "#1f211e",
  diffRemoveBackground: "#251e1f",
  diffContext: "#686868",
  diffHunk: "#6099c0",
  graph: Object.freeze(["#6099c0", "#b279a7", "#66a5ad", "#b77e64", "#de6e7c", "#819b69"] as const),
});

/** The single Zenbones definition. */
export const ZENBONES_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "zenbones",
    label: "Zenbones",
    variant: "dark",
    tokens: ZENBONES_TOKENS,
  }),
]);
