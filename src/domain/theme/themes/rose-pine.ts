import type {
  HexColor,
  ThemeDefinition,
  ThemeName,
  ThemeTokens,
  ThemeVariant,
} from "../theme.types";

/**
 * The Rose Pine palette vocabulary shared by its three variants.
 *
 * Values come from `rose-pine/neovim`, `lua/rose-pine/palette.lua`, which tracks the published spec at
 * `rosepinetheme.com/palette` and is MIT licensed.
 */
interface RosePinePalette {
  /** Main background. */
  readonly base: HexColor;
  /** Panelled background. */
  readonly surface: HexColor;
  /** Raised row background. */
  readonly overlay: HexColor;
  /** Selected row background. */
  readonly highlightMed: HexColor;
  /** Border and scrollbar color. */
  readonly highlightHigh: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Secondary text. */
  readonly subtle: HexColor;
  /** Dim comment color. */
  readonly muted: HexColor;
  /** Accent iris. */
  readonly iris: HexColor;
  /** Error love. */
  readonly love: HexColor;
  /** Warning gold. */
  readonly gold: HexColor;
  /** Success pine. */
  readonly pine: HexColor;
  /** Informational foam. */
  readonly foam: HexColor;
  /** Tag rose. */
  readonly rose: HexColor;
}

/** One Rose Pine variant before its tokens are built. */
interface RosePineVariant {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Variant palette. */
  readonly palette: RosePinePalette;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** The three built-in Rose Pine variants in picker order. */
const ROSE_PINE_VARIANTS: readonly RosePineVariant[] = [
  {
    name: "rose-pine-main",
    label: "Rose Pine",
    variant: "dark",
    palette: Object.freeze({
      base: "#191724",
      surface: "#1f1d2e",
      overlay: "#26233a",
      highlightMed: "#403d52",
      highlightHigh: "#524f67",
      text: "#e0def4",
      subtle: "#908caa",
      muted: "#6e6a86",
      iris: "#c4a7e7",
      love: "#eb6f92",
      gold: "#f6c177",
      pine: "#31748f",
      foam: "#9ccfd8",
      rose: "#ebbcba",
    }),
    diffAddBackground: "#171520",
    diffRemoveBackground: "#362333",
  },
  {
    name: "rose-pine-moon",
    label: "Rose Pine Moon",
    variant: "dark",
    palette: Object.freeze({
      base: "#232136",
      surface: "#2a273f",
      overlay: "#393552",
      highlightMed: "#44415a",
      highlightHigh: "#56526e",
      text: "#e0def4",
      subtle: "#908caa",
      muted: "#6e6a86",
      iris: "#c4a7e7",
      love: "#eb6f92",
      gold: "#f6c177",
      pine: "#3e8fb0",
      foam: "#9ccfd8",
      rose: "#ea9a97",
    }),
    diffAddBackground: "#273047",
    diffRemoveBackground: "#3f2c43",
  },
  {
    name: "rose-pine-dawn",
    label: "Rose Pine Dawn",
    variant: "light",
    palette: Object.freeze({
      base: "#faf4ed",
      surface: "#fffaf3",
      overlay: "#f2e9e1",
      highlightMed: "#dfdad9",
      highlightHigh: "#cecacd",
      text: "#464261",
      subtle: "#797593",
      muted: "#9893a5",
      iris: "#907aa9",
      love: "#b4637a",
      gold: "#ea9d34",
      pine: "#286983",
      foam: "#56949f",
      rose: "#d7827e",
    }),
    diffAddBackground: "#dde1de",
    diffRemoveBackground: "#f0e0dd",
  },
];

/** Every Rose Pine definition, in picker order. */
export const ROSE_PINE_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  ROSE_PINE_VARIANTS.map(createDefinition),
);

/**
 * Builds one Rose Pine definition from its variant.
 *
 * @param variant - The variant definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(variant: RosePineVariant): ThemeDefinition {
  return Object.freeze({
    name: variant.name,
    label: variant.label,
    variant: variant.variant,
    tokens: createTokens(variant.palette, variant.diffAddBackground, variant.diffRemoveBackground),
  });
}

/**
 * Maps the Rose Pine palette onto the Gitminal token table.
 *
 * Dawn uses the darker `subtle` tone for secondary text, because the published `muted` tone does not
 * reach the enforced contrast floor on a light surface.
 *
 * @param palette - The variant palette.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  palette: RosePinePalette,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: palette.base,
    panel: palette.surface,
    surface: palette.overlay,
    border: palette.highlightMed,
    focus: palette.iris,
    text: palette.text,
    muted: palette.subtle,
    dim: palette.muted,
    selection: palette.highlightMed,
    accent: palette.iris,
    success: palette.pine,
    warning: palette.gold,
    error: palette.love,
    info: palette.foam,
    scrollbar: palette.highlightHigh,
    tag: palette.rose,
    branchLocal: palette.iris,
    branchRemote: palette.foam,
    diffAdd: palette.pine,
    diffRemove: palette.love,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: palette.muted,
    diffHunk: palette.iris,
    graph: Object.freeze([
      palette.iris,
      palette.foam,
      palette.rose,
      palette.gold,
      palette.pine,
      palette.love,
    ]),
  });
}
