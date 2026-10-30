import { useContext } from "react";
import { TerminalPaletteContext } from "@/app/providers/TerminalPaletteProvider";
import { NOT_DETECTED_TERMINAL_THEME } from "@/app/providers/TerminalPaletteProvider.constants";
import type { TerminalPaletteContextValue } from "@/app/providers/TerminalPaletteProvider.types";

/**
 * Value read by a tree that mounts no `TerminalPaletteProvider`.
 *
 * The palette is a detected capability rather than required state, so its absence is a normal
 * outcome instead of a programming error: the theme layer resolves Native Terminal to the default
 * theme with one warning naming the missing detection, which is the same fail-closed shape a
 * terminal that cannot answer gets. `redetect` has nothing to re-read.
 */
const DETACHED_TERMINAL_PALETTE: TerminalPaletteContextValue = Object.freeze({
  snapshot: NOT_DETECTED_TERMINAL_THEME,
  redetect: (): Promise<void> => Promise.resolve(),
});

/**
 * Reads the detected terminal palette and its re-detection.
 *
 * `ThemeProvider` consumes the snapshot, and the configuration reload hook consumes `redetect`, so
 * both read one provider instead of keeping a second copy of the detection result. A tree without the
 * provider, such as a theme-only test harness or an embedding, reads the not-detected snapshot
 * described above rather than throwing.
 *
 * @returns The terminal palette context value.
 */
export function useTerminalPalette(): TerminalPaletteContextValue {
  return useContext(TerminalPaletteContext) ?? DETACHED_TERMINAL_PALETTE;
}
