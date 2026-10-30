import { beforeEach, describe, expect, it, mock } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { act, type ReactNode } from "react";
import { resetActionRegistry, resolveActionHandler } from "@/app/hooks/useAction";
import { useConsoleLog } from "@/app/hooks/useConsoleLog";
import { useStatus } from "@/app/hooks/useStatus";
import { useTheme } from "@/app/hooks/useTheme";
import { DEFAULT_CONFIG } from "@/domain/config/config.defaults";
import type { ConfigFilePaths, ThemeWriteResult } from "@/domain/config/config.types";
import { applyThemeCapability } from "@/domain/theme/theme.capability";
import { createBuiltInCatalogue } from "@/domain/theme/theme.catalogue";
import { THEMES } from "@/domain/theme/theme.registry";
import type { ResolvedTheme, ThemeVariant } from "@/domain/theme/theme.types";
import { readExportName } from "@/domain/theme/theme.user";
import {
  THEME_EXPORT_FAILED_MESSAGE,
  THEME_SAVE_FAILED_MESSAGE,
} from "@/features/theme-picker/ThemePicker.constants";
import { useThemePicker } from "@/features/theme-picker/useThemePicker";
import type {
  ThemeExport,
  ThemePersist,
  ThemePickerHandle,
} from "@/features/theme-picker/useThemePicker.types";
import { AppTestProviders } from "@/test/app.harness";
import { createFakeGitClient } from "@/test/git.fake";

/** Snapshot type the test harness accepts; derived here so the test imports no app module. */
type TestConfigSnapshot = NonNullable<Parameters<typeof AppTestProviders>[0]["configSnapshot"]>;

/** Config path the picker is expected to persist to. */
const CONFIG_PATH = "/cfg/config.json";

/** Themes directory the picker is expected to export into. */
const THEMES_DIR = "/cfg/themes";

/** Paths that make the picker resolve real persistence and export targets. */
const PATHS: ConfigFilePaths = Object.freeze({
  config: CONFIG_PATH,
  keybindings: "/cfg/keybindings.json",
  theme: "/cfg/theme.json",
  themesDir: THEMES_DIR,
});

/** Snapshot that reports a present theme file so the note has something to describe. */
const SNAPSHOT: TestConfigSnapshot = {
  status: "applied",
  config: { ...DEFAULT_CONFIG },
  paths: PATHS,
  files: Object.freeze([
    { key: "theme", status: "loaded", value: { colors: {} }, path: "/cfg/theme.json" },
  ]),
  warnings: Object.freeze([]),
  keybindingsFile: Object.freeze({}),
  themeOverrides: { colors: {} },
  catalogue: createBuiltInCatalogue(),
};

/** Snapshot whose catalogue has no light themes, so the Light tab is empty. */
const DARK_ONLY_SNAPSHOT: TestConfigSnapshot = {
  ...SNAPSHOT,
  catalogue: {
    entries: createBuiltInCatalogue().entries.filter((entry) => entry.variant === "dark"),
    warnings: [],
  },
};

/** Every built-in theme name, split by variant. */
const BUILT_IN_NAMES: readonly string[] = Object.keys(THEMES);

/**
 * Reads every built-in theme name of one variant, alphabetically.
 *
 * @param variant - Light or dark classification.
 * @returns The matching names in ascending order.
 */
function namesOf(variant: ThemeVariant): readonly string[] {
  return BUILT_IN_NAMES.filter((name) => THEMES[name as keyof typeof THEMES].variant === variant);
}

/** Latest picker handle, theme, and status captured by the probe. */
let latestPicker: ThemePickerHandle | undefined;
let latestTheme: ResolvedTheme | undefined;
let latestStatus: ReturnType<typeof useStatus> | undefined;
let latestConsole: ReturnType<typeof useConsoleLog> | undefined;

/**
 * Renders the picker hook and captures its state.
 *
 * @param props - Close callback, persistence override, and export override.
 * @returns A marker element.
 */
function PickerProbe(props: {
  readonly onClose: () => void;
  readonly persist?: ThemePersist;
  readonly exportTheme?: ThemeExport;
}): ReactNode {
  latestPicker = useThemePicker(props);
  latestTheme = useTheme();
  latestStatus = useStatus();
  latestConsole = useConsoleLog();

  return <text>{latestTheme.name}</text>;
}

