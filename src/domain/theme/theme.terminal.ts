import { contrastRatio, deriveThemeVariant } from "./theme.contrast";
import { isHexColor } from "./theme.override";
import { DEFAULT_THEME_NAME } from "./theme.registry";
import { blendColors } from "./theme.terminal.color";
import type {
  AnsiPalette,
  DetectedTerminalPalette,
  DiffBackground,
  TerminalResolution,
  TerminalThemeResult,
} from "./theme.terminal.types";
import type { HexColor, ThemeTokens } from "./theme.types";

/** Catalogue identity of the detected pseudo-theme. */
export const TERMINAL_THEME_NAME = "terminal";

/** Display name of the detected pseudo-theme. */
export const TERMINAL_THEME_LABEL = "Native Terminal";

/**
 * Identity used when Native Terminal is exported to a user theme file.
 *
 * `terminal` itself stays reserved for the detected entry, so the exported file needs a real,
 * non-reserved name that a later `config.json` value can select.
 */
export const TERMINAL_EXPORT_NAME = "native-terminal";

/** Number of ANSI palette entries the mapping needs. */
const ANSI_PALETTE_SIZE = 16;

/** Contrast floor secondary text must clear against the background. */
const SECONDARY_CONTRAST_FLOOR = 3;

/** Contrast floor a diff line background must clear for the primary text. */
const DIFF_BACKGROUND_CONTRAST_FLOOR = 3;

/** Fraction of the foreground mixed into the background for the panel surface. */
const PANEL_BLEND = 0.04;

/** Fraction of the foreground mixed into the background for a raised surface. */
const SURFACE_BLEND = 0.08;

/** Fraction of the foreground mixed into the background for a selected row. */
const SELECTION_BLEND = 0.14;

/** Smallest tint mixed into the background for a diff line background. */
const DIFF_BACKGROUND_BLEND = 0.16;

/** Largest tint mixed into the background for a diff line background. */
const DIFF_BACKGROUND_LIMIT = 0.56;

/** Tint step used while searching a diff line background for its contrast floor. */
const DIFF_BACKGROUND_STEP = 0.04;

/** ANSI indices the graph lanes use, in lane order. */
const GRAPH_ANSI_INDICES = Object.freeze([4, 2, 3, 1, 6, 5, 7, 8] as const);

/** One-line note published when secondary text had to be raised to the foreground color. */
const SECONDARY_ADJUSTED_WARNING =
  "Native Terminal: secondary text uses the default foreground because part of the terminal gray palette was too low contrast.";

/** Reason published when the terminal did not answer the default-background query. */
const MISSING_BACKGROUND_REASON = "the terminal did not report a default background (OSC 11).";

/** Reason published when the terminal did not answer every palette query. */
const MISSING_PALETTE_REASON = "the terminal did not report all 16 ANSI colors (OSC 4).";

/** One-line note published when a diff line background could not reach its contrast floor. */
const DIFF_BACKGROUND_WARNING =
  "Native Terminal: the diff line backgrounds cannot reach the 3.0 contrast floor for this scheme.";

/**
 * Maps a detected terminal palette onto a complete theme entry.
 *
 * The terminal is the source of truth: `defaultBackground` becomes `background`, the default
 * foreground becomes `text`, and the sixteen ANSI colors supply the accents, statuses, borders, and
 * graph lanes. `defaultBackground` is the hard gate because it decides light versus dark, and the
 * gate also requires all sixteen ANSI entries, so a scheme is either mapped completely or declined
 * with one reason. `variant` is derived from the detected background luminance, which places a light
 * terminal scheme in the Light tab without a special case.
 *
 * Two mapped values are guarded rather than copied. Secondary text prefers ANSI 7 and 8, which scheme
 * authors set aside for secondary text, but falls back to the default foreground when the contrast
 * against the background drops below 3.0, so unreadable gray is never emitted. Diff line backgrounds
 * blend from the background toward ANSI 2 and 1 and search the tint from its largest value downward,
 * so the first blend whose primary text clears 3.0 wins; a scheme where no tint reaches the floor
 * keeps the smallest tint and reports one warning.
 *
 * @param palette - Detected palette values from `renderer.getPalette()`.
 * @returns The complete catalogue entry, or the reason it is unavailable plus any notes.
 */
