import type { HexColor, ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Gruvbox palette vocabulary.
 *
 * Values come from `morhetz/gruvbox`, `colors/gruvbox.vim`, using the medium-contrast backgrounds and
 * the bright accents for the dark theme and the faded accents for the light theme, which is the
 * pairing the upstream colorscheme itself selects.
 */
interface GruvboxPalette {
  /** Main background. */
  readonly bg0: HexColor;
  /** Soft background used for panels. */
  readonly bgSoft: HexColor;
  /** Raised row background. */
  readonly bg1: HexColor;
  /** Selected row background. */
  readonly bg2: HexColor;
  /** Border and structural line color. */
  readonly bg3: HexColor;
  /** Primary text. */
  readonly fg1: HexColor;
  /** Secondary text. */
  readonly fg3: HexColor;
  /** Dim comment color. */
  readonly gray: HexColor;
  /** Focus and accent orange. */
  readonly orange: HexColor;
  /** Success green. */
  readonly green: HexColor;
  /** Warning yellow. */
  readonly yellow: HexColor;
  /** Error red. */
  readonly red: HexColor;
  /** Informational blue. */
  readonly blue: HexColor;
  /** Branch purple. */
  readonly purple: HexColor;
  /** Teal graph lane. */
  readonly aqua: HexColor;
}

/** Every Gruvbox definition, in picker order. */
export const GRUVBOX_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze([
  createDark(),
  createLight(),
]);

/**
 * Builds the dark definition.
 *
 * @returns The frozen dark definition.
 */
function createDark(): ThemeDefinition {
  const palette: GruvboxPalette = Object.freeze({
    bg0: "#282828",
    bgSoft: "#32302f",
    bg1: "#3c3836",
    bg2: "#504945",
    bg3: "#665c54",
    fg1: "#ebdbb2",
    fg3: "#bdae93",
    gray: "#928374",
    orange: "#fe8019",
    green: "#b8bb26",
    yellow: "#fabd2f",
    red: "#fb4934",
    blue: "#83a598",
    purple: "#d3869b",
    aqua: "#8ec07c",
  });

  return Object.freeze({
    name: "gruvbox-dark",
    label: "Gruvbox Dark",
    variant: "dark",
    tokens: createTokens(palette, "#3c3d28", "#462d2a"),
  });
}

/**
 * Builds the light definition.
 *
 * @returns The frozen light definition.
 */
function createLight(): ThemeDefinition {
  const palette: GruvboxPalette = Object.freeze({
    bg0: "#fbf1c7",
    bgSoft: "#f2e5bc",
    bg1: "#ebdbb2",
    bg2: "#d5c4a1",
    bg3: "#bdae93",
    fg1: "#282828",
    fg3: "#504945",
    gray: "#7c6f64",
    orange: "#af3a03",
    green: "#79740e",
    yellow: "#b57614",
    red: "#9d0006",
    blue: "#076678",
    purple: "#8f3f71",
    aqua: "#427b58",
  });

  return Object.freeze({
    name: "gruvbox-light",
    label: "Gruvbox Light",
    variant: "light",
    tokens: createTokens(palette, "#e9e0ad", "#eecfac"),
  });
}

/**
 * Maps the Gruvbox palette onto the Gitminal token table.
 *
 * @param palette - The palette to map.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  palette: GruvboxPalette,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: palette.bg0,
    panel: palette.bgSoft,
    surface: palette.bg1,
    border: palette.bg2,
    focus: palette.orange,
    text: palette.fg1,
    muted: palette.fg3,
    dim: palette.gray,
    selection: palette.bg2,
    accent: palette.orange,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.blue,
    scrollbar: palette.bg3,
    tag: palette.orange,
    branchLocal: palette.purple,
    branchRemote: palette.blue,
    diffAdd: palette.green,
    diffRemove: palette.red,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: palette.gray,
    diffHunk: palette.blue,
    graph: Object.freeze([
      palette.red,
      palette.green,
      palette.yellow,
      palette.blue,
      palette.purple,
      palette.aqua,
    ]),
  });
}
