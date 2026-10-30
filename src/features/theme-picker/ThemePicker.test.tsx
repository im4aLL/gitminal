import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { ScrollBoxRenderable } from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act, type ReactNode, useState } from "react";
import { resetInputModes } from "@/app/hooks/inputMode.registry";
import { resetActionRegistry, resolveActionHandler } from "@/app/hooks/useAction";
import { clearFocusedInput, resetInputEscapeClear } from "@/app/hooks/useInputEscapeClear";
import { useTheme } from "@/app/hooks/useTheme";
import { DEFAULT_CONFIG, UNRESOLVED_CONFIG_PATHS } from "@/domain/config/config.defaults";
import type { ThemeWriteResult } from "@/domain/config/config.types";
import { THEME_NAMES } from "@/domain/theme/theme.registry";
import type { ResolvedTheme, ThemeColorCapability } from "@/domain/theme/theme.types";
import { ThemePicker } from "@/features/theme-picker/ThemePicker";
import {
  THEME_PICKER_LIST_ID,
  THEME_PICKER_MAX_VISIBLE_ROWS,
  THEME_PICKER_SEARCH_INPUT_ID,
} from "@/features/theme-picker/ThemePicker.constants";
import { themeRowId } from "@/features/theme-picker/ThemeRow";
import { AppTestProviders } from "@/test/app.harness";
import { createFakeGitClient } from "@/test/git.fake";

/** Snapshot type the harness accepts; derived here so this test imports no app module. */
type TestConfigSnapshot = NonNullable<Parameters<typeof AppTestProviders>[0]["configSnapshot"]>;

/** Snapshot without a theme file, so the override note is absent. */
const PLAIN_SNAPSHOT: TestConfigSnapshot = {
  status: "applied",
  config: DEFAULT_CONFIG,
  paths: UNRESOLVED_CONFIG_PATHS,
  files: Object.freeze([]),
  warnings: Object.freeze([]),
  keybindingsFile: Object.freeze({}),
  themeOverrides: null,
};

/** Snapshot with a theme file, so the override note is present. */
const OVERRIDE_SNAPSHOT: TestConfigSnapshot = {
  ...PLAIN_SNAPSHOT,
  paths: Object.freeze({
    config: "/cfg/config.json",
    keybindings: null,
    theme: "/cfg/theme.json",
  }),
  files: Object.freeze([
    { key: "theme", status: "loaded", value: { colors: {} }, path: "/cfg/theme.json" },
  ]),
  themeOverrides: { colors: {} },
};

/** Latest resolved theme captured by the watcher. */
let latestTheme: ResolvedTheme | undefined;

/**
 * Reads the latest captured theme.
 *
 * A function read keeps TypeScript from narrowing the module variable to `undefined` after a reset,
 * which would hide assignments made inside render callbacks.
 *
 * @returns The latest resolved theme, or undefined before the first render.
 */
function readLatestTheme(): ResolvedTheme | undefined {
  return latestTheme;
}

/** Hides the picker without closing it, used by the unmount-restore test. */
let hidePicker: () => void = () => {};

/**
 * Captures the resolved theme without rendering any visible content.
 *
 * @returns An empty marker.
 */
function ThemeWatcher(): ReactNode {
  latestTheme = useTheme();

  return <text> </text>;
}

/**
 * Renders the picker behind local visibility state so a test can unmount it without closing.
 *
 * @param props - Close handler and persistence override.
 * @returns The picker while visible plus the theme watcher.
 */
function UnmountablePicker(props: {
  readonly onClose: () => void;
  readonly persist?: (name: string, configPath: string | null) => Promise<ThemeWriteResult>;
}): ReactNode {
  const [visible, setVisible] = useState(true);

  hidePicker = (): void => {
    setVisible(false);
  };

  return (
    <>
      {visible ? <ThemePicker onClose={props.onClose} persist={props.persist} /> : null}
      <ThemeWatcher />
    </>
  );
}

/**
 * Renders the picker with an optional close handler, persistence, snapshot, and capability.
 *
 * @param options - Case inputs.
 * @returns The rendered setup and the close mock.
 */
