import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Everforest definition, using the medium-contrast dark palette.
 *
 * Values come from `sainnhe/everforest`, `autoload/everforest.vim`, which publishes hard, medium, and
 * soft contrast ramps per background. Medium is upstream's default. The added line background is
 * upstream's `bg_green`, the removed line background is `bg_red`, and the remaining surfaces follow
 * the same `bg0` to `bg5` ramp the colorscheme uses.
 */
const EVERFOREST_TOKENS: ThemeTokens = Object.freeze({
  background: "#2d353b",
  panel: "#232a2e",
  surface: "#343f44",
  border: "#3d484d",
  focus: "#a7c080",
  text: "#d3c6aa",
  muted: "#859289",
  dim: "#7a8478",
  selection: "#475258",
  accent: "#a7c080",
  success: "#a7c080",
  warning: "#dbbc7f",
  error: "#e67e80",
  info: "#7fbbb3",
  scrollbar: "#4f585e",
  tag: "#e69875",
  branchLocal: "#d699b6",
  branchRemote: "#83c092",
  diffAdd: "#a7c080",
  diffRemove: "#e67e80",
  diffAddBackground: "#425047",
  diffRemoveBackground: "#514045",
  diffContext: "#7a8478",
  diffHunk: "#7fbbb3",
  graph: Object.freeze(["#a7c080", "#7fbbb3", "#d699b6", "#dbbc7f", "#e69875", "#e67e80"] as const),
});

/** The single Everforest definition. */
export const EVERFOREST_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "everforest",
    label: "Everforest",
    variant: "dark",
    tokens: EVERFOREST_TOKENS,
  }),
]);
