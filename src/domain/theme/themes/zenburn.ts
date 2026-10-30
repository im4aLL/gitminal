import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Zenburn definition.
 *
 * Values come from `jnurmine/Zenburn`, `colors/zenburn.vim`, using the default low-contrast
 * backgrounds and the colors the colorscheme assigns to syntax groups. Zenburn defines its own
 * scrollbar and popup surfaces, which is what the border, selection, and scrollbar tokens use here.
 */
const ZENBURN_TOKENS: ThemeTokens = Object.freeze({
  background: "#3f3f3f",
  panel: "#333333",
  surface: "#4f4f4f",
  border: "#545a4f",
  focus: "#f0dfaf",
  text: "#dcdccc",
  muted: "#9fafaf",
  dim: "#8f8f8f",
  selection: "#2f2f2f",
  accent: "#f0dfaf",
  success: "#9ece9e",
  warning: "#e3ceab",
  error: "#cc9393",
  info: "#8cd0d3",
  scrollbar: "#6f6f6f",
  tag: "#dfaf8f",
  branchLocal: "#dca3a3",
  branchRemote: "#8cd0d3",
  diffAdd: "#9ece9e",
  diffRemove: "#cc9393",
  diffAddBackground: "#454845",
  diffRemoveBackground: "#474444",
  diffContext: "#8f8f8f",
  diffHunk: "#8cd0d3",
  graph: Object.freeze(["#8cd0d3", "#dca3a3", "#efef8f", "#cc9393", "#9ece9e", "#dfaf8f"] as const),
});

/** The single Zenburn definition. */
export const ZENBURN_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "zenburn",
    label: "Zenburn",
    variant: "dark",
    tokens: ZENBURN_TOKENS,
  }),
]);
