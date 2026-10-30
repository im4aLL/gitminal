import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Sonokai definition, using the default style.
 *
 * Values come from `sainnhe/sonokai`, `autoload/sonokai.vim`. The family publishes six styles, and
 * the default palette is the one upstream names `default`. The `bg0` to `bg4` ramp supplies the
 * surfaces, `fg` the primary text, `grey` and `grey_dim` the secondary tones, and the accent colors
 * the signal tokens. The added and removed line backgrounds are upstream's `bg_green` and `bg_red`.
 */
const SONOKAI_TOKENS: ThemeTokens = Object.freeze({
  background: "#2c2e34",
  panel: "#222327",
  surface: "#33353f",
  border: "#3b3e48",
  focus: "#76cce0",
  text: "#e2e2e3",
  muted: "#7f8490",
  dim: "#595f6f",
  selection: "#414550",
  accent: "#76cce0",
  success: "#9ed072",
  warning: "#e7c664",
  error: "#fc5d7c",
  info: "#76cce0",
  scrollbar: "#414550",
  tag: "#f39660",
  branchLocal: "#b39df3",
  branchRemote: "#76cce0",
  diffAdd: "#9ed072",
  diffRemove: "#fc5d7c",
  diffAddBackground: "#394634",
  diffRemoveBackground: "#55393d",
  diffContext: "#595f6f",
  diffHunk: "#76cce0",
  graph: Object.freeze(["#76cce0", "#b39df3", "#9ed072", "#e7c664", "#f39660", "#fc5d7c"] as const),
});

/** The single Sonokai definition. */
export const SONOKAI_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "sonokai",
    label: "Sonokai",
    variant: "dark",
    tokens: SONOKAI_TOKENS,
  }),
]);