async function renderPicker(
  options: {
    readonly onClose?: () => void;
    readonly persist?: (name: string, configPath: string | null) => Promise<ThemeWriteResult>;
    readonly snapshot?: TestConfigSnapshot;
    readonly capability?: ThemeColorCapability;
  } = {},
): Promise<{
  readonly setup: Awaited<ReturnType<typeof testRender>>;
  readonly onClose: () => void;
}> {
  const onClose = options.onClose ?? mock(() => {});

  latestTheme = undefined;

  const setup = await testRender(
    <AppTestProviders
      configSnapshot={options.snapshot ?? PLAIN_SNAPSHOT}
      capability={options.capability}
      gitClient={createFakeGitClient().client}
    >
      <ThemePicker onClose={onClose} persist={options.persist} />
      <ThemeWatcher />
    </AppTestProviders>,
    { width: 80, height: 24 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return { setup, onClose };
}

/**
 * Resolves one overlay-scoped action and flushes the renders it causes.
 *
 * Two render passes are awaited because a persistence promise settles in a microtask, so the status
 * it sets only reaches the probe on the following pass.
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
 * The search field settles through a quiet interval, so a filter assertion waits for the debounced
 * value instead of asserting on the first render pass.
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

beforeEach(() => {
  resetActionRegistry();
  resetInputModes();
  resetInputEscapeClear();
});

describe("ThemePicker rendering", () => {
  it("renders a custom row per family theme with names, variants, and the active marker", async () => {
    const { setup } = await renderPicker();
    const frame = setup.captureCharFrame();
    const visible = THEME_NAMES.slice(0, THEME_PICKER_MAX_VISIBLE_ROWS);

    for (const name of visible) {
      expect(setup.renderer.root.findDescendantById(themeRowId(name)), name).toBeDefined();
    }

    expect(frame).toContain("Theme");
    expect(frame).toContain("Catppuccin Mocha");
    expect(frame).toContain("Tokyo Night");
    expect(frame).toContain("dark");
    expect(frame).toContain("*");
    expect(frame).toContain("Cancel");
    expect(frame).toContain("Apply");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("reveals the highlighted row through the list scrollbox", async () => {
    const { setup } = await renderPicker();
    const list = setup.renderer.root.findDescendantById(
      THEME_PICKER_LIST_ID,
    ) as unknown as ScrollBoxRenderable;
    const reveal = mock((_childId: string): void => {});

    expect(THEME_NAMES.length).toBeGreaterThan(THEME_PICKER_MAX_VISIBLE_ROWS);

    list.scrollChildIntoView = reveal;

    await runOverlayAction(setup, "nav.down");

    expect(reveal).toHaveBeenLastCalledWith(
      themeRowId(THEME_NAMES[1] as (typeof THEME_NAMES)[number]),
    );

    await act(async () => {
      await setup.dispose();
    });
  });

  it("falls back to plain swatch markers without color", async () => {
    const { setup } = await renderPicker({ capability: "monochrome" });
    const frame = setup.captureCharFrame();

    expect(frame).toContain("[#]");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("shows the theme.json note only when the file is present", async () => {
    const plain = await renderPicker();

    expect(plain.setup.captureCharFrame()).not.toContain("theme.json overrides");

    await act(async () => {
      await plain.setup.dispose();
    });

    const withOverrides = await renderPicker({ snapshot: OVERRIDE_SNAPSHOT });

    expect(withOverrides.setup.captureCharFrame()).toContain("theme.json overrides");

    await act(async () => {
      await withOverrides.setup.dispose();
    });
  });
});

describe("ThemePicker search", () => {
  it("renders the search field with its placeholder", async () => {
    const { setup } = await renderPicker();
    const frame = setup.captureCharFrame();

    expect(setup.renderer.root.findDescendantById(THEME_PICKER_SEARCH_INPUT_ID)).toBeDefined();
    expect(frame).toContain("Search themes");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("narrows the rendered rows after focusing the field and typing", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "overlay.search");

    await act(async () => {
      await setup.mockInput.typeText("latte");
      await setup.renderOnce();
    });
    await waitFor(setup, () => !setup.captureCharFrame().includes("Catppuccin Mocha"));

    const frame = setup.captureCharFrame();

    expect(frame).toContain("Catppuccin Latte");
    expect(frame).not.toContain("Catppuccin Mocha");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("shows a no-match message when nothing matches", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "overlay.search");

    await act(async () => {
      await setup.mockInput.typeText("zzz");
      await setup.renderOnce();
    });
    await waitFor(setup, () => setup.captureCharFrame().includes("No themes match"));

    expect(setup.captureCharFrame()).toContain('No themes match "zzz"');

    await act(async () => {
      await setup.dispose();
    });
  });

  it("registers the first-Esc clear for the field while the filter has text", async () => {
    const { setup } = await renderPicker();

    expect(clearFocusedInput(THEME_PICKER_SEARCH_INPUT_ID)).toBe(false);

    await runOverlayAction(setup, "overlay.search");

    await act(async () => {
      await setup.mockInput.typeText("latte");
      await setup.renderOnce();
    });
    await waitFor(setup, () => clearFocusedInput(THEME_PICKER_SEARCH_INPUT_ID));

    expect(clearFocusedInput(THEME_PICKER_SEARCH_INPUT_ID)).toBe(true);

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("ThemePicker interaction", () => {
  it("previews live on nav.down and nav.up", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "nav.down");
    expect(latestTheme?.name).toBe("catppuccin-macchiato");

    await runOverlayAction(setup, "nav.down");
    expect(latestTheme?.name).toBe("catppuccin-frappe");

    await runOverlayAction(setup, "nav.up");
    expect(latestTheme?.name).toBe("catppuccin-macchiato");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("restores the previous theme when it unmounts without closing", async () => {
    latestTheme = undefined;
    hidePicker = () => {};

    const setup = await testRender(
      <AppTestProviders
        configSnapshot={PLAIN_SNAPSHOT}
        capability="truecolor"
        gitClient={createFakeGitClient().client}
      >
        <UnmountablePicker onClose={() => {}} />
      </AppTestProviders>,
      { width: 80, height: 24 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    await runOverlayAction(setup, "nav.down");

    expect(readLatestTheme()?.name).toBe("catppuccin-macchiato");

    await act(async () => {
      hidePicker();
      await setup.renderOnce();
    });

    expect(readLatestTheme()?.name).toBe("catppuccin-mocha");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves between the rows and the actions with focus.next and focus.previous", async () => {
    const { setup, onClose } = await renderPicker();

    await runOverlayAction(setup, "focus.next");
    await runOverlayAction(setup, "nav.up");
    await runOverlayAction(setup, "nav.activate");

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      await setup.dispose();
    });

    const second = await renderPicker();

    await runOverlayAction(second.setup, "focus.next");
    await runOverlayAction(second.setup, "focus.previous");
    await runOverlayAction(second.setup, "nav.down");

    expect(latestTheme?.name).toBe("catppuccin-macchiato");

    await act(async () => {
      await second.setup.dispose();
    });
  });

  it("applies and closes on nav.activate", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker({ persist });

    await runOverlayAction(setup, "nav.down");
    await runOverlayAction(setup, "nav.activate");

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith("catppuccin-macchiato", null);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(latestTheme?.name).toBe("catppuccin-macchiato");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("restores the previous theme on overlay.close", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker({ persist });

    await runOverlayAction(setup, "nav.down");
    expect(latestTheme?.name).toBe("catppuccin-macchiato");

    await runOverlayAction(setup, "overlay.close");

    expect(latestTheme?.name).toBe("catppuccin-mocha");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(persist).not.toHaveBeenCalled();

    await act(async () => {
      await setup.dispose();
    });
  });
});

describe("ThemePicker handler ownership", () => {
  it("registers only overlay-scoped handlers", async () => {
    const { setup } = await renderPicker();

    for (const actionId of [
      "nav.up",
      "nav.down",
      "nav.activate",
      "overlay.close",
      "focus.next",
      "focus.previous",
    ]) {
      expect(resolveActionHandler(actionId, "overlay"), actionId).toBeDefined();
    }

    expect(resolveActionHandler("app.themePicker", "global")).toBeUndefined();
    expect(resolveActionHandler("app.themePicker", "overlay")).toBeUndefined();

    await act(async () => {
      await setup.dispose();
    });

    expect(resolveActionHandler("nav.up", "overlay")).toBeUndefined();
  });
});
