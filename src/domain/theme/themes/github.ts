import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The GitHub definition, using the light palette.
 *
 * Values come from GitHub's Primer color tokens for the light theme, the same source the GitHub
 * terminal and editor themes are generated from: `canvas` supplies the backgrounds, `fg` the text
 * hierarchy, `border` the structure, and the `accent`, `success`, `attention`, `danger`, `done`, and
 * `severe` groups the signal colors. The diff line backgrounds are Primer's own `diffBlob` addition
 * and deletion line fills.
 */
const GITHUB_TOKENS: ThemeTokens = Object.freeze({
  background: "#f6f8fa",
  panel: "#ffffff",
  surface: "#eaeef2",
  border: "#d0d7de",
  focus: "#0969da",
  text: "#1f2328",
  muted: "#656d76",
  dim: "#6e7781",
  selection: "#d0d7de",
  accent: "#0969da",
  success: "#1a7f37",
  warning: "#9a6700",
  error: "#cf222e",
  info: "#0969da",
  scrollbar: "#d0d7de",
  tag: "#bc4c00",
  branchLocal: "#8250df",
  branchRemote: "#1b7c83",
  diffAdd: "#1a7f37",
  diffRemove: "#cf222e",
  diffAddBackground: "#e6ffec",
  diffRemoveBackground: "#ffebe9",
  diffContext: "#656d76",
  diffHunk: "#0969da",
  graph: Object.freeze(["#0969da", "#8250df", "#1b7c83", "#bc4c00", "#bf3989", "#1a7f37"] as const),
});

/** The single GitHub definition. */
export const GITHUB_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "github-light",
    label: "GitHub Light",
    variant: "light",
    tokens: GITHUB_TOKENS,
  }),
]);