export function readTerminalTheme(palette: DetectedTerminalPalette): TerminalThemeResult {
  const background = readColor(palette.defaultBackground);

  if (background === null) {
    return readUnavailableTerminalTheme(MISSING_BACKGROUND_REASON);
  }

  const ansi = readAnsiPalette(palette.palette);

  if (ansi === null) {
    return readUnavailableTerminalTheme(MISSING_PALETTE_REASON);
  }

  const [, red, green, yellow, blue, , cyan, white, brightBlack] = ansi;
  const text = readColor(palette.defaultForeground) ?? white;
  const muted = readSecondary(white, text, background);
  const dim = readSecondary(brightBlack, text, background);
  const diffAdd = readDiffBackground(background, green, text);
  const diffRemove = readDiffBackground(background, red, text);
  const warnings: string[] = [];

  if (muted !== white || dim !== brightBlack) {
    warnings.push(SECONDARY_ADJUSTED_WARNING);
  }

  if (!diffAdd.reachedFloor || !diffRemove.reachedFloor) {
    warnings.push(DIFF_BACKGROUND_WARNING);
  }

  const tokens: ThemeTokens = Object.freeze({
    background,
    panel: blendColors(background, text, PANEL_BLEND),
    surface: blendColors(background, text, SURFACE_BLEND),
    selection: blendColors(background, text, SELECTION_BLEND),
    border: brightBlack,
    focus: blue,
    text,
    muted,
    dim,
    accent: blue,
    success: green,
    warning: yellow,
    error: red,
    info: cyan,
    scrollbar: brightBlack,
    tag: yellow,
    branchLocal: green,
    branchRemote: blue,
    diffAdd: green,
    diffRemove: red,
    diffAddBackground: diffAdd.color,
    diffRemoveBackground: diffRemove.color,
    diffContext: white,
    diffHunk: blue,
    graph: Object.freeze(readGraphLanes(ansi)),
  });

  return Object.freeze({
    entry: Object.freeze({
      name: TERMINAL_THEME_NAME,
      label: TERMINAL_THEME_LABEL,
      variant: deriveThemeVariant(background),
      tokens,
      source: "terminal" as const,
    }),
    reason: null,
    warnings: Object.freeze(warnings),
  });
}

/**
 * Reads the theme name and warnings a requested theme produces when it is Native Terminal.
 *
 * Detection is a startup concern, so the identifier stays unavailable whenever the terminal did not
 * answer. A configured `terminal` then resolves to the default theme with exactly one warning naming
 * the detection reason, which is the same fail-closed shape as an unknown theme name. Any other
 * requested name is passed through untouched and without warnings.
 *
 * @param requestedName - Theme name the session wants to render.
 * @param result - Detected palette outcome the provider holds.
 * @returns The name to resolve plus the warnings to publish.
 */
export function readTerminalResolution(
  requestedName: string,
  result: TerminalThemeResult,
): TerminalResolution {
  if (requestedName !== TERMINAL_THEME_NAME) {
    return { name: requestedName, warnings: [] };
  }

  if (result.entry !== null) {
    return { name: TERMINAL_THEME_NAME, warnings: [] };
  }

  const reason = result.reason ?? "the palette query failed";

  return {
    name: DEFAULT_THEME_NAME,
    warnings: [`Native Terminal is unavailable: ${reason}`],
  };
}

/**
 * Reports whether a theme name is reserved for a detected entry.
 *
 * A user theme file may not claim the Native Terminal identity, because the detected entry occupies
 * that name whenever the terminal answers. The exported copy of the detected scheme uses
 * `TERMINAL_EXPORT_NAME` instead.
 *
 * @param name - Candidate theme name.
 * @returns True when the name belongs to the terminal pseudo-theme.
 */
export function isReservedThemeName(name: string): boolean {
  return name === TERMINAL_THEME_NAME;
}

/**
 * Builds an unavailable result with one reason.
 *
 * The palette query uses this for the failures that happen before mapping, so every failure path
 * publishes the same shape: no entry, one reason, no notes.
 *
 * @param reason - One-line reason the entry could not be built.
 * @returns The gated-out result.
 */
export function readUnavailableTerminalTheme(reason: string): TerminalThemeResult {
  return Object.freeze({
    entry: null,
    reason,
    warnings: Object.freeze([]),
  });
}

/**
 * Reads one detected color value.
 *
 * @param raw - Raw value from the renderer response.
 * @returns The validated color, or `null` when the terminal did not answer with a color.
 */
function readColor(raw: string | null | undefined): HexColor | null {
  return isHexColor(raw) ? raw : null;
}

