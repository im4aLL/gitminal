import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Nightfox definition, using its default palette.
 *
 * Values come from `EdenEast/nightfox.nvim`, `lua/nightfox/palette/nightfox.lua`. The family ships
 * seven variants, and this catalogue keeps the one upstream calls `nightfox`. The `bg0` to `bg4` ramp
 * supplies the surfaces, `fg1` to `fg3` the text hierarchy, and the `sel0` shade the selected-row
 * fill. The diff line backgrounds are the theme background blended with the dim form of each signal
 * color, which is how the colorscheme derives its own diff shades.
 */
const NIGHTFOX_TOKENS: ThemeTokens = Object.freeze({
  background: "#192330",
  panel: "#131a24",
  surface: "#212e3f",
  border: "#29394f",
  focus: "#719cd6",
  text: "#cdcecf",
  muted: "#aeafb0",
  dim: "#738091",
  selection: "#2b3b51",
  accent: "#719cd6",
  success: "#81b29a",
  warning: "#dbc074",
  error: "#c94f6d",
  info: "#63cdcf",
  scrollbar: "#39506d",
  tag: "#f4a261",
  branchLocal: "#9d79d6",
  branchRemote: "#63cdcf",
  diffAdd: "#81b29a",
  diffRemove: "#c94f6d",
  diffAddBackground: "#1f2c36",
  diffRemoveBackground: "#242634",
  diffContext: "#738091",
  diffHunk: "#719cd6",
  graph: Object.freeze(["#719cd6", "#9d79d6", "#63cdcf", "#81b29a", "#f4a261", "#d67ad2"] as const),
});

/** The single Nightfox definition. */
export const NIGHTFOX_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "nightfox",
    label: "Nightfox",
    variant: "dark",
    tokens: NIGHTFOX_TOKENS,
  }),
]);
