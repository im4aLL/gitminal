import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Tokyo Night palette vocabulary shared by its styles.
 *
 * Values come from `folke/tokyonight.nvim`: the night, storm, and moon styles from
 * `lua/tokyonight/colors/*.lua`, and the day style from the generated `extras/lua/tokyonight_day.lua`,
 * which is what upstream derives by inverting the night palette. The day style keeps every published
 * color but uses the main background for its panels, the published visual background for selection,
 * and the published red hue four points darker for the removed-line sign, because the deeper surfaces
 * and the published red cannot reach the enforced contrast floors.
 */
interface TokyoNightPalette {
  /** Main background. */
  readonly bg: HexColor;
  /** Deep background used by the sidebar and status surfaces. */
  readonly bgDark: HexColor;
  /** Raised row background. */
  readonly bgHighlight: HexColor;
  /** Structural line color. */
  readonly terminalBlack: HexColor;
  /** Primary blue accent. */
  readonly blue: HexColor;
  /** Muted blue used for selection and the scrollbar. */
  readonly blue7: HexColor;
  /** Bright cyan used for informational text. */
  readonly cyan: HexColor;
  /** Comment color, used for dim text and diff context. */
  readonly comment: HexColor;
  /** Primary text. */
  readonly fg: HexColor;
  /** Secondary text. */
  readonly fgDark: HexColor;
  /** Success green. */
  readonly green: HexColor;
  /** Teal-green graph lane. */
  readonly green1: HexColor;
  /** Magenta branch color. */
  readonly magenta: HexColor;
  /** Orange tag color. */
  readonly orange: HexColor;
  /** Purple graph lane. */
  readonly purple: HexColor;
  /** Error red. */
  readonly red: HexColor;
  /** Warning yellow. */
  readonly yellow: HexColor;
}

/** One Tokyo Night style before its tokens are built. */
interface TokyoNightStyle {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Style palette. */
  readonly palette: TokyoNightPalette;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** Palette shared by the night and storm styles; only the backgrounds differ. */
const NIGHT_STORM_PALETTE: TokyoNightPalette = Object.freeze({
  bg: "#1a1b26",
  bgDark: "#16161e",
  bgHighlight: "#292e42",
  terminalBlack: "#414868",
  blue: "#7aa2f7",
  blue7: "#394b70",
  cyan: "#7dcfff",
  comment: "#565f89",
  fg: "#c0caf5",
  fgDark: "#a9b1d6",
  green: "#9ece6a",
  green1: "#73daca",
  magenta: "#bb9af7",
  orange: "#ff9e64",
  purple: "#9d7cd8",
  red: "#f7768e",
  yellow: "#e0af68",
});

/** The four built-in Tokyo Night styles in picker order. */
const TOKYO_NIGHT_STYLES: readonly TokyoNightStyle[] = [
  {
    name: "tokyo-night-night",
    label: "Tokyo Night",
    variant: "dark",
    palette: NIGHT_STORM_PALETTE,
    diffAddBackground: "#2c3430",
    diffRemoveBackground: "#392835",
  },
  {
    name: "tokyo-night-storm",
    label: "Tokyo Night Storm",
    variant: "dark",
    palette: Object.freeze({
      ...NIGHT_STORM_PALETTE,
      bg: "#24283b",
      bgDark: "#1f2335",
      bgHighlight: "#292e42",
    }),
    diffAddBackground: "#353f42",
    diffRemoveBackground: "#423347",
  },
  {
    name: "tokyo-night-moon",
    label: "Tokyo Night Moon",
    variant: "dark",
    palette: Object.freeze({
      bg: "#222436",
      bgDark: "#1e2030",
      bgHighlight: "#2f334d",
      terminalBlack: "#444a73",
      blue: "#82aaff",
      blue7: "#394b70",
      cyan: "#86e1fc",
      comment: "#636da6",
      fg: "#c8d3f5",
      fgDark: "#828bb8",
      green: "#c3e88d",
      green1: "#4fd6be",
      magenta: "#c099ff",
      orange: "#ff966c",
      purple: "#fca7ea",
      red: "#ff757f",
      yellow: "#ffc777",
    }),
    diffAddBackground: "#393f42",
    diffRemoveBackground: "#412f40",
  },
  {
    name: "tokyo-night-day",
    label: "Tokyo Night Day",
    variant: "light",
    palette: Object.freeze({
      bg: "#e1e2e7",
      bgDark: "#e1e2e7",
      bgHighlight: "#e1e2e7",
      terminalBlack: "#b4b5b9",
      blue: "#2e7de9",
      blue7: "#b7c1e3",
      cyan: "#007197",
      comment: "#848cb5",
      fg: "#3760bf",
      fgDark: "#6172b0",
      green: "#587539",
      green1: "#387068",
      magenta: "#9854f1",
      orange: "#b15c00",
      purple: "#7847bd",
      red: "#db0a49",
      yellow: "#8c6c3e",
    }),
    diffAddBackground: "#d9dbdd",
    diffRemoveBackground: "#e1d5de",
  },
];

/** Every Tokyo Night definition, in picker order. */
export const TOKYO_NIGHT_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  TOKYO_NIGHT_STYLES.map(createDefinition),
);

/**
 * Builds one Tokyo Night definition from its style.
 *
 * @param style - The style definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(style: TokyoNightStyle): ThemeDefinition {
  return Object.freeze({
    name: style.name,
    label: style.label,
    variant: style.variant,
    tokens: createTokens(style.palette, style.diffAddBackground, style.diffRemoveBackground),
  });
}

/**
 * Maps the Tokyo Night palette onto the Gitminal token table.
 *
 * @param palette - The style palette.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  palette: TokyoNightPalette,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: palette.bg,
    panel: palette.bgDark,
    surface: palette.bgHighlight,
    border: palette.terminalBlack,
    focus: palette.blue,
    text: palette.fg,
    muted: palette.fgDark,
    dim: palette.comment,
    selection: palette.blue7,
    accent: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.cyan,
    scrollbar: palette.blue7,
    tag: palette.orange,
    branchLocal: palette.magenta,
    branchRemote: palette.cyan,
    diffAdd: palette.green,
    diffRemove: palette.red,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: palette.comment,
    diffHunk: palette.blue,
    graph: Object.freeze([
      palette.blue,
      palette.magenta,
      palette.green1,
      palette.orange,
      palette.purple,
      palette.cyan,
    ]),
  });
}
