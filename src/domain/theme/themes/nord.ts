import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Nord definition.
 *
 * Values come from `nordtheme/nord`, `src/nord.css`. Nord ships a single arctic palette with no light
 * variant, so the theme uses the Polar Night surfaces for backgrounds and the Snow Storm and Frost
 * groups for text and accents.
 */
const NORD_TOKENS: ThemeTokens = Object.freeze({
  background: "#2e3440",
  panel: "#3b4252",
  surface: "#3b4252",
  border: "#4c566a",
  focus: "#88c0d0",
  text: "#d8dee9",
  muted: "#81a1c1",
  dim: "#5e81ac",
  selection: "#434c5e",
  accent: "#88c0d0",
  success: "#a3be8c",
  warning: "#ebcb8b",
  error: "#bf616a",
  info: "#88c0d0",
  scrollbar: "#4c566a",
  tag: "#d08770",
  branchLocal: "#b48ead",
  branchRemote: "#8fbcbb",
  diffAdd: "#a3be8c",
  diffRemove: "#bf616a",
  diffAddBackground: "#3e474b",
  diffRemoveBackground: "#292f3a",
  diffContext: "#5e81ac",
  diffHunk: "#81a1c1",
  graph: Object.freeze(["#88c0d0", "#a3be8c", "#ebcb8b", "#b48ead", "#d08770", "#8fbcbb"] as const),
});

/** The single Nord definition. */
export const NORD_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "nord",
    label: "Nord",
    variant: "dark",
    tokens: NORD_TOKENS,
  }),
]);
