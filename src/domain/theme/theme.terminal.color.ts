import type { HexColor } from "./theme.types";

/** Radix used to read and rebuild one `#RRGGBB` channel. */
const HEX_RADIX = 16;

/** Width of one rebuilt hex channel. */
const HEX_CHANNEL_WIDTH = 2;

/** Channel value used to clamp a blended color. */
const CHANNEL_MAX = 255;

/**
 * Blends one color toward another.
 *
 * This is the generic sRGB mixing the Native Terminal mapping uses to derive `panel`, `surface`,
 * `selection`, and the diff line backgrounds. It stays beside the terminal reader rather than in
 * `theme.contrast.ts`, because contrast is a measurement while this module only mixes channels; a
 * second real consumer is the trigger for moving it next to the contrast math.
 *
 * @param from - Base color.
 * @param to - Color mixed in.
 * @param ratio - Mixing fraction from zero to one.
 * @returns The blended color.
 */
export function blendColors(from: HexColor, to: HexColor, ratio: number): HexColor {
  const source = readChannels(from);
  const target = readChannels(to);

  return formatColor(
    mixChannel(source[0], target[0], ratio),
    mixChannel(source[1], target[1], ratio),
    mixChannel(source[2], target[2], ratio),
  );
}

/**
 * Mixes one color channel.
 *
 * @param from - Base channel value.
 * @param to - Mixed-in channel value.
 * @param ratio - Mixing fraction from zero to one.
 * @returns The rounded channel value.
 */
function mixChannel(from: number, to: number, ratio: number): number {
  return Math.round(from + (to - from) * ratio);
}

/**
 * Reads the three channels of a validated color.
 *
 * @param color - Validated `#RRGGBB` color.
 * @returns The red, green, and blue channel values.
 */
function readChannels(color: HexColor): readonly [number, number, number] {
  return [
    Number.parseInt(color.slice(1, 3), HEX_RADIX),
    Number.parseInt(color.slice(3, 5), HEX_RADIX),
    Number.parseInt(color.slice(5, 7), HEX_RADIX),
  ];
}

/**
 * Formats three channel values as one color.
 *
 * @param red - Red channel value.
 * @param green - Green channel value.
 * @param blue - Blue channel value.
 * @returns The `#RRGGBB` color.
 */
function formatColor(red: number, green: number, blue: number): HexColor {
  const value = [red, green, blue].map(formatChannel).join("");

  return `#${value}` as HexColor;
}

/**
 * Formats one channel value as two lowercase hex digits.
 *
 * @param value - Channel value, clamped into the byte range.
 * @returns The two-digit channel text.
 */
function formatChannel(value: number): string {
  const clamped = Math.min(CHANNEL_MAX, Math.max(0, value));

  return clamped.toString(HEX_RADIX).padStart(HEX_CHANNEL_WIDTH, "0");
}
