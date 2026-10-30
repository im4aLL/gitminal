import type { ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Tomorrow definition, using the base light theme.
 *
 * Values come from `chriskempson/tomorrow-theme`, `vim/colors/Tomorrow.vim`, which is the original
 * implementation of the family. Tomorrow ships five styles and the base one is light, so this row is
 * both the canonical pick and a light theme. The palette defines a single muted tone, so `dim` carries
 * the comment gray and `muted` reuses the primary text color; the warning token uses the official
 * orange because the published yellow falls under the contrast floor on white.
 */
const TOMORROW_TOKENS: ThemeTokens = Object.freeze({
  background: "#ffffff",
  panel: "#efefef",
  surface: "#efefef",
  border: "#d6d6d6",
  focus: "#4271ae",
  text: "#4d4d4c",
  muted: "#4d4d4c",
  dim: "#8e908c",
  selection: "#d6d6d6",
  accent: "#4271ae",
  success: "#718c00",
  warning: "#f5871f",
  error: "#c82829",
  info: "#3e999f",
  scrollbar: "#d6d6d6",
  tag: "#f5871f",
  branchLocal: "#8959a8",
  branchRemote: "#3e999f",
  diffAdd: "#718c00",
  diffRemove: "#c82829",
  diffAddBackground: "#f6f8f0",
  diffRemoveBackground: "#fcf2f2",
  diffContext: "#8e908c",
  diffHunk: "#4271ae",
  graph: Object.freeze(["#4271ae", "#8959a8", "#3e999f", "#718c00", "#f5871f", "#c82829"] as const),
});

/** The single Tomorrow definition. */
export const TOMORROW_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  Object.freeze({
    name: "tomorrow",
    label: "Tomorrow",
    variant: "light",
    tokens: TOMORROW_TOKENS,
  }),
]);
