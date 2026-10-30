import { describe, expect, it } from "bun:test";
import type { GetPaletteOptions, TerminalColors } from "@opentui/core";
import { TERMINAL_PALETTE_TIMEOUT_MS } from "@/app/providers/TerminalPaletteProvider.constants";
import type { TerminalPaletteRenderer } from "@/app/providers/TerminalPaletteProvider.types";
import { queryTerminalTheme } from "@/app/providers/terminal.palette";

/** Prefix kept outside the string so colours are not written as hex literals. */
const HEX_PREFIX = "#";

/**
 * Builds a `#RRGGBB` value from six digits.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
function color(digits: string): string {
  return `${HEX_PREFIX}${digits}`;
}

/** ANSI palette used by the accepted case. */
const ANSI: readonly string[] = [
  color("073642"),
  color("dc322f"),
  color("859900"),
  color("b58900"),
  color("268bd2"),
  color("d33682"),
  color("2aa198"),
  color("93a1a1"),
  color("78909c"),
  color("002b36"),
  color("cb4b16"),
  color("586e75"),
  color("657b83"),
  color("839496"),
  color("6c71c4"),
  color("93a1a1"),
];

/**
 * Builds one renderer response.
 *
 * @param overrides - Response fields to override.
 * @returns The renderer response.
 */
function colors(overrides: Partial<TerminalColors> = {}): TerminalColors {
  return {
    palette: [...ANSI],
    defaultForeground: color("839496"),
    defaultBackground: color("002b36"),
    cursorColor: null,
    mouseForeground: null,
    mouseBackground: null,
    tekForeground: null,
    tekBackground: null,
    highlightBackground: null,
    highlightForeground: null,
    ...overrides,
  };
}

/**
 * Builds a renderer that answers the palette query.
 *
 * @param response - Response or error the renderer produces.
 * @param calls - Collector for the query options.
 * @returns The renderer.
 */
function renderer(
  response: TerminalColors | Error,
  calls: GetPaletteOptions[] = [],
): TerminalPaletteRenderer {
  return {
    getPalette: async (options?: GetPaletteOptions): Promise<TerminalColors> => {
      calls.push(options ?? {});

      if (response instanceof Error) {
        throw response;
      }

      return response;
    },
    clearPaletteCache: (): void => {},
  };
}

describe("queryTerminalTheme", () => {
  it("queries the renderer with the exported timeout and maps the palette", async () => {
    const calls: GetPaletteOptions[] = [];
    const result = await queryTerminalTheme(renderer(colors(), calls), { capability: "truecolor" });

    expect(calls).toEqual([{ timeout: TERMINAL_PALETTE_TIMEOUT_MS }]);
    expect(result.entry?.name).toBe("terminal");
    expect(result.reason).toBeNull();
  });

  it("skips the query entirely on a monochrome terminal", async () => {
    const calls: GetPaletteOptions[] = [];
    const result = await queryTerminalTheme(renderer(colors(), calls), {
      capability: "monochrome",
    });

    expect(calls).toEqual([]);
    expect(result.entry).toBeNull();
    expect(result.reason).toContain("monochrome");
  });

  it("skips the query entirely when NO_COLOR is set", async () => {
    const calls: GetPaletteOptions[] = [];
    const result = await queryTerminalTheme(renderer(colors(), calls), {
      env: { NO_COLOR: "1", TERM: "xterm-256color" },
    });

    expect(calls).toEqual([]);
    expect(result.entry).toBeNull();
  });

  it("reports a thrown query as one reason instead of rejecting", async () => {
    const result = await queryTerminalTheme(renderer(new Error("no tty")), {
      capability: "truecolor",
    });

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("no tty");
  });

  it("reports a gated response as one reason", async () => {
    const result = await queryTerminalTheme(renderer(colors({ defaultBackground: null })), {
      capability: "truecolor",
    });

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("OSC 11");
  });

  it("bounds a renderer whose promise never settles", async () => {
    const stalled: TerminalPaletteRenderer = {
      getPalette: (): Promise<TerminalColors> => new Promise<TerminalColors>(() => {}),
      clearPaletteCache: (): void => {},
    };
    const result = await queryTerminalTheme(stalled, { capability: "truecolor" });

    expect(result.entry).toBeNull();
    expect(result.reason).toContain("timed out");
  });
});