/**
 * Reads and validates the sixteen ANSI palette entries.
 *
 * Each of the sixteen reads is validated before the tuple is built, so the function returns either a
 * complete tuple or `null`. Reading them into named locals is what lets the tuple be constructed
 * directly instead of casting a list into one.
 *
 * @param raw - Raw palette entries from the renderer response.
 * @returns The fixed sixteen-color tuple, or `null` when any entry is missing.
 */
function readAnsiPalette(raw: readonly (string | null)[]): AnsiPalette | null {
  if (raw.length < ANSI_PALETTE_SIZE) {
    return null;
  }

  const ansi0 = readColor(raw[0]);
  const ansi1 = readColor(raw[1]);
  const ansi2 = readColor(raw[2]);
  const ansi3 = readColor(raw[3]);
  const ansi4 = readColor(raw[4]);
  const ansi5 = readColor(raw[5]);
  const ansi6 = readColor(raw[6]);
  const ansi7 = readColor(raw[7]);
  const ansi8 = readColor(raw[8]);
  const ansi9 = readColor(raw[9]);
  const ansi10 = readColor(raw[10]);
  const ansi11 = readColor(raw[11]);
  const ansi12 = readColor(raw[12]);
  const ansi13 = readColor(raw[13]);
  const ansi14 = readColor(raw[14]);
  const ansi15 = readColor(raw[15]);

  if (
    ansi0 === null ||
    ansi1 === null ||
    ansi2 === null ||
    ansi3 === null ||
    ansi4 === null ||
    ansi5 === null ||
    ansi6 === null ||
    ansi7 === null ||
    ansi8 === null ||
    ansi9 === null ||
    ansi10 === null ||
    ansi11 === null ||
    ansi12 === null ||
    ansi13 === null ||
    ansi14 === null ||
    ansi15 === null
  ) {
    return null;
  }

  const palette: AnsiPalette = [
    ansi0,
    ansi1,
    ansi2,
    ansi3,
    ansi4,
    ansi5,
    ansi6,
    ansi7,
    ansi8,
    ansi9,
    ansi10,
    ansi11,
    ansi12,
    ansi13,
    ansi14,
    ansi15,
  ];

  return Object.freeze(palette);
}

/**
 * Reads the graph lane colors in lane order.
 *
 * @param ansi - Validated ANSI palette.
 * @returns The lane colors, one per documented ANSI index.
 */
function readGraphLanes(ansi: AnsiPalette): readonly HexColor[] {
  return GRAPH_ANSI_INDICES.map((index) => ansi[index]);
}

/**
 * Reads one secondary text color with a contrast guard.
 *
 * @param preferred - ANSI color the scheme author set aside for secondary text.
 * @param text - Default foreground, used when the preferred color is unreadable.
 * @param background - Detected background.
 * @returns The preferred color, or the foreground when it is below the floor.
 */
function readSecondary(preferred: HexColor, text: HexColor, background: HexColor): HexColor {
  return contrastRatio(preferred, background) >= SECONDARY_CONTRAST_FLOOR ? preferred : text;
}

/**
 * Builds one diff line background that keeps the primary text readable.
 *
 * The search runs from the largest tint down to the smallest, and the first blend whose text clears
 * the floor wins. That order returns the most visible tint that still keeps the text readable. A dark
 * scheme with light text is the common case: tinting the background toward ANSI green or red raises
 * its luminance, so contrast with the text only falls as the tint grows, and the search settles on
 * the smallest tint that clears the floor. A scheme whose text nearly matches its background cannot
 * be repaired by tinting at all, so the minimum tint is returned with `reachedFloor: false` and
 * `readTerminalTheme` publishes one note.
 *
 * @param background - Detected background.
 * @param tint - Added or removed ANSI color the row is tinted toward.
 * @param text - Default foreground painted on top of the row.
 * @returns The chosen background and whether it cleared the floor.
 */
function readDiffBackground(background: HexColor, tint: HexColor, text: HexColor): DiffBackground {
  const steps = Math.round((DIFF_BACKGROUND_LIMIT - DIFF_BACKGROUND_BLEND) / DIFF_BACKGROUND_STEP);

  for (let step = steps; step >= 0; step -= 1) {
    const color = blendColors(
      background,
      tint,
      DIFF_BACKGROUND_BLEND + step * DIFF_BACKGROUND_STEP,
    );

    if (contrastRatio(text, color) >= DIFF_BACKGROUND_CONTRAST_FLOOR) {
      return { color, reachedFloor: true };
    }
  }

  return {
    color: blendColors(background, tint, DIFF_BACKGROUND_BLEND),
    reachedFloor: false,
  };
}
