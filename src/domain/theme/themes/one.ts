import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Atom One palette vocabulary shared by One Dark and One Light.
 *
 * Values come from the official `atom/one-dark-syntax` and `atom/one-light-syntax` color files, which
 * define the palette in HSL. The hex values here are those HSL definitions converted with the same
 * standard HSL-to-sRGB formula the Less preprocessor uses.
 */
interface OnePalette {
  /** Main background. */
  readonly background: HexColor;
  /** Status bar background. */
  readonly backgroundDark: HexColor;
  /** Raised row background. */
  readonly backgroundRaised: HexColor;
  /** Selection background. */
  readonly selection: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Secondary text. */
  readonly textMuted: HexColor;
  /** Comment text. */
  readonly textDim: HexColor;
  /** Accent blue. */
  readonly blue: HexColor;
  /** Cyan info color. */
  readonly cyan: HexColor;
  /** Green success color. */
  readonly green: HexColor;
  /** Purple graph lane. */
  readonly purple: HexColor;
  /** Red error color. */
  readonly red: HexColor;
  /** Orange tag color. */
  readonly orange: HexColor;
  /** Yellow warning color. */
  readonly yellow: HexColor;
}

/** One Atom One theme before its tokens are built. */
interface OneTheme {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Theme palette. */
  readonly palette: OnePalette;
  /** Added-line sign color. */
  readonly diffAdd: HexColor;
  /** Removed-line sign color. */
  readonly diffRemove: HexColor;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/**
 * The two built-in Atom One themes in picker order.
 *
 * One Light's official green and red cannot reach the enforced 3:1 diff-sign floor on any light
 * background, because their lightness leaves too little headroom above the One Light paper tone. The
 * diff sign colors are therefore the same official hues four to eight points darker, while every
 * other token keeps the published value.
 */
const ONE_THEMES: readonly OneTheme[] = [
  {
    name: "one-dark",
    label: "One Dark",
    variant: "dark",
    palette: Object.freeze({
      background: "#282c34",
      backgroundDark: "#21252b",
      backgroundRaised: "#2c323c",
      selection: "#3e4451",
      text: "#abb2bf",
      textMuted: "#828997",
      textDim: "#5c6370",
      blue: "#528bff",
      cyan: "#56b6c2",
      green: "#98c379",
      purple: "#c678dd",
      red: "#e06c75",
      orange: "#d19a66",
      yellow: "#e5c07b",
    }),
    diffAdd: "#98c379",
    diffRemove: "#e06c75",
    diffAddBackground: "#2f3538",
    diffRemoveBackground: "#333038",
  },
  {
    name: "one-light",
    label: "One Light",
    variant: "light",
    palette: Object.freeze({
      background: "#fafafa",
      backgroundDark: "#f0f0f0",
      backgroundRaised: "#eaeaeb",
      selection: "#e5e5e6",
      text: "#383a42",
      textMuted: "#696c77",
      textDim: "#a0a1a7",
      blue: "#526eff",
      cyan: "#0184bc",
      green: "#50a14f",
      purple: "#a626a4",
      red: "#e45649",
      orange: "#986801",
      yellow: "#c18401",
    }),
    diffAdd: "#3e7b3d",
    diffRemove: "#d12e1f",
    diffAddBackground: "#eff2ef",
    diffRemoveBackground: "#f8eeed",
  },
];

/** Every Atom One definition, in picker order. */
export const ONE_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  ONE_THEMES.map(createDefinition),
);

/**
 * Builds one Atom One definition from its theme.
 *
 * @param theme - The theme definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(theme: OneTheme): ThemeDefinition {
  return Object.freeze({
    name: theme.name,
    label: theme.label,
    variant: theme.variant,
    tokens: createTokens(theme),
  });
}

/**
 * Maps the Atom One palette onto the Gitminal token table.
 *
 * @param theme - The theme to map.
 * @returns The final, frozen token set.
 */
function createTokens(theme: OneTheme): ThemeTokens {
  const { palette } = theme;

  return Object.freeze({
    background: palette.background,
    panel: palette.backgroundDark,
    surface: palette.backgroundRaised,
    border: palette.selection,
    focus: palette.blue,
    text: palette.text,
    muted: palette.textMuted,
    dim: palette.textDim,
    selection: palette.selection,
    accent: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.cyan,
    scrollbar: palette.selection,
    tag: palette.orange,
    branchLocal: palette.purple,
    branchRemote: palette.cyan,
    diffAdd: theme.diffAdd,
    diffRemove: theme.diffRemove,
    diffAddBackground: theme.diffAddBackground,
    diffRemoveBackground: theme.diffRemoveBackground,
    diffContext: palette.textDim,
    diffHunk: palette.blue,
    graph: Object.freeze([
      palette.blue,
      palette.purple,
      palette.cyan,
      palette.green,
      palette.orange,
      palette.red,
    ]),
  });
}
