import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Noctis definition, using the default dark theme.
 *
 * Values come from `liviuschera/noctis`: the editor, sidebar, panel, widget, input, and list colors
 * from the workbench definition, and the syntax colors from the palette. Noctis publishes eleven
 * variants, and this catalogue keeps the one named after the project. The diff line backgrounds are
 * derived from the theme background and the matching signal color, because the workbench defines no
 * diff fills of its own.
 */
const NOCTIS_TOKENS: ThemeTokens = Object.freeze({
  background: "#052529",
  panel: "#041d20",
  surface: "#073940",
  border: "#0f1415",
  focus: "#40d4e7",
  text: "#b2cacd",
  muted: "#929ea0",
  dim: "#5b858b",
  selection: "#0e6671",
  accent: "#40d4e7",
  success: "#49e9a6",
  warning: "#d5971a",
  error: "#e3541c",
  info: "#49ace9",
  scrollbar: "#6a9095",
  tag: "#e66533",
  branchLocal: "#df769b",
  branchRemote: "#49d6e9",
  diffAdd: "#49e9a6",
  diffRemove: "#e3541c",
  diffAddBackground: "#093131",
  diffRemoveBackground: "#122828",
  diffContext: "#5b858b",
  diffHunk: "#16a3b6",
  graph: Object.freeze(["#16a3b6", "#df769b", "#49d6e9", "#49e9a6", "#e4b781", "#7060eb"] as const),
});

/** The single Noctis definition. */
export const NOCTIS_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "noctis",
    label: "Noctis",
    variant: "dark",
    tokens: NOCTIS_TOKENS,
  }),
]);
