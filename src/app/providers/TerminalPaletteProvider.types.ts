import type { TerminalColors } from "@opentui/core";
import type { ReactNode } from "react";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";
import type { ThemeColorCapability } from "@/domain/theme/theme.types";

/** Renderer surface the terminal palette query needs. */
export interface TerminalPaletteRenderer {
  /**
   * Detects the terminal's palette through OSC 4, 10, and 11.
   *
   * @param options - Query timeout and palette size.
   * @returns The detected colors, with `null` for every entry the terminal skipped.
   */
  getPalette(options?: { readonly timeout?: number }): Promise<TerminalColors>;
  /** Drops the renderer's cached palette so the next query re-reads the terminal. */
  clearPaletteCache(): void;
}

/** Inputs accepted by the terminal palette query. */
export interface QueryTerminalThemeOptions {
  /** Environment used for capability detection; defaults to the process environment. */
  readonly env?: Readonly<Record<string, string | undefined>>;
  /** Capability override used by tests; defaults to `detectColorCapability`. */
  readonly capability?: ThemeColorCapability;
}

/** Detects the palette and maps it onto a theme; injectable so tests skip the renderer. */
export type TerminalThemeDetect = () => Promise<TerminalThemeResult>;

/** Value exposed by `TerminalPaletteProvider`. */
export interface TerminalPaletteContextValue {
  /** Latest detection outcome, including the entry the theme layer may select. */
  readonly snapshot: TerminalThemeResult;
  /**
   * Re-reads the terminal palette and stores the outcome.
   *
   * It clears the renderer's palette cache first, so a terminal profile change is visible without a
   * restart. It never rejects: a failed re-detection stores an unavailable result instead.
   */
  readonly redetect: () => Promise<void>;
}

/** Props accepted by `TerminalPaletteProvider`. */
export interface TerminalPaletteProviderProps {
  /** Provider content. */
  readonly children?: ReactNode;
  /** Startup detection performed by the bootstrap before the first render. */
  readonly initialSnapshot?: TerminalThemeResult;
  /** Detection override used by tests; defaults to the renderer query. */
  readonly detect?: TerminalThemeDetect;
}
