import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Kanagawa definition, using the Wave style.
 *
 * Values come from `rebelot/kanagawa.nvim`, `lua/kanagawa/colors.lua`, which publishes the shared
 * palette for the Wave, Dragon, and Lotus styles. This family ships one built-in theme, so it keeps
 * the style that upstream treats as its default. The added and removed line backgrounds are
 * upstream's own `winterGreen` and `winterRed` diff shades rather than derived tints.
 */
const KANAGAWA_TOKENS: ThemeTokens = Object.freeze({
  background: "#1f1f28",
  panel: "#16161d",
  surface: "#2a2a37",
  border: "#363646",
  focus: "#7e9cd8",
  text: "#dcd7ba",
  muted: "#c8c093",
  dim: "#727169",
  selection: "#2d4f67",
  accent: "#7e9cd8",
  success: "#98bb6c",
  warning: "#e6c384",
  error: "#e46876",
  info: "#7fb4ca",
  scrollbar: "#54546d",
  tag: "#ffa066",
  branchLocal: "#957fb8",
  branchRemote: "#7aa89f",
  diffAdd: "#98bb6c",
  diffRemove: "#e46876",
  diffAddBackground: "#2b3328",
  diffRemoveBackground: "#43242b",
  diffContext: "#727169",
  diffHunk: "#7e9cd8",
  graph: Object.freeze(["#7e9cd8", "#957fb8", "#7aa89f", "#e6c384", "#d27e99", "#98bb6c"] as const),
});

/** The single Kanagawa definition. */
export const KANAGAWA_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "kanagawa",
    label: "Kanagawa",
    variant: "dark",
    tokens: KANAGAWA_TOKENS,
  }),
]);