/**
 * Renders the picker hook inside the provider stack.
 *
 * @param persist - Persistence override used by the case.
 * @param capability - Capability override used by the case.
 * @param exportTheme - Export override used by the case.
 * @param snapshot - Config snapshot override used by the case.
 * @returns The rendered setup and the close mock.
 */
async function renderPicker(
  persist?: ThemePersist,
  capability?: "truecolor" | "color-256" | "monochrome",
  exportTheme?: ThemeExport,
  snapshot: TestConfigSnapshot = SNAPSHOT,
): Promise<{
  readonly setup: Awaited<ReturnType<typeof testRender>>;
  readonly onClose: () => void;
}> {
  const onClose = mock(() => {});

  latestPicker = undefined;
  latestTheme = undefined;
  latestStatus = undefined;
  latestConsole = undefined;

  const setup = await testRender(
    <AppTestProviders
      configSnapshot={snapshot}
      capability={capability}
      gitClient={createFakeGitClient().client}
    >
      <PickerProbe onClose={onClose} persist={persist} exportTheme={exportTheme} />
    </AppTestProviders>,
    { width: 60, height: 20 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return { setup, onClose };
}

/**
 * Runs one overlay-scoped action and flushes the renders it causes.
 *
 * Two render passes are awaited because a write promise settles in a microtask, so the status it sets
 * only reaches the probe on the following pass.
 *
 * @param setup - Renderer setup.
 * @param actionId - Action to resolve in the overlay scope.
 */
async function runOverlayAction(
  setup: Awaited<ReturnType<typeof testRender>>,
  actionId: string,
): Promise<void> {
  await act(async () => {
    resolveActionHandler(actionId, "overlay")?.();
    await setup.renderOnce();
    await setup.renderOnce();
  });
}

/**
 * Renders until a predicate holds or the deadline passes.
 *
 * The picker filter settles through a quiet interval, so a filter assertion has to wait for the
 * debounced value instead of asserting on the first render pass.
 *
 * @param setup - Renderer setup.
 * @param predicate - Condition to wait for.
 */
async function waitFor(
  setup: Awaited<ReturnType<typeof testRender>>,
  predicate: () => boolean,
): Promise<void> {
  const deadline = Date.now() + 3_000;

  while (!predicate() && Date.now() < deadline) {
    await act(async () => {
      await setup.renderOnce();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  }
}

/**
 * Reads the index of one theme row in the visible list.
 *
 * @param name - Theme name to find.
 * @returns The row index, or `-1` when the row is not visible.
 */
function rowIndexOf(name: string): number {
  return latestPicker?.rows.findIndex((row) => row.name === name) ?? -1;
}

beforeEach(() => {
  resetActionRegistry();
});

describe("useThemePicker rows", () => {
  it("lists the dark tab alphabetically by name and opens on the active theme's tab", async () => {
    const { setup } = await renderPicker();
    const expected = [...namesOf("dark")].sort();

    expect(latestPicker?.variant).toBe("dark");
    expect(latestPicker?.rows.map((row) => row.name)).toEqual(expected);
    expect(latestPicker?.rows.every((row) => row.variant === "dark")).toBe(true);
    expect(latestPicker?.rows.filter((row) => row.active).map((row) => row.name)).toEqual([
      "catppuccin-mocha",
    ]);
    expect(latestPicker?.emptyMessage).toBeNull();
    expect(latestPicker?.focusedZone).toBe("rows");
    expect(latestPicker?.focusedControl).toBe("apply");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("opens on the light tab when the active theme is light", async () => {
    const snapshot: TestConfigSnapshot = {
      ...SNAPSHOT,
      config: { ...DEFAULT_CONFIG, theme: "catppuccin-latte" },
    };
    const setup = await testRender(
      <AppTestProviders configSnapshot={snapshot} gitClient={createFakeGitClient().client}>
        <PickerProbe onClose={() => {}} />
      </AppTestProviders>,
      { width: 60, height: 20 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.rows.map((row) => row.name)).toEqual([...namesOf("light")].sort());
    expect(latestPicker?.rows.filter((row) => row.active).map((row) => row.name)).toEqual([
      "catppuccin-latte",
    ]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("interleaves user themes into the alphabetical order of their tab", async () => {
    const catalogue = createBuiltInCatalogue();
    const userEntry = {
      name: "aaa-user-theme",
      label: "AAA User Theme",
      variant: "dark" as const,
      tokens: THEMES["catppuccin-mocha"].tokens,
      source: "user" as const,
    };
    const snapshot: TestConfigSnapshot = {
      ...SNAPSHOT,
      catalogue: { entries: [...catalogue.entries, userEntry], warnings: [] },
    };
    const setup = await testRender(
      <AppTestProviders configSnapshot={snapshot} gitClient={createFakeGitClient().client}>
        <PickerProbe onClose={() => {}} />
      </AppTestProviders>,
      { width: 60, height: 20 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    expect(latestPicker?.rows[0]?.name).toBe("aaa-user-theme");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("switches tabs and shows the per-variant list", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.selectVariant("light");
      await setup.renderOnce();
    });

    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.rows.every((row) => row.variant === "light")).toBe(true);
    expect(latestPicker?.rows.map((row) => row.name)).toEqual([...namesOf("light")].sort());

    await act(async () => {
      await setup.dispose();
    });
  });

  it("previews the quantized color on a 256-color terminal", async () => {
    const { setup } = await renderPicker(undefined, "color-256");
    const mocha = latestPicker?.rows.find((row) => row.name === "catppuccin-mocha");
    const mapped = applyThemeCapability(
      { ...THEMES["catppuccin-mocha"], capability: "truecolor", warnings: [] },
      "color-256",
    );

    expect(mocha?.swatchColor).toBe(mapped.tokens.background);
    expect(mocha?.swatchColor).not.toBe(THEMES["catppuccin-mocha"].tokens.background);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("drops the swatch color when the terminal has no color", async () => {
    const { setup } = await renderPicker(undefined, "monochrome");

    expect(latestPicker?.rows.every((row) => row.swatchColor === null)).toBe(true);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the entry's truecolor tokens for export", async () => {
    const { setup } = await renderPicker();
    const mocha = latestPicker?.rows.find((row) => row.name === "catppuccin-mocha");

    expect(mocha?.tokens).toBe(THEMES["catppuccin-mocha"].tokens);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("reports the theme.json note when the file is present", async () => {
    const { setup } = await renderPicker();

    expect(latestPicker?.note).toContain("theme.json overrides");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("offers Export, Cancel, and Apply with the rows focused first", async () => {
    const { setup } = await renderPicker();

    expect(latestPicker?.actions.map((action) => action.label)).toEqual([
      "Export",
      "Cancel",
      "Apply",
    ]);
    expect(latestPicker?.actions.map((action) => action.focused)).toEqual([false, false, false]);

    await runOverlayAction(setup, "focus.next");

    expect(latestPicker?.focusedZone).toBe("actions");
    expect(latestPicker?.actions.map((action) => action.focused)).toEqual([false, false, true]);

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker focus zones", () => {
  it("cycles tabs, rows, and actions with focus.next and focus.previous", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("actions");

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves from the tabs into the rows on nav.activate without committing", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(persist);

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "nav.activate");

    expect(latestPicker?.focusedZone).toBe("rows");
    expect(persist).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves from the tab bar to the footer buttons on nav.left and nav.right", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "nav.right");
    expect(latestPicker?.focusedZone).toBe("actions");
    expect(latestPicker?.focusedControl).toBe("apply");
    expect(latestPicker?.variant).toBe("dark");

    await runOverlayAction(setup, "focus.previous");
    await runOverlayAction(setup, "nav.left");
    expect(latestPicker?.focusedZone).toBe("actions");
    expect(latestPicker?.focusedControl).toBe("cancel");
    expect(latestPicker?.variant).toBe("dark");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("steps through every footer button with nav.left and nav.right from the rows", async () => {
    const { setup } = await renderPicker();

    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "nav.left");
    expect(latestPicker?.focusedControl).toBe("cancel");

    await runOverlayAction(setup, "nav.left");
    expect(latestPicker?.focusedControl).toBe("export");

    await runOverlayAction(setup, "nav.left");
    expect(latestPicker?.focusedControl).toBe("apply");

    await runOverlayAction(setup, "nav.right");
    expect(latestPicker?.focusedControl).toBe("export");

    expect(latestPicker?.focusedZone).toBe("actions");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("switches and wraps tabs with the bracket actions from the rows", async () => {
    const { setup } = await renderPicker();

    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "theme.tabRight");
    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "theme.tabRight");
    expect(latestPicker?.variant).toBe("dark");

    await runOverlayAction(setup, "theme.tabLeft");
    expect(latestPicker?.variant).toBe("light");

    await runOverlayAction(setup, "theme.tabLeft");
    expect(latestPicker?.variant).toBe("dark");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("switches tabs with the bracket actions from the tabs and actions zones", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "theme.tabRight");
    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "theme.tabLeft");
    expect(latestPicker?.variant).toBe("dark");

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("actions");

    await runOverlayAction(setup, "theme.tabRight");
    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.focusedZone).toBe("actions");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("advances two tabs when both bracket presses land in one frame", async () => {
    const { setup } = await renderPicker();

    expect(latestPicker?.variant).toBe("dark");

    await act(async () => {
      resolveActionHandler("theme.tabRight", "overlay")?.();
      resolveActionHandler("theme.tabRight", "overlay")?.();
    });
    await act(async () => {
      await setup.renderOnce();
    });

    expect(latestPicker?.variant).toBe("dark");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("falls back to the first light row after a bracket switch", async () => {
    const { setup } = await renderPicker();
    const lightRows = [...namesOf("light")].sort();

    await runOverlayAction(setup, "theme.tabRight");

    expect(latestPicker?.variant).toBe("light");
    expect(latestPicker?.highlightedIndex).toBe(0);
    expect(latestPicker?.rows[0]?.name).toBe(lightRows[0]);
    expect(latestTheme?.name).toBe(lightRows[0]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("does not change the tab with nav.left while the rows own the keyboard", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "nav.left");

    expect(latestPicker?.focusedZone).toBe("actions");
    expect(latestPicker?.variant).toBe("dark");
    expect(latestPicker?.focusedControl).toBe("cancel");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves into the rows and highlights the next theme on nav.down from the tabs zone", async () => {
    const { setup } = await renderPicker();
    const startIndex = latestPicker?.highlightedIndex ?? -1;

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "nav.down");

    expect(latestPicker?.focusedZone).toBe("rows");
    expect(latestPicker?.highlightedIndex).toBe(startIndex + 1);
    expect(latestTheme?.name).toBe(latestPicker?.rows[startIndex + 1]?.name);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves from the footer actions into the rows on nav.up and nav.down", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("actions");

    await runOverlayAction(setup, "nav.up");
    expect(latestPicker?.focusedZone).toBe("rows");

    await runOverlayAction(setup, "focus.next");
    expect(latestPicker?.focusedZone).toBe("actions");

    await runOverlayAction(setup, "nav.down");
    expect(latestPicker?.focusedZone).toBe("rows");

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker filter", () => {
  it("narrows the rows to the query and keeps the highlighted theme", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.selectVariant("light");
      await setup.renderOnce();
    });

    const index = latestPicker?.rows.findIndex((row) => row.name === "catppuccin-latte") ?? 0;

    await act(async () => {
      latestPicker?.select(index);
      await setup.renderOnce();
    });

    await act(async () => {
      latestPicker?.setQuery("latte");
    });
    await waitFor(setup, () => latestPicker?.rows.length === 1);

    expect(latestPicker?.query).toBe("latte");
    expect(latestPicker?.rows.map((row) => row.name)).toEqual(["catppuccin-latte"]);
    expect(latestPicker?.highlightedIndex).toBe(0);
    expect(latestTheme?.name).toBe("catppuccin-latte");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("filters inside the active tab only", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.setQuery("latte");
    });
    await waitFor(setup, () => latestPicker?.rows.length === 0);

    expect(latestPicker?.variant).toBe("dark");
    expect(latestPicker?.rows).toEqual([]);
    expect(latestPicker?.emptyMessage).toBe('No themes match "latte"');

    await act(async () => {
      await setup.dispose();
    });
  });

  it("falls back to the first match and previews it when the filter hides the highlight", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.setQuery("mocha");
    });
    await waitFor(setup, () => latestPicker?.rows.length === 1);

    expect(latestPicker?.rows[0]?.name).toBe("catppuccin-mocha");
    expect(latestTheme?.name).toBe("catppuccin-mocha");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("restores the full tab when the query is cleared", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.setQuery("latte");
    });
    await waitFor(setup, () => latestPicker?.rows.length === 0);

    await act(async () => {
      latestPicker?.setQuery("");
      await setup.renderOnce();
    });

    expect(latestPicker?.rows.length).toBe(namesOf("dark").length);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the current preview and an empty row list when nothing matches", async () => {
    const { setup } = await renderPicker();

    await act(async () => {
      latestPicker?.setQuery("zzz");
    });
    await waitFor(setup, () => latestPicker?.rows.length === 0);

    expect(latestPicker?.rows).toEqual([]);
    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(latestPicker?.highlightedIndex).toBe(0);

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker empty tabs", () => {
  it("reports a per-variant empty message when the tab has no themes", async () => {
    const catalogue = createBuiltInCatalogue();
    const darkEntries = catalogue.entries.filter((entry) => entry.variant === "dark");
    const snapshot: TestConfigSnapshot = {
      ...SNAPSHOT,
      catalogue: { entries: darkEntries, warnings: [] },
    };
    const setup = await testRender(
      <AppTestProviders configSnapshot={snapshot} gitClient={createFakeGitClient().client}>
        <PickerProbe onClose={() => {}} />
      </AppTestProviders>,
      { width: 60, height: 20 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    await act(async () => {
      latestPicker?.selectVariant("light");
      await setup.renderOnce();
    });

    expect(latestPicker?.rows).toEqual([]);
    expect(latestPicker?.emptyMessage).toBe("No light themes installed");

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker preview", () => {
  it("previews a selected row without persisting it", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup } = await renderPicker(persist);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    const second = latestPicker?.rows[1]?.name;

    expect(latestTheme?.name).toBe(second);
    expect(latestPicker?.highlightedIndex).toBe(1);
    expect(persist).not.toHaveBeenCalled();

    await act(async () => {
      await setup.dispose();
    });
  });

  it("previews on nav.up and nav.down", async () => {
    const { setup } = await renderPicker();
    const startIndex = rowIndexOf("catppuccin-mocha");
    const nextName = latestPicker?.rows[startIndex + 1]?.name;
    const previousName = latestPicker?.rows[startIndex - 1]?.name;

    expect(startIndex).toBeGreaterThan(0);

    await runOverlayAction(setup, "nav.down");
    expect(latestPicker?.highlightedIndex).toBe(startIndex + 1);
    expect(latestTheme?.name).toBe(nextName);

    await runOverlayAction(setup, "nav.up");
    expect(latestPicker?.highlightedIndex).toBe(startIndex);
    expect(latestTheme?.name).toBe("catppuccin-mocha");

    await runOverlayAction(setup, "nav.up");
    expect(latestPicker?.highlightedIndex).toBe(startIndex - 1);
    expect(latestTheme?.name).toBe(previousName);

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker apply", () => {
  it("applies, persists, and closes on nav.activate", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(persist);
    const startIndex = rowIndexOf("catppuccin-mocha");
    const nextRow = latestPicker?.rows[startIndex + 1];

    await runOverlayAction(setup, "nav.down");
    await runOverlayAction(setup, "nav.activate");

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith(nextRow?.name, CONFIG_PATH);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(latestTheme?.name).toBe(nextRow?.name);
    expect(latestStatus?.status).toEqual({
      kind: "success",
      message: `Theme saved: ${nextRow?.label}`,
    });
    expect(latestConsole?.entries).toEqual([]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the theme for the session and warns when the write fails", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: false, reason: "EACCES" }));
    const { setup, onClose } = await renderPicker(persist);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    const second = latestPicker?.rows[1]?.name;

    await runOverlayAction(setup, "nav.activate");

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(latestTheme?.name).toBe(second);
    expect(latestStatus?.status).toEqual({
      kind: "warning",
      message: `${THEME_SAVE_FAILED_MESSAGE}: EACCES`,
    });

    await act(async () => {
      await setup.dispose();
    });
  });

  it("cancels through the focused Cancel control", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(persist);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    await runOverlayAction(setup, "nav.left");
    expect(latestPicker?.focusedControl).toBe("cancel");

    await runOverlayAction(setup, "nav.activate");

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(persist).not.toHaveBeenCalled();
    expect(latestTheme?.name).toBe("catppuccin-mocha");

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker export", () => {
  it("writes the highlighted theme without closing the picker", async () => {
    const exportTheme = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(undefined, undefined, exportTheme);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    const row = latestPicker?.rows[1];
    const exportName = row === undefined ? undefined : readExportName(row.name);

    await runOverlayAction(setup, "focus.next");
    await runOverlayAction(setup, "nav.left");
    await runOverlayAction(setup, "nav.left");
    await runOverlayAction(setup, "nav.activate");

    expect(exportTheme).toHaveBeenCalledTimes(1);
    expect(exportTheme).toHaveBeenCalledWith(
      {
        name: exportName,
        label: row?.label,
        variant: row?.variant,
        tokens: row?.tokens,
      },
      THEMES_DIR,
    );
    expect(exportName?.endsWith("-custom")).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(latestStatus?.status).toEqual({
      kind: "success",
      message: `Theme exported: ${exportName}`,
    });

    await act(async () => {
      await setup.dispose();
    });
  });

  it("exports through theme.export without closing the picker", async () => {
    const exportTheme = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(undefined, undefined, exportTheme);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    const row = latestPicker?.rows[1];
    const exportName = row === undefined ? undefined : readExportName(row.name);

    await runOverlayAction(setup, "theme.export");

    expect(exportTheme).toHaveBeenCalledTimes(1);
    expect(exportTheme).toHaveBeenCalledWith(
      {
        name: exportName,
        label: row?.label,
        variant: row?.variant,
        tokens: row?.tokens,
      },
      THEMES_DIR,
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(latestStatus?.status).toEqual({
      kind: "success",
      message: `Theme exported: ${exportName}`,
    });

    await act(async () => {
      await setup.dispose();
    });
  });

  it("exports from the tabs zone without changing the tab or the zone", async () => {
    const exportTheme = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(undefined, undefined, exportTheme);

    await runOverlayAction(setup, "focus.previous");
    expect(latestPicker?.focusedZone).toBe("tabs");

    await runOverlayAction(setup, "theme.export");

    expect(exportTheme).toHaveBeenCalledTimes(1);
    expect(latestPicker?.variant).toBe("dark");
    expect(latestPicker?.focusedZone).toBe("tabs");
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      await setup.dispose();
    });
  });

  it("does nothing when export runs on an empty tab", async () => {
    const exportTheme = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(
      undefined,
      undefined,
      exportTheme,
      DARK_ONLY_SNAPSHOT,
    );

    await act(async () => {
      latestPicker?.selectVariant("light");
      await setup.renderOnce();
    });

    expect(latestPicker?.rows).toEqual([]);

    await runOverlayAction(setup, "theme.export");

    expect(exportTheme).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(latestPicker?.variant).toBe("light");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("warns when the export fails", async () => {
    const exportTheme = mock(
      async (): Promise<ThemeWriteResult> => ({ ok: false, reason: "already exists" }),
    );
    const { setup } = await renderPicker(undefined, undefined, exportTheme);

    await runOverlayAction(setup, "focus.next");
    await runOverlayAction(setup, "nav.left");
    await runOverlayAction(setup, "nav.left");
    await runOverlayAction(setup, "nav.activate");

    expect(latestStatus?.status).toEqual({
      kind: "warning",
      message: `${THEME_EXPORT_FAILED_MESSAGE}: already exists`,
    });

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("useThemePicker restore", () => {
  it("restores the previous theme on overlay.close", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker(persist);

    await act(async () => {
      latestPicker?.select(1);
      await setup.renderOnce();
    });

    const second = latestPicker?.rows[1]?.name;

    expect(latestTheme?.name).toBe(second);

    await runOverlayAction(setup, "overlay.close");

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(persist).not.toHaveBeenCalled();

    await act(async () => {
      await setup.dispose();
    });
  });
});
