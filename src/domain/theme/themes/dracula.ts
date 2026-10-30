import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Dracula palette vocabulary shared by its dark and light themes.
 *
 * Values come from the official Dracula palette table in `dracula/dracula-theme`, including the
 * Alucard light theme. Dracula publishes one muted tone, so `comment` carries both the `muted` and
 * `dim` tokens.
 */
interface DraculaPalette {
  /** Main background. */
  readonly background: HexColor;
  /** Deep background used for panels and raised rows. */
  readonly backgroundDarker: HexColor;
  /** Selection and structural line color. */
  readonly currentLine: HexColor;
  /** Primary text. */
  readonly foreground: HexColor;
  /** Comment and scrollbar color. */
  readonly comment: HexColor;
  /** Cyan info color. */
  readonly cyan: HexColor;
  /** Green success color. */
  readonly green: HexColor;
  /** Orange tag color. */
  readonly orange: HexColor;
  /** Pink graph lane. */
  readonly pink: HexColor;
  /** Purple accent color. */
  readonly purple: HexColor;
  /** Red error color. */
  readonly red: HexColor;
  /** Yellow warning color. */
  readonly yellow: HexColor;
}

/** One Dracula theme before its tokens are built. */
interface DraculaTheme {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Theme palette. */
  readonly palette: DraculaPalette;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** The two built-in Dracula themes in picker order. */
const DRACULA_THEMES: readonly DraculaTheme[] = [
  {
    name: "dracula",
    label: "Dracula",
    variant: "dark",
    palette: Object.freeze({
      background: "#282a36",
      backgroundDarker: "#21222c",
      currentLine: "#44475a",
      foreground: "#f8f8f2",
      comment: "#6272a4",
      cyan: "#8be9fd",
      green: "#50fa7b",
      orange: "#ffb86c",
      pink: "#ff79c6",
      purple: "#bd93f9",
      red: "#ff5555",
      yellow: "#f1fa8c",
    }),
    diffAddBackground: "#2a363a",
    diffRemoveBackground: "#352d38",
  },
  {
    name: "dracula-alucard",
    label: "Dracula Alucard",
    variant: "light",
    palette: Object.freeze({
      background: "#fffbeb",
      backgroundDarker: "#f7f0dc",
      currentLine: "#cfcfde",
      foreground: "#1f1f1f",
      comment: "#6c664b",
      cyan: "#036a96",
      green: "#14710a",
      orange: "#a34d14",
      pink: "#a3144d",
      purple: "#644ac9",
      red: "#cb3a2a",
      yellow: "#846e15",
    }),
    diffAddBackground: "#f1f3dd",
    diffRemoveBackground: "#fcefdf",
  },
];

/** Every Dracula definition, in picker order. */
export const DRACULA_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  DRACULA_THEMES.map(createDefinition),
);

/**
 * Builds one Dracula definition from its theme.
 *
 * @param theme - The theme definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(theme: DraculaTheme): ThemeDefinition {
  return Object.freeze({
    name: theme.name,
    label: theme.label,
    variant: theme.variant,
    tokens: createTokens(theme.palette, theme.diffAddBackground, theme.diffRemoveBackground),
  });
}

/**
 * Maps the Dracula palette onto the Gitminal token table.
 *
 * @param palette - The theme palette.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  palette: DraculaPalette,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: palette.background,
    panel: palette.backgroundDarker,
    surface: palette.backgroundDarker,
    border: palette.currentLine,
    focus: palette.purple,
    text: palette.foreground,
    muted: palette.comment,
    dim: palette.comment,
    selection: palette.currentLine,
    accent: palette.purple,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.cyan,
    scrollbar: palette.comment,
    tag: palette.orange,
    branchLocal: palette.purple,
    branchRemote: palette.cyan,
    diffAdd: palette.green,
    diffRemove: palette.red,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: palette.comment,
    diffHunk: palette.cyan,
    graph: Object.freeze([
      palette.purple,
      palette.cyan,
      palette.green,
      palette.orange,
      palette.pink,
      palette.red,
    ]),
  });
}
