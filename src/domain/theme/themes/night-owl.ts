import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Night Owl definition, using the dark theme.
 *
 * Values come from `sdras/night-owl-vscode-theme`: the editor, sidebar, panel, tab, and list colors
 * from the workbench block, and the syntax and terminal colors from the theme's own palette. The
 * selected-row fill is the published list selection alpha flattened over the background, and the diff
 * line backgrounds are derived tints because the theme paints diff text rather than rows.
 */
const NIGHT_OWL_TOKENS: ThemeTokens = Object.freeze({
  background: "#011627",
  panel: "#01111d",
  surface: "#0b2942",
  border: "#1d3b53",
  focus: "#82aaff",
  text: "#d6deeb",
  muted: "#89a4bb",
  dim: "#637777",
  selection: "#14344f",
  accent: "#82aaff",
  success: "#22da6e",
  warning: "#c5e478",
  error: "#ff5874",
  info: "#7fdbca",
  scrollbar: "#5f7e97",
  tag: "#c792ea",
  branchLocal: "#82aaff",
  branchRemote: "#7fdbca",
  diffAdd: "#22da6e",
  diffRemove: "#ff5874",
  diffAddBackground: "#03222b",
  diffRemoveBackground: "#101a2c",
  diffContext: "#637777",
  diffHunk: "#82aaff",
  graph: Object.freeze(["#82aaff", "#c792ea", "#7fdbca", "#22da6e", "#c5e478", "#ff5874"] as const),
});

/** The single Night Owl definition. */
export const NIGHT_OWL_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "night-owl",
    label: "Night Owl",
    variant: "dark",
    tokens: NIGHT_OWL_TOKENS,
  }),
]);
