import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
  type InputRenderable,
  type Renderable,
  type ScrollBoxRenderable,
  type TabSelectRenderable,
  type TextNodeRenderable,
  TextRenderable,
} from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act, type ReactNode, useState } from "react";
import { resetInputModes } from "@/app/hooks/inputMode.registry";
import { resetActionRegistry, resolveActionHandler } from "@/app/hooks/useAction";
import { useHotkeys } from "@/app/hooks/useHotkeys";
import { clearFocusedInput, resetInputEscapeClear } from "@/app/hooks/useInputEscapeClear";
import { useTheme } from "@/app/hooks/useTheme";
import { DEFAULT_CONFIG, UNRESOLVED_CONFIG_PATHS } from "@/domain/config/config.defaults";
import type { ThemeWriteResult } from "@/domain/config/config.types";
import { createBuiltInCatalogue } from "@/domain/theme/theme.catalogue";
import { THEMES } from "@/domain/theme/theme.registry";
import type { ResolvedTheme, ThemeColorCapability, ThemeVariant } from "@/domain/theme/theme.types";
import { ThemePicker } from "@/features/theme-picker/ThemePicker";
import {
  THEME_PICKER_LIST_ID,
  THEME_PICKER_MAX_VISIBLE_ROWS,
  THEME_PICKER_SEARCH_INPUT_ID,
  THEME_PICKER_TAB_WIDTH,
  THEME_PICKER_TABS_ID,
} from "@/features/theme-picker/ThemePicker.constants";
import { themeRowId } from "@/features/theme-picker/ThemeRow";
import type { ThemeExport } from "@/features/theme-picker/useThemePicker.types";
import { AppTestProviders } from "@/test/app.harness";
import { createFakeGitClient } from "@/test/git.fake";
import { ICONS } from "@/theme/icons";

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
  catalogue: createBuiltInCatalogue(),
};

/** Snapshot with a theme file, so the override note is present. */
const OVERRIDE_SNAPSHOT: TestConfigSnapshot = {
  ...PLAIN_SNAPSHOT,
  paths: Object.freeze({
    config: "/cfg/config.json",
    keybindings: null,
    theme: "/cfg/theme.json",
    themesDir: "/cfg/themes",
  }),
  files: Object.freeze([
    { key: "theme", status: "loaded", value: { colors: {} }, path: "/cfg/theme.json" },
  ]),
  themeOverrides: { colors: {} },
};

/** Snapshot whose catalogue has no light themes. */
const DARK_ONLY_SNAPSHOT: TestConfigSnapshot = {
  ...PLAIN_SNAPSHOT,
  catalogue: Object.freeze({
    entries: Object.freeze(
      createBuiltInCatalogue().entries.filter((entry) => entry.variant === "dark"),
    ),
    warnings: Object.freeze([]),
  }),
};

/** Every built-in theme name. */
const BUILT_IN_NAMES: readonly string[] = Object.keys(THEMES);

/**
 * Reads every built-in theme name of one variant, alphabetically.
 *
 * @param variant - Light or dark classification.
 * @returns The matching names in ascending order.
 */
function namesOf(variant: ThemeVariant): readonly string[] {
  return BUILT_IN_NAMES.filter(
    (name) => THEMES[name as keyof typeof THEMES].variant === variant,
  ).sort();
}

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
 * Installs the real keyboard dispatcher inside the picker's provider stack.
 *
 * @returns Nothing; the hook only registers the renderer key handler.
 */
