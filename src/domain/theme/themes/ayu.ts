import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Ayu definition, using the dark variant.
 *
 * Values come from the official `ayu` palette package, generated from `themes/dark.yaml`: the `surface`
 * ramp supplies the backgrounds, `ui` supplies borders and muted text, and the syntax and `vcs`
 * groups supply the signal colors. The selected-row fill is the official `ui.selection.active` color
 * flattened over the background at its published alpha. Secondary text uses the `gray.l5` step rather
 * than `ui.fg`, because the published muted tone sits a hundredth under the enforced 3:1 floor on the
 * raised surface.
 */
const AYU_TOKENS: ThemeTokens = Object.freeze({
  background: "#0d1017",
  panel: "#0d1017",
  surface: "#141821",
  border: "#1b1f29",
  focus: "#e6b450",
  text: "#bfbdb6",
  muted: "#667381",
  dim: "#5a6673",
  selection: "#212733",
  accent: "#e6b450",
  success: "#70bf56",
  warning: "#ffb454",
  error: "#f26d78",
  info: "#59c2ff",
  scrollbar: "#333b44",
  tag: "#ff8f40",
  branchLocal: "#d2a6ff",
  branchRemote: "#39bae6",
  diffAdd: "#70bf56",
  diffRemove: "#f26d78",
  diffAddBackground: "#131b1b",
  diffRemoveBackground: "#1b161d",
  diffContext: "#5a6673",
  diffHunk: "#59c2ff",
  graph: Object.freeze(["#59c2ff", "#d2a6ff", "#39bae6", "#aad94c", "#ffb454", "#f07178"] as const),
});

/** The single Ayu definition. */
export const AYU_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "ayu",
    label: "Ayu",
    variant: "dark",
    tokens: AYU_TOKENS,
  }),
]);
