import type { MonochromePalette } from "./theme.types";

/** Readable two-tone palette used when the terminal has no usable color. */
const MONO_DARK_PALETTE: MonochromePalette = Object.freeze({
  background: "#000000",
  surface: "#1f1f1f",
  border: "#6a6a6a",
  focus: "#ffffff",
  text: "#ffffff",
  muted: "#a8a8a8",
  dim: "#8a8a8a",
  selection: "#2f2f2f",
});

/** Readable two-tone palette used by light themes without color support. */
const MONO_LIGHT_PALETTE: MonochromePalette = Object.freeze({
  background: "#ffffff",
  surface: "#f2f2f2",
  border: "#8f8f8f",
  focus: "#000000",
  text: "#000000",
  muted: "#7a7a7a",
  dim: "#a8a8a8",
  selection: "#e0e0e0",
});

/** The monochrome palettes, keyed by light or dark variant. */
export const MONO_PALETTES: Readonly<Record<"dark" | "light", MonochromePalette>> = Object.freeze({
  dark: MONO_DARK_PALETTE,
  light: MONO_LIGHT_PALETTE,
});