function HotkeyProbe(): null {
  useHotkeys();

  return null;
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
    readonly exportTheme?: ThemeExport;
    readonly snapshot?: TestConfigSnapshot;
    readonly capability?: ThemeColorCapability;
    readonly hotkeys?: boolean;
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
      {options.hotkeys === true ? <HotkeyProbe /> : null}
      <ThemePicker onClose={onClose} persist={options.persist} exportTheme={options.exportTheme} />
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
 * Reads the rendered text of one theme row.
 *
 * @param setup - Renderer setup.
 * @param name - Theme name the row identity is built from.
 * @returns The row's text content, or an empty string when the row is not rendered.
 */
function readRowText(setup: Awaited<ReturnType<typeof testRender>>, name: string): string {
  const row = setup.renderer.root.findDescendantById(themeRowId(name));

  return row === undefined ? "" : collectText(row);
}

/**
 * Reads the tab names the tab bar currently renders.
 *
 * @param setup - Renderer setup.
 * @returns The option names in bar order.
 */
function readTabNames(setup: Awaited<ReturnType<typeof testRender>>): readonly string[] {
  const tabs = setup.renderer.root.findDescendantById(THEME_PICKER_TABS_ID) as
    | TabSelectRenderable
    | undefined;

  return tabs?.options.map((option) => option.name) ?? [];
}

/**
 * Collects the text of one renderable and its descendants.
 *
 * `<text>` elements keep their content in the text node tree rather than in `chunks`, so a text
 * renderable is read through its root text node while any other renderable recurses through its
 * child renderables.
 *
 * @param renderable - Renderable to read.
 * @returns The concatenated text content.
 */
function collectText(renderable: Renderable): string {
  if (renderable instanceof TextRenderable) {
    return collectTextNode(renderable.textNode);
  }

  return renderable
    .getChildren()
    .map((child) => collectText(child))
    .join("");
}

/**
 * Collects the text of one text node and its nested span nodes.
 *
 * String children contribute their own text, and nested span nodes are walked recursively, so
 * content placed in `<span>` children is included.
 *
 * @param node - Text node to read.
 * @returns The concatenated text content.
 */
function collectTextNode(node: TextNodeRenderable): string {
  return node.children
    .map((child) => (typeof child === "string" ? child : collectTextNode(child)))
    .join("");
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
 * Flushes the render and highlight-fallback effects that follow a state change.
 *
 * @param setup - Renderer setup.
 */
async function flushFrame(setup: Awaited<ReturnType<typeof testRender>>): Promise<void> {
  await act(async () => {
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
  it("renders the variant tabs and one custom row per dark theme", async () => {
    const { setup } = await renderPicker();
    const frame = setup.captureCharFrame();
    const visible = namesOf("dark").slice(0, THEME_PICKER_MAX_VISIBLE_ROWS);

    for (const name of visible) {
      expect(setup.renderer.root.findDescendantById(themeRowId(name)), name).toBeDefined();
    }

    expect(frame).toContain("Theme");
    expect(frame).toContain("Dark");
    expect(frame).toContain("Light");
    expect(frame).toContain("Catppuccin Mocha");
    expect(frame).toContain("*");
    expect(frame).toContain("Export");
    expect(frame).toContain("Cancel");
    expect(frame).toContain("Apply");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("drops the redundant per-row variant label", async () => {
    const { setup } = await renderPicker();
    const row = readRowText(setup, "catppuccin-mocha");
    const frame = setup.captureCharFrame();

    expect(row).toContain("Catppuccin Mocha");
    expect(row).not.toMatch(/Dark|Light/);
    expect(frame).not.toContain(" dark");
    expect(frame).not.toContain(" light");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("renders the tab bar without native focus or the underline border", async () => {
    const { setup } = await renderPicker();
    const tabs = setup.renderer.root.findDescendantById(THEME_PICKER_TABS_ID) as
      | TabSelectRenderable
      | undefined;

    expect(tabs).toBeDefined();
    expect(tabs?.focusable).toBe(false);
    expect(tabs?.showUnderline).toBe(false);
    expect(tabs?.height).toBe(1);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("marks the selected tab only while the tab zone owns the keyboard", async () => {
    const { setup } = await renderPicker();

    expect(readTabNames(setup).some((name) => name.startsWith(ICONS.focus))).toBe(false);

    const rowsFrame = setup.captureCharFrame();

    expect(rowsFrame).not.toContain(`${ICONS.focus} Dark`);

    await runOverlayAction(setup, "focus.previous");
    await flushFrame(setup);

    const names = readTabNames(setup);
    const marked = names.filter((name) => name.startsWith(ICONS.focus));

    expect(marked).toHaveLength(1);
    expect(marked[0]).toBe(`${ICONS.focus} Dark`);
    expect(setup.captureCharFrame()).toContain(`${ICONS.focus} Dark`);
    expect(setup.captureCharFrame()).not.toBe(rowsFrame);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the list frame mounted for a tab with no themes", async () => {
    const { setup } = await renderPicker({ snapshot: DARK_ONLY_SNAPSHOT });

    await runOverlayAction(setup, "focus.previous");
    await runOverlayAction(setup, "theme.tabRight");
    await flushFrame(setup);

    expect(setup.renderer.root.findDescendantById(THEME_PICKER_LIST_ID)).toBeDefined();
    expect(setup.captureCharFrame()).toContain("No light themes installed");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("selects a clicked tab and moves the keyboard to the rows", async () => {
    const { setup } = await renderPicker();
    const tabs = setup.renderer.root.findDescendantById(THEME_PICKER_TABS_ID) as
      | TabSelectRenderable
      | undefined;

    expect(tabs).toBeDefined();

    await runOverlayAction(setup, "focus.previous");

    expect(readTabNames(setup).some((name) => name.startsWith(ICONS.focus))).toBe(true);

    await act(async () => {
      await setup.mockMouse.click(
        (tabs?.screenX ?? 0) + THEME_PICKER_TAB_WIDTH + 1,
        tabs?.screenY ?? 0,
      );
    });
    await flushFrame(setup);

    expect(setup.renderer.root.findDescendantById(themeRowId("catppuccin-latte"))).toBeDefined();
    expect(readTabNames(setup).some((name) => name.startsWith(ICONS.focus))).toBe(false);
    expect(setup.captureCharFrame()).not.toContain(`${ICONS.focus} Light`);

    const firstLight = latestTheme?.name;

    await runOverlayAction(setup, "nav.down");

    expect(latestTheme?.name).not.toBe(firstLight);

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
    const dark = namesOf("dark");
    const startIndex = dark.indexOf("catppuccin-mocha");
    const nextName = dark[startIndex + 1];

    expect(dark.length).toBeGreaterThan(THEME_PICKER_MAX_VISIBLE_ROWS);

    list.scrollChildIntoView = reveal;

    await runOverlayAction(setup, "nav.down");

    expect(reveal).toHaveBeenLastCalledWith(themeRowId(nextName ?? ""));

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

describe("ThemePicker tabs", () => {
  it("lists only the active tab and switches to the light tab", async () => {
    const { setup } = await renderPicker();

    expect(setup.renderer.root.findDescendantById(themeRowId("catppuccin-latte"))).toBeUndefined();

    await runOverlayAction(setup, "focus.previous");
    await runOverlayAction(setup, "theme.tabRight");

    expect(setup.renderer.root.findDescendantById(themeRowId("catppuccin-latte"))).toBeDefined();

    await flushFrame(setup);

    expect(setup.captureCharFrame()).toContain("Catppuccin Latte");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves into the rows on nav.activate from the tab bar", async () => {
    const { setup } = await renderPicker();

    await runOverlayAction(setup, "focus.previous");
    await runOverlayAction(setup, "nav.activate");
    await runOverlayAction(setup, "nav.down");

    expect(latestTheme?.name).not.toBe("catppuccin-mocha");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("shows the per-variant empty message for a tab with no themes", async () => {
    const { setup } = await renderPicker({ snapshot: DARK_ONLY_SNAPSHOT });

    await runOverlayAction(setup, "focus.previous");
    await runOverlayAction(setup, "theme.tabRight");

    await flushFrame(setup);

    expect(setup.captureCharFrame()).toContain("No light themes installed");

    await act(async () => {
      await setup.dispose();
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
      await setup.mockInput.typeText("mocha");
      await setup.renderOnce();
    });
    await waitFor(setup, () => !setup.captureCharFrame().includes("Catppuccin Frappe"));

    const frame = setup.captureCharFrame();

    expect(frame).toContain("Catppuccin Mocha");
    expect(frame).not.toContain("Catppuccin Frappe");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the printable overlay keys in the focused search field", async () => {
    const exportTheme = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup } = await renderPicker({ hotkeys: true, exportTheme });

    await runOverlayAction(setup, "overlay.search");

    await act(async () => {
      await setup.mockInput.typeText("e[]");
      await setup.renderOnce();
    });
    await flushFrame(setup);

    const input = setup.renderer.root.findDescendantById(THEME_PICKER_SEARCH_INPUT_ID) as
      | InputRenderable
      | undefined;

    expect(input?.value).toBe("e[]");
    expect(latestTheme?.variant).toBe("dark");
    expect(exportTheme).not.toHaveBeenCalled();

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
      await setup.mockInput.typeText("mocha");
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
    const dark = namesOf("dark");
    const startIndex = dark.indexOf("catppuccin-mocha");

    await runOverlayAction(setup, "nav.down");
    expect(latestTheme?.name).toBe(dark[startIndex + 1]);

    await runOverlayAction(setup, "nav.up");
    expect(latestTheme?.name).toBe("catppuccin-mocha");

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
    const previewed = readLatestTheme()?.name;

    expect(previewed).not.toBe("catppuccin-mocha");

    await act(async () => {
      hidePicker();
      await setup.renderOnce();
    });

    expect(readLatestTheme()?.name).toBe("catppuccin-mocha");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves between the zones with focus.next and focus.previous", async () => {
    const { setup, onClose } = await renderPicker();

    await runOverlayAction(setup, "focus.next");
    await runOverlayAction(setup, "nav.up");
    const applied = latestTheme?.name;
    await runOverlayAction(setup, "nav.activate");

    expect(latestTheme?.name).toBe(applied);
    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      await setup.dispose();
    });

    const second = await renderPicker();

    await runOverlayAction(second.setup, "focus.next");
    await runOverlayAction(second.setup, "focus.previous");
    await runOverlayAction(second.setup, "nav.down");

    expect(latestTheme?.name).not.toBe("catppuccin-mocha");

    await act(async () => {
      await second.setup.dispose();
    });
  });

  it("applies and closes on nav.activate", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker({ persist });

    await runOverlayAction(setup, "nav.down");
    const applied = latestTheme?.name;

    await runOverlayAction(setup, "nav.activate");

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith(applied, null);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(latestTheme?.name).toBe(applied);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("restores the previous theme on overlay.close", async () => {
    const persist = mock(async (): Promise<ThemeWriteResult> => ({ ok: true }));
    const { setup, onClose } = await renderPicker({ persist });

    await runOverlayAction(setup, "nav.down");
    expect(latestTheme?.name).not.toBe("catppuccin-mocha");

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
    const actionIds = [
      "nav.up",
      "nav.down",
      "nav.left",
      "nav.right",
      "nav.activate",
      "overlay.close",
      "focus.next",
      "focus.previous",
      "theme.tabLeft",
      "theme.tabRight",
      "theme.export",
    ];

    for (const actionId of actionIds) {
      expect(resolveActionHandler(actionId, "overlay"), actionId).toBeDefined();
    }

    expect(resolveActionHandler("app.themePicker", "global")).toBeUndefined();
    expect(resolveActionHandler("app.themePicker", "overlay")).toBeUndefined();

    await act(async () => {
      await setup.dispose();
    });

    for (const actionId of actionIds) {
      expect(resolveActionHandler(actionId, "overlay"), actionId).toBeUndefined();
    }
  });
});
