import { useRenderer } from "@opentui/react";
import { createContext, type ReactNode, useCallback, useMemo, useState } from "react";
import { NOT_DETECTED_TERMINAL_THEME } from "@/app/providers/TerminalPaletteProvider.constants";
import type {
  TerminalPaletteContextValue,
  TerminalPaletteProviderProps,
} from "@/app/providers/TerminalPaletteProvider.types";
import { queryTerminalTheme } from "@/app/providers/terminal.palette";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";

/** Context carrying the detected terminal palette. */
export const TerminalPaletteContext = createContext<TerminalPaletteContextValue | null>(null);

/**
 * Owns the detected terminal palette and its re-detection.
 *
 * The bootstrap performs the startup query before the first render, concurrently with the
 * configuration load, and passes the result down as `initialSnapshot`. That ordering is what keeps
 * the app from painting the default theme and then switching: the first frame already resolves the
 * configured `terminal` name against the detected colors.
 *
 * The provider sits above `ThemeProvider`, so the theme layer reads the snapshot through context
 * instead of a prop drilled through the shell. `redetect` clears the renderer's palette cache first,
 * because detection happens once otherwise and switching the terminal profile mid-session would
 * leave the app on stale colors.
 *
 * @param props - Startup snapshot, detection override, and provider content.
 * @returns The terminal palette context provider.
 */
export function TerminalPaletteProvider(props: TerminalPaletteProviderProps): ReactNode {
  const renderer = useRenderer();
  const detect = props.detect;
  const [snapshot, setSnapshot] = useState<TerminalThemeResult>(
    () => props.initialSnapshot ?? NOT_DETECTED_TERMINAL_THEME,
  );

  /** Clears the cached palette, re-detects, and stores the outcome. */
  const redetect = useCallback(async (): Promise<void> => {
    renderer.clearPaletteCache();

    const next = detect === undefined ? await queryTerminalTheme(renderer) : await detect();

    setSnapshot(next);
  }, [detect, renderer]);

  const value = useMemo<TerminalPaletteContextValue>(
    () => ({ snapshot, redetect }),
    [redetect, snapshot],
  );

  return (
    <TerminalPaletteContext.Provider value={value}>
      {props.children}
    </TerminalPaletteContext.Provider>
  );
}
