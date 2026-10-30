import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Solarized palette vocabulary shared by its dark and light themes.
 *
 * Values come from the official Solarized palette: base03 to base3 plus the eight accent colors as
 * published in `altercation/solarized`. Solarized is a deliberately low-contrast scheme, so the
 * themes use the more legible member of each base pair for body text: base1 on dark and base01 on
 * light. Both are official colors; only the assignment differs from the upstream editor default,
 * because the enforced contrast floor is higher than Solarized's own body-text pairing.
 */
interface SolarizedPalette {
  /** Main background. */
  readonly background: HexColor;
  /** Panel background. */
  readonly panel: HexColor;
  /** Raised row background. */
  readonly surface: HexColor;
  /** Selected row background. */
  readonly selection: HexColor;
  /** Border color. */
  readonly border: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Secondary text. */
  readonly textMuted: HexColor;
  /** Dim comment text. */
  readonly textDim: HexColor;
  /** Yellow warning color. */
  readonly yellow: HexColor;
  /** Orange tag color. */
  readonly orange: HexColor;
  /** Red error color. */
  readonly red: HexColor;
  /** Magenta graph lane. */
  readonly magenta: HexColor;
  /** Violet branch color. */
  readonly violet: HexColor;
  /** Blue accent color. */
  readonly blue: HexColor;
  /** Cyan info color. */
  readonly cyan: HexColor;
  /** Green success color. */
  readonly green: HexColor;
}

/** One Solarized theme before its tokens are built. */
interface SolarizedTheme {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Theme palette. */
  readonly palette: SolarizedPalette;
  /** Added-line sign color. */
  readonly diffAdd: HexColor;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/**
 * The two built-in Solarized themes in picker order.
 *
 * The Light theme's added-line sign uses the official green hue four points darker, because the
 * published green cannot reach the enforced 3:1 diff-sign floor on Solarized's paper background.
 */
const SOLARIZED_THEMES: readonly SolarizedTheme[] = [
  {
    name: "solarized-dark",
    label: "Solarized Dark",
    variant: "dark",
    palette: Object.freeze({
      background: "#002b36",
      panel: "#002b36",
      surface: "#073642",
      selection: "#073642",
      border: "#586e75",
      text: "#93a1a1",
      textMuted: "#839496",
      textDim: "#586e75",
      yellow: "#b58900",
      orange: "#cb4b16",
      red: "#dc322f",
      magenta: "#d33682",
      violet: "#6c71c4",
      blue: "#268bd2",
      cyan: "#2aa198",
      green: "#859900",
    }),
    diffAdd: "#859900",
    diffAddBackground: "#083233",
    diffRemoveBackground: "#0d2b36",
  },
  {
    name: "solarized-light",
    label: "Solarized Light",
    variant: "light",
    palette: Object.freeze({
      background: "#fdf6e3",
      panel: "#fdf6e3",
      surface: "#fdf6e3",
      selection: "#eee8d5",
      border: "#93a1a1",
      text: "#586e75",
      textMuted: "#657b83",
      textDim: "#93a1a1",
      yellow: "#b58900",
      orange: "#cb4b16",
      red: "#dc322f",
      magenta: "#d33682",
      violet: "#6c71c4",
      blue: "#268bd2",
      cyan: "#2aa198",
      green: "#859900",
    }),
    diffAdd: "#738500",
    diffAddBackground: "#f5efd5",
    diffRemoveBackground: "#fbead8",
  },
];

/** Every Solarized definition, in picker order. */
export const SOLARIZED_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  SOLARIZED_THEMES.map(createDefinition),
);

/**
 * Builds one Solarized definition from its theme.
 *
 * @param theme - The theme definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(theme: SolarizedTheme): ThemeDefinition {
  return Object.freeze({
    name: theme.name,
    label: theme.label,
    variant: theme.variant,
    tokens: createTokens(theme),
  });
}

/**
 * Maps the Solarized palette onto the Gitminal token table.
 *
 * @param theme - The theme to map.
 * @returns The final, frozen token set.
 */
function createTokens(theme: SolarizedTheme): ThemeTokens {
  const { palette } = theme;

  return Object.freeze({
    background: palette.background,
    panel: palette.panel,
    surface: palette.surface,
    border: palette.border,
    focus: palette.blue,
    text: palette.text,
    muted: palette.textMuted,
    dim: palette.textDim,
    selection: palette.selection,
    accent: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.blue,
    scrollbar: palette.border,
    tag: palette.orange,
    branchLocal: palette.violet,
    branchRemote: palette.cyan,
    diffAdd: theme.diffAdd,
    diffRemove: palette.red,
    diffAddBackground: theme.diffAddBackground,
    diffRemoveBackground: theme.diffRemoveBackground,
    diffContext: palette.textDim,
    diffHunk: palette.blue,
    graph: Object.freeze([
      palette.blue,
      palette.violet,
      palette.cyan,
      palette.green,
      palette.magenta,
      palette.orange,
    ]),
  });
}
