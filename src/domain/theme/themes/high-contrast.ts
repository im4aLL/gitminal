import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The high contrast palette vocabulary.
 *
 * This family is not a port. It is Gitminal's own accessible pairing, built so that every enforced
 * contrast requirement clears its floor by a wide margin: pure black and white backgrounds, neutral
 * text that stays far above the AA floor, and saturated signal colors that remain distinguishable
 * without relying on hue alone.
 */
interface HighContrastPalette {
  /** Main background. */
  readonly background: HexColor;
  /** Panel background. */
  readonly panel: HexColor;
  /** Raised row background. */
  readonly surface: HexColor;
  /** Selected row background. */
  readonly selection: HexColor;
  /** Border and scrollbar color. */
  readonly border: HexColor;
  /** Focus and accent color. */
  readonly accent: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Secondary text. */
  readonly muted: HexColor;
  /** Dim text. */
  readonly dim: HexColor;
  /** Success color. */
  readonly success: HexColor;
  /** Warning color. */
  readonly warning: HexColor;
  /** Error color. */
  readonly error: HexColor;
  /** Info color. */
  readonly info: HexColor;
  /** Tag color. */
  readonly tag: HexColor;
  /** Secondary graph lane. */
  readonly lane: HexColor;
}

/** One high contrast theme before its tokens are built. */
interface HighContrastTheme {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Theme palette. */
  readonly palette: HighContrastPalette;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** The two built-in high contrast themes in picker order. */
const HIGH_CONTRAST_THEMES: readonly HighContrastTheme[] = [
  {
    name: "high-contrast-dark",
    label: "High Contrast Dark",
    variant: "dark",
    palette: Object.freeze({
      background: "#000000",
      panel: "#0a0a0a",
      surface: "#1a1a1a",
      selection: "#262626",
      border: "#6b6b6b",
      accent: "#ffd400",
      text: "#ffffff",
      muted: "#d0d0d0",
      dim: "#a0a0a0",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#ff6b6b",
      info: "#60a5fa",
      tag: "#ff9f43",
      lane: "#c084fc",
    }),
    diffAddBackground: "#040d08",
    diffRemoveBackground: "#0f0606",
  },
  {
    name: "high-contrast-light",
    label: "High Contrast Light",
    variant: "light",
    palette: Object.freeze({
      background: "#ffffff",
      panel: "#f4f4f4",
      surface: "#e8e8e8",
      selection: "#dcdcdc",
      border: "#767676",
      accent: "#0033cc",
      text: "#000000",
      muted: "#333333",
      dim: "#555555",
      success: "#0b4a1f",
      warning: "#6b4500",
      error: "#990019",
      info: "#0043a3",
      tag: "#a33d00",
      lane: "#6b21a8",
    }),
    diffAddBackground: "#f0f4f2",
    diffRemoveBackground: "#f9f0f1",
  },
];

/** Every high contrast definition, in picker order. */
export const HIGH_CONTRAST_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  HIGH_CONTRAST_THEMES.map(createDefinition),
);

/**
 * Builds one high contrast definition from its theme.
 *
 * @param theme - The theme definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(theme: HighContrastTheme): ThemeDefinition {
  return Object.freeze({
    name: theme.name,
    label: theme.label,
    variant: theme.variant,
    tokens: createTokens(theme),
  });
}

/**
 * Maps the high contrast palette onto the Gitminal token table.
 *
 * @param theme - The theme to map.
 * @returns The final, frozen token set.
 */
function createTokens(theme: HighContrastTheme): ThemeTokens {
  const { palette } = theme;

  return Object.freeze({
    background: palette.background,
    panel: palette.panel,
    surface: palette.surface,
    border: palette.border,
    focus: palette.accent,
    text: palette.text,
    muted: palette.muted,
    dim: palette.dim,
    selection: palette.selection,
    accent: palette.accent,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    scrollbar: palette.border,
    tag: palette.tag,
    branchLocal: palette.accent,
    branchRemote: palette.info,
    diffAdd: palette.success,
    diffRemove: palette.error,
    diffAddBackground: theme.diffAddBackground,
    diffRemoveBackground: theme.diffRemoveBackground,
    diffContext: palette.muted,
    diffHunk: palette.info,
    graph: Object.freeze([
      palette.accent,
      palette.success,
      palette.info,
      palette.tag,
      palette.lane,
      palette.warning,
    ]),
  });
}
