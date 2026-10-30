import {
  TERMINAL_PALETTE_HARD_TIMEOUT_MS,
  TERMINAL_PALETTE_TIMEOUT_MS,
} from "@/app/providers/TerminalPaletteProvider.constants";
import type {
  QueryTerminalThemeOptions,
  TerminalPaletteRenderer,
} from "@/app/providers/TerminalPaletteProvider.types";
import { detectColorCapability } from "@/domain/theme/theme.capability";
import { readTerminalTheme, readUnavailableTerminalTheme } from "@/domain/theme/theme.terminal";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";

/** Reason published when the detected capability has no color at all. */
const MONOCHROME_REASON = "the terminal reports no color support (monochrome or NO_COLOR).";

/**
 * Detects the terminal palette and maps it onto a theme.
 *
 * Detection goes through `renderer.getPalette()`, which sends the OSC 4 palette queries and the OSC
 * 10 and 11 default foreground and background queries. The app never writes an escape sequence and
 * never reads stdin itself, so OpenTUI keeps ownership of the terminal and filters its own responses
 * out of the input stream.
 *
 * The query is skipped entirely when the detected capability is `monochrome`, which also covers
 * `NO_COLOR`, because there is nothing to gain from reading a palette the app will not paint. A
 * thrown error, a timeout, and a gated response all resolve to one unavailable result instead of
 * rejecting: the caller is startup, and a terminal that cannot answer must never fail the launch.
 *
 * @param renderer - Renderer that performs the query.
 * @param options - Environment and capability overrides used by tests.
 * @returns The detected entry, or the one reason detection was unavailable.
 */
export async function queryTerminalTheme(
  renderer: TerminalPaletteRenderer,
  options: QueryTerminalThemeOptions = {},
): Promise<TerminalThemeResult> {
  const capability = options.capability ?? detectColorCapability({ env: options.env });

  if (capability === "monochrome") {
    return readUnavailableTerminalTheme(MONOCHROME_REASON);
  }

  try {
    const colors = await withTimeout(
      renderer.getPalette({ timeout: TERMINAL_PALETTE_TIMEOUT_MS }),
      TERMINAL_PALETTE_HARD_TIMEOUT_MS,
    );

    return readTerminalTheme({
      palette: colors.palette,
      defaultForeground: colors.defaultForeground,
      defaultBackground: colors.defaultBackground,
    });
  } catch (error) {
    return readUnavailableTerminalTheme(`the palette query failed: ${readFailureMessage(error)}`);
  }
}

/**
 * Bounds a renderer promise that may never settle.
 *
 * The renderer enforces its own timeout, so this only covers a native call that neither resolves nor
 * rejects. The wrapper clears its timer on both outcomes, so a settled query leaves no pending timer
 * behind.
 *
 * @param promise - Query promise to bound.
 * @param timeoutMs - Hard bound in milliseconds.
 * @returns The query result.
 * @throws When the bound elapses first.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`timed out after ${timeoutMs} ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Reads a single-line failure message.
 *
 * @param error - Thrown value from the query.
 * @returns The message with newlines flattened, so it fits one warning line.
 */
function readFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.replaceAll("\n", " ");
}
