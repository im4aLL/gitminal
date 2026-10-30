import { beforeEach, describe, expect, it, mock } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { act, type ReactNode } from "react";
import { resetActionRegistry, resolveActionHandler } from "@/app/hooks/useAction";
import { useConfigActions } from "@/app/hooks/useConfigActions";
import { useTheme } from "@/app/hooks/useTheme";
import { ConfigProvider } from "@/app/providers/ConfigProvider";
import type { ConfigSnapshot, ConfigSource } from "@/app/providers/ConfigProvider.types";
import { ConsoleProvider } from "@/app/providers/ConsoleProvider";
import { StatusProvider } from "@/app/providers/StatusProvider";
import { TerminalPaletteProvider } from "@/app/providers/TerminalPaletteProvider";
import { NOT_DETECTED_TERMINAL_THEME } from "@/app/providers/TerminalPaletteProvider.constants";
import type { TerminalPaletteContextValue } from "@/app/providers/TerminalPaletteProvider.types";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { useTerminalPalette } from "@/app/providers/useTerminalPalette";
import { DEFAULT_CONFIG, UNRESOLVED_CONFIG_PATHS } from "@/domain/config/config.defaults";
import { createBuiltInCatalogue } from "@/domain/theme/theme.catalogue";
import type { ThemeCatalogue, ThemeCatalogueEntry } from "@/domain/theme/theme.catalogue.types";
import { THEMES } from "@/domain/theme/theme.registry";
import {
  readUnavailableTerminalTheme,
  TERMINAL_THEME_LABEL,
  TERMINAL_THEME_NAME,
} from "@/domain/theme/theme.terminal";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";
import { useThemeCatalogue } from "@/theme/useThemeCatalogue";

/** Reason used by the unavailable snapshots. */
const MISSING_BACKGROUND_REASON = "the terminal did not report a default background (OSC 11).";

/** Detected entry used by the accepted cases. */
const TERMINAL_ENTRY: ThemeCatalogueEntry = Object.freeze({
  name: TERMINAL_THEME_NAME,
  label: TERMINAL_THEME_LABEL,
  variant: "dark",
  tokens: THEMES.nord.tokens,
  source: "terminal",
});

/** Detected snapshot used by the accepted cases. */
const DETECTED: TerminalThemeResult = Object.freeze({
  entry: TERMINAL_ENTRY,
  reason: null,
  warnings: Object.freeze([]),
});

/** Arbitrary detection note published alongside a detected entry. */
const TERMINAL_NOTE = "Native Terminal: diff line backgrounds cannot reach the 3.0 floor.";

/** Detected snapshot that carries one readability note. */
const DETECTED_WITH_NOTE: TerminalThemeResult = Object.freeze({
  entry: TERMINAL_ENTRY,
  reason: null,
  warnings: Object.freeze([TERMINAL_NOTE]),
});

/** Unavailable snapshot used by the fallback cases. */
const UNAVAILABLE: TerminalThemeResult = readUnavailableTerminalTheme(MISSING_BACKGROUND_REASON);

/** Latest terminal, theme, and catalogue values captured by the probe. */
let latestTerminal: TerminalPaletteContextValue | undefined;
let latestTheme: ReturnType<typeof useTheme> | undefined;
let latestCatalogue: ThemeCatalogue | undefined;

/**
 * Registers the configuration actions for a reload and captures the resolved theme.
 *
 * @returns A marker element.
 */
function ReloadProbe(): ReactNode {
  useConfigActions();
  latestTheme = useTheme();
  latestCatalogue = useThemeCatalogue();

  return <text>{latestTheme.name}</text>;
}

/**
 * Captures only the terminal palette, for cases that render outside the theme layer.
 *
 * @returns A marker element.
 */
function TerminalProbe(): ReactNode {
  latestTerminal = useTerminalPalette();

  return <text>terminal</text>;
}

/**
 * Captures the terminal palette, theme, and catalogue.
 *
 * @returns A marker element.
 */
function Probe(): ReactNode {
  latestTerminal = useTerminalPalette();
  latestTheme = useTheme();
  latestCatalogue = useThemeCatalogue();

  return <text>{latestTheme.name}</text>;
}

/**
 * Builds one configuration snapshot.
 *
 * @param overrides - Fields to override.
 * @returns The snapshot.
 */
function snapshot(overrides: Partial<ConfigSnapshot> = {}): ConfigSnapshot {
  return {
    status: "applied",
    config: DEFAULT_CONFIG,
    paths: UNRESOLVED_CONFIG_PATHS,
    files: [],
    warnings: [],
    keybindingsFile: {},
    themeOverrides: null,
    catalogue: createBuiltInCatalogue(),
    ...overrides,
  };
}

/**
 * Renders the terminal provider with an optional startup snapshot and detection override.
 *
 * @param initialSnapshot - Startup detection outcome.
 * @param detect - Re-detection override.
 * @returns The rendered setup.
 */
