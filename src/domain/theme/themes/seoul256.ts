import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Seoul256 definition, using the dark style at its default background.
 *
 * Values come from `junegunn/seoul256.vim`. The scheme is authored against the 256-color palette: the
 * default dark style is background index 237 with foreground index 252, so the hex values here are
 * those xterm entries, not the optional sRGB approximation the plugin offers. Surfaces step darker
 * than the background, which is how the scheme builds panes. The diff line backgrounds are the
 * scheme's own DiffAdd and DiffDelete fills, and the removed-line sign uses the palette's light red
 * because the scheme itself paints no sign glyph.
 */
const SEOUL256_TOKENS: ThemeTokens = Object.freeze({
  background: "#3a3a3a",
  panel: "#262626",
  surface: "#262626",
  border: "#4e4e4e",
  focus: "#87afd7",
  text: "#d0d0d0",
  muted: "#87875f",
  dim: "#5f875f",
  selection: "#005f5f",
  accent: "#87afd7",
  success: "#87af87",
  warning: "#d7af5f",
  error: "#d75f87",
  info: "#87afd7",
  scrollbar: "#585858",
  tag: "#d7875f",
  branchLocal: "#af875f",
  branchRemote: "#87d7d7",
  diffAdd: "#87d787",
  diffRemove: "#ffafaf",
  diffAddBackground: "#005f00",
  diffRemoveBackground: "#875f5f",
  diffContext: "#5f875f",
  diffHunk: "#87afd7",
  graph: Object.freeze(["#87afd7", "#d75f87", "#87af87", "#d7af5f", "#d7875f", "#87d7d7"] as const),
});

/** The single Seoul256 definition. */
export const SEOUL256_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "seoul256",
    label: "Seoul256",
    variant: "dark",
    tokens: SEOUL256_TOKENS,
  }),
]);
