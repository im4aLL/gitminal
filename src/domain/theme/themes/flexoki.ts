import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Flexoki palette vocabulary shared by its light and dark themes.
 *
 * Values come from `kepano/flexoki`, which publishes the base and accent ramps and states the
 * documented usage: `paper` and `black` are the primary backgrounds, the base ramp carries text and
 * interface surfaces, and the 600 accents are for light themes while the 400 accents are for dark
 * themes. Flexoki is MIT licensed.
 */
interface FlexokiPalette {
  /** Primary background. */
  readonly bg: HexColor;
  /** Secondary background. */
  readonly bg2: HexColor;
  /** Border color. */
  readonly ui: HexColor;
  /** Hovered border and raised row background. */
  readonly ui2: HexColor;
  /** Selected row and scrollbar background. */
  readonly ui3: HexColor;
  /** Primary text. */
  readonly tx: HexColor;
  /** Secondary text. */
  readonly tx2: HexColor;
  /** Dim comment color. */
  readonly tx3: HexColor;
  /** Accent red. */
  readonly red: HexColor;
  /** Accent orange. */
  readonly orange: HexColor;
  /** Accent yellow. */
  readonly yellow: HexColor;
  /** Accent green. */
  readonly green: HexColor;
  /** Accent cyan. */
  readonly cyan: HexColor;
  /** Accent blue. */
  readonly blue: HexColor;
  /** Accent purple. */
  readonly purple: HexColor;
  /** Accent magenta. */
  readonly magenta: HexColor;
}

/** One Flexoki theme before its tokens are built. */
interface FlexokiTheme {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Theme palette. */
  readonly palette: FlexokiPalette;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** The two built-in Flexoki themes in picker order. */
const FLEXOKI_THEMES: readonly FlexokiTheme[] = [
  {
    name: "flexoki-ink",
    label: "Flexoki Ink",
    variant: "dark",
    palette: Object.freeze({
      bg: "#100f0f",
      bg2: "#1c1b1a",
      ui: "#282726",
      ui2: "#343331",
      ui3: "#403e3c",
      tx: "#cecdc3",
      tx2: "#878580",
      tx3: "#6f6e69",
      red: "#d14d41",
      orange: "#da702c",
      yellow: "#d0a215",
      green: "#879a39",
      cyan: "#3aa99f",
      blue: "#4385be",
      purple: "#8b7ec8",
      magenta: "#ce5d97",
    }),
    diffAddBackground: "#212215",
    diffRemoveBackground: "#2b1816",
  },
  {
    name: "flexoki-paper",
    label: "Flexoki Paper",
    variant: "light",
    palette: Object.freeze({
      bg: "#fffcf0",
      bg2: "#f2f0e5",
      ui: "#e6e4d9",
      ui2: "#dad8ce",
      ui3: "#cecdc3",
      tx: "#100f0f",
      tx2: "#6f6e69",
      tx3: "#878580",
      red: "#af3029",
      orange: "#bc5215",
      yellow: "#ad8301",
      green: "#66800b",
      cyan: "#24837b",
      blue: "#205ea6",
      purple: "#5e409d",
      magenta: "#a02f6f",
    }),
    diffAddBackground: "#eaebd0",
    diffRemoveBackground: "#f4dfd4",
  },
];

/** Every Flexoki definition, in picker order. */
export const FLEXOKI_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  FLEXOKI_THEMES.map(createDefinition),
);

/**
 * Builds one Flexoki definition from its theme.
 *
 * @param theme - The theme definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(theme: FlexokiTheme): ThemeDefinition {
  return Object.freeze({
    name: theme.name,
    label: theme.label,
    variant: theme.variant,
    tokens: createTokens(theme.palette, theme.diffAddBackground, theme.diffRemoveBackground),
  });
}

/**
 * Maps the Flexoki palette onto the Gitminal token table.
 *
 * @param palette - The theme palette.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  palette: FlexokiPalette,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: palette.bg,
    panel: palette.bg2,
    surface: palette.ui,
    border: palette.ui2,
    focus: palette.blue,
    text: palette.tx,
    muted: palette.tx2,
    dim: palette.tx3,
    selection: palette.ui3,
    accent: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.blue,
    scrollbar: palette.ui2,
    tag: palette.orange,
    branchLocal: palette.purple,
    branchRemote: palette.cyan,
    diffAdd: palette.green,
    diffRemove: palette.red,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: palette.tx3,
    diffHunk: palette.blue,
    graph: Object.freeze([
      palette.blue,
      palette.purple,
      palette.cyan,
      palette.orange,
      palette.magenta,
      palette.green,
    ]),
  });
}