async function renderProvider(
  initialSnapshot: TerminalThemeResult = NOT_DETECTED_TERMINAL_THEME,
  detect?: () => Promise<TerminalThemeResult>,
): Promise<Awaited<ReturnType<typeof testRender>>> {
  latestTerminal = undefined;

  const setup = await testRender(
    <TerminalPaletteProvider initialSnapshot={initialSnapshot} detect={detect}>
      <TerminalProbe />
    </TerminalPaletteProvider>,
    { width: 40, height: 10 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return setup;
}

/**
 * Renders the theme layer above the terminal provider.
 *
 * @param terminal - Startup detection outcome.
 * @param configSnapshot - Configuration snapshot the theme resolves against.
 * @returns The rendered setup.
 */
async function renderTheme(
  terminal: TerminalThemeResult,
  configSnapshot: ConfigSnapshot,
): Promise<Awaited<ReturnType<typeof testRender>>> {
  latestTheme = undefined;
  latestCatalogue = undefined;

  const setup = await testRender(
    <ConfigProvider initialSnapshot={configSnapshot}>
      <TerminalPaletteProvider initialSnapshot={terminal}>
        <ThemeProvider capability="truecolor">
          <Probe />
        </ThemeProvider>
      </TerminalPaletteProvider>
    </ConfigProvider>,
    { width: 40, height: 10 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return setup;
}

describe("TerminalPaletteProvider", () => {
  it("exposes the startup detection without querying again", async () => {
    const setup = await renderProvider(DETECTED);

    expect(latestTerminal?.snapshot).toBe(DETECTED);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("reads the not-detected snapshot when nothing was detected", async () => {
    const setup = await renderProvider();

    expect(latestTerminal?.snapshot.entry).toBeNull();
    expect(latestTerminal?.snapshot.reason).toContain("not detected");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("re-detects on demand and replaces the snapshot", async () => {
    const detect = mock(async (): Promise<TerminalThemeResult> => DETECTED);
    const setup = await renderProvider(UNAVAILABLE, detect);

    expect(latestTerminal?.snapshot.entry).toBeNull();

    await act(async () => {
      await latestTerminal?.redetect();
      await setup.renderOnce();
    });

    expect(detect).toHaveBeenCalledTimes(1);
    expect(latestTerminal?.snapshot.entry?.name).toBe(TERMINAL_THEME_NAME);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("stores an unavailable result when the re-detection fails", async () => {
    const detect = mock(async (): Promise<TerminalThemeResult> => UNAVAILABLE);
    const setup = await renderProvider(DETECTED, detect);

    await act(async () => {
      await latestTerminal?.redetect();
      await setup.renderOnce();
    });

    expect(latestTerminal?.snapshot.entry).toBeNull();
    expect(latestTerminal?.snapshot.reason).toContain("OSC 11");

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("ThemeProvider terminal integration", () => {
  it("resolves the terminal identity against the detected entry", async () => {
    const terminalConfig = { ...DEFAULT_CONFIG, theme: "terminal" };
    const setup = await renderTheme(DETECTED, snapshot({ config: terminalConfig }));

    expect(latestTheme?.name).toBe(TERMINAL_THEME_NAME);
    expect(latestTheme?.label).toBe(TERMINAL_THEME_LABEL);
    expect(latestTheme?.tokens).toBe(TERMINAL_ENTRY.tokens);
    expect(latestTheme?.warnings).toEqual([]);
    expect(latestCatalogue?.entries.at(-1)?.name).toBe(TERMINAL_THEME_NAME);
    expect(latestCatalogue?.entries.at(-1)?.source).toBe("terminal");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("places the entry in the detected variant", async () => {
    const light: ThemeCatalogueEntry = Object.freeze({
      ...TERMINAL_ENTRY,
      variant: "light",
      tokens: THEMES["catppuccin-latte"].tokens,
    });
    const setup = await renderTheme(
      { entry: light, reason: null, warnings: [] },
      snapshot({ config: { ...DEFAULT_CONFIG, theme: "terminal" } }),
    );

    expect(latestTheme?.variant).toBe("light");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("falls back to the default theme with one warning when detection failed", async () => {
    const terminalConfig = { ...DEFAULT_CONFIG, theme: "terminal" };
    const setup = await renderTheme(UNAVAILABLE, snapshot({ config: terminalConfig }));

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(latestTheme?.warnings).toEqual([
      `Native Terminal is unavailable: ${MISSING_BACKGROUND_REASON}`,
    ]);
    expect(latestCatalogue?.entries.some((entry) => entry.source === "terminal")).toBe(false);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("publishes a detection note once while Native Terminal is the resolved theme", async () => {
    const setup = await renderTheme(
      DETECTED_WITH_NOTE,
      snapshot({ config: { ...DEFAULT_CONFIG, theme: TERMINAL_THEME_NAME } }),
    );

    expect(latestTheme?.name).toBe(TERMINAL_THEME_NAME);
    expect(latestTheme?.warnings).toEqual([TERMINAL_NOTE]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("does not publish a detection note while a built-in theme is active", async () => {
    const setup = await renderTheme(
      DETECTED_WITH_NOTE,
      snapshot({ config: { ...DEFAULT_CONFIG, theme: "catppuccin-mocha" } }),
    );

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(latestTheme?.warnings).toEqual([]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("publishes catalogue warnings once through the resolved theme", async () => {
    const catalogue: ThemeCatalogue = {
      entries: createBuiltInCatalogue().entries,
      warnings: ['ink.json: Theme "ink" is already defined; the file was ignored.'],
    };
    const setup = await renderTheme(
      UNAVAILABLE,
      snapshot({ catalogue, config: { ...DEFAULT_CONFIG, theme: "catppuccin-mocha" } }),
    );

    expect(latestTheme?.warnings).toEqual([
      'ink.json: Theme "ink" is already defined; the file was ignored.',
    ]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("leaves the catalogue untouched when detection produced no entry", async () => {
    const configSnapshot = snapshot();
    const setup = await renderTheme(UNAVAILABLE, configSnapshot);

    expect(latestCatalogue).toBe(configSnapshot.catalogue);

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("terminal re-detection on reload", () => {
  beforeEach(() => {
    resetActionRegistry();
  });

  /**
   * Renders the stack a reload needs, with a `terminal` configuration.
   *
   * @param detect - Re-detection override.
   * @param terminalSnapshot - Startup detection outcome; defaults to a detected entry.
   * @returns The rendered setup.
   */
  async function renderReload(
    detect: () => Promise<TerminalThemeResult>,
    terminalSnapshot: TerminalThemeResult = DETECTED,
  ): Promise<Awaited<ReturnType<typeof testRender>>> {
    const configSnapshot = snapshot({
      config: { ...DEFAULT_CONFIG, theme: "terminal" },
      catalogue: createBuiltInCatalogue(),
    });
    const source: ConfigSource = {
      paths: UNRESOLVED_CONFIG_PATHS,
      load: async (): Promise<ConfigSnapshot> => configSnapshot,
    };

    latestTheme = undefined;
    latestCatalogue = undefined;

    return testRender(
      <ConfigProvider initialSnapshot={configSnapshot} source={source}>
        <TerminalPaletteProvider initialSnapshot={terminalSnapshot} detect={detect}>
          <ThemeProvider capability="truecolor">
            <StatusProvider>
              <ConsoleProvider>
                <ReloadProbe />
              </ConsoleProvider>
            </StatusProvider>
          </ThemeProvider>
        </TerminalPaletteProvider>
      </ConfigProvider>,
      { width: 40, height: 10 },
    );
  }

  /**
   * Renders until a predicate holds or the deadline passes.
   *
   * @param setup - Renderer setup.
   * @param predicate - Condition to wait for.
   */
  async function waitFor(
    setup: Awaited<ReturnType<typeof testRender>>,
    predicate: () => boolean,
  ): Promise<void> {
    const deadline = Date.now() + 2_000;

    while (!predicate() && Date.now() < deadline) {
      await act(async () => {
        await setup.renderOnce();
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
    }
  }

  /** Runs one reload through the registered global action. */
  async function reload(_setup: Awaited<ReturnType<typeof testRender>>): Promise<void> {
    await act(async () => {
      resolveActionHandler("app.reloadConfig", "global")?.();
    });
  }

  it("re-detects when Native Terminal is the active theme", async () => {
    const detect = mock(async (): Promise<TerminalThemeResult> => DETECTED);
    const setup = await renderReload(detect);

    await act(async () => {
      await setup.renderOnce();
    });

    expect(latestTheme?.name).toBe(TERMINAL_THEME_NAME);

    await reload(setup);
    await waitFor(setup, () => detect.mock.calls.length > 0);

    expect(detect).toHaveBeenCalledTimes(1);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("re-detects and adopts the entry when startup detection had failed", async () => {
    const detect = mock(async (): Promise<TerminalThemeResult> => DETECTED);
    const setup = await renderReload(detect, UNAVAILABLE);

    await act(async () => {
      await setup.renderOnce();
    });

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(latestCatalogue?.entries.some((entry) => entry.source === "terminal")).toBe(false);

    await reload(setup);
    await waitFor(
      setup,
      () => detect.mock.calls.length > 0 && latestTheme?.name === TERMINAL_THEME_NAME,
    );

    expect(detect).toHaveBeenCalledTimes(1);
    expect(latestTheme?.name).toBe(TERMINAL_THEME_NAME);
    expect(latestCatalogue?.entries.at(-1)?.source).toBe("terminal");

    await act(async () => {
      await setup.dispose();
    });
  });
});
