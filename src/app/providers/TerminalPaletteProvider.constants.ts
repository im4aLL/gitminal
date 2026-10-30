import { readUnavailableTerminalTheme } from "@/domain/theme/theme.terminal";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";

/**
 * Timeout for one terminal palette query, in milliseconds.
 *
 * The query runs once at startup, concurrently with the configuration load, so a terminal that never
 * answers costs at most this long. Detection is a nicety; the shell is what matters.
 */
export const TERMINAL_PALETTE_TIMEOUT_MS = 150;

/**
 * Hard bound for a renderer promise that never settles, in milliseconds.
 *
 * The renderer enforces its own timeout, so this outer bound only covers a native call that neither
 * resolves nor rejects. It is deliberately larger than the query timeout, so it can never truncate a
 * legitimate answer that arrives at the edge of the deadline.
 */
export const TERMINAL_PALETTE_HARD_TIMEOUT_MS = TERMINAL_PALETTE_TIMEOUT_MS * 2;

/** Reason published when no detection ran at all, for example in a test or embedding. */
const TERMINAL_PALETTE_NOT_DETECTED_REASON = "the terminal palette was not detected.";

/**
 * Detection outcome before any query ran.
 *
 * A test, an embedding, or a provider mounted without a startup snapshot reads this value, so a
 * configured `terminal` theme still degrades to the default theme with one warning instead of
 * throwing.
 */
export const NOT_DETECTED_TERMINAL_THEME: TerminalThemeResult = readUnavailableTerminalTheme(
  TERMINAL_PALETTE_NOT_DETECTED_REASON,
);
