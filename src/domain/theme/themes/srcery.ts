import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Srcery definition.
 *
 * Values come from `srcery-colors/srcery-vim`, including its configurable defaults for the sixteen
 * terminal colors and the gray ramp. Srcery names its own backgrounds, so the panel, surface, and
 * selection tokens follow the scheme's gray steps, and the added and removed line backgrounds are its
 * `dark_green` and `dark_red` diff fills.
 */
const SRCERY_TOKENS: ThemeTokens = Object.freeze({
  background: "#1c1b19",
  panel: "#121212",
  surface: "#262522",
  border: "#312f2c",
  focus: "#fbb829",
  text: "#fce8c3",
  muted: "#c5b088",
  dim: "#917e6b",
  selection: "#3b3935",
  accent: "#fbb829",
  success: "#519f50",
  warning: "#fed06e",
  error: "#ef2f27",
  info: "#68a8e4",
  scrollbar: "#504d47",
  tag: "#ff5f00",
  branchLocal: "#ff5c8f",
  branchRemote: "#2be4d0",
  diffAdd: "#98bc37",
  diffRemove: "#f75341",
  diffAddBackground: "#294229",
  diffRemoveBackground: "#4f2321",
  diffContext: "#917e6b",
  diffHunk: "#68a8e4",
  graph: Object.freeze(["#68a8e4", "#ff5c8f", "#2be4d0", "#98bc37", "#fed06e", "#ff8700"] as const),
});

/** The single Srcery definition. */
export const SRCERY_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "srcery",
    label: "Srcery",
    variant: "dark",
    tokens: SRCERY_TOKENS,
  }),
]);
