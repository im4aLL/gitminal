import type { HexColor } from "./theme.types";

/** Channel values are normalized to this scale before gamma correction. */
const CHANNEL_MAX = 255;

/** Gamma break point below which the linear segment of the sRGB transfer function applies. */
const LINEAR_THRESHOLD = 0.03928;

/** Divisor of the linear segment. */
const LINEAR_DIVISOR = 12.92;

/** Offset of the gamma segment. */
const GAMMA_OFFSET = 0.055;

/** Divisor of the gamma segment. */
const GAMMA_DIVISOR = 1.055;

/** Exponent of the gamma segment. */
const GAMMA_EXPONENT = 2.4;

/** Relative luminance weight of the red channel. */
const RED_WEIGHT = 0.2126;

/** Relative luminance weight of the green channel. */
const GREEN_WEIGHT = 0.7152;

/** Relative luminance weight of the blue channel. */
const BLUE_WEIGHT = 0.0722;

/**
 * Computes the WCAG relative contrast ratio between two colors.
 *
 * Every built-in theme paints text and diff signs on top of a theme background, so a palette that
 * looks fine in a preview can still render an unreadable row. The ratio is the WCAG 2.1 definition:
 * relative luminance of the lighter color plus 0.05 over the darker color plus 0.05, ranging from 1
 * for two identical colors to 21 for black on white. The value is not rounded, so a caller compares
 * against its own threshold without a second rounding decision.
 *
 * @param foreground - Foreground color, usually text or a diff sign.
 * @param background - Background color the foreground is painted on.
 * @returns The contrast ratio from 1 to 21.
 */
export function contrastRatio(foreground: HexColor, background: HexColor): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Computes the WCAG relative luminance of one `#RRGGBB` color.
 *
 * The luminance is the shared brightness measure behind `contrastRatio` and the theme variant rule:
 * a user theme without an explicit `variant` is dark when its resolved background luminance is below
 * 0.5. Exporting the single implementation keeps a caller from re-deriving the sRGB coefficients.
 *
 * @param color - The color to evaluate.
 * @returns The relative luminance from 0 to 1.
 */
export function relativeLuminance(color: HexColor): number {
  return (
    RED_WEIGHT * readChannel(color, 1) +
    GREEN_WEIGHT * readChannel(color, 3) +
    BLUE_WEIGHT * readChannel(color, 5)
  );
}

/**
 * Reads one gamma-corrected sRGB channel.
 *
 * @param color - Source `#RRGGBB` color.
 * @param offset - Character offset of the two channel digits.
 * @returns The linearized channel value from 0 to 1.
 */
function readChannel(color: HexColor, offset: number): number {
  const value = Number.parseInt(color.slice(offset, offset + 2), 16) / CHANNEL_MAX;

  if (value <= LINEAR_THRESHOLD) {
    return value / LINEAR_DIVISOR;
  }

  return ((value + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
}
