import type {
  ModalControlCycle,
  ModalControlDirection,
} from "@/app/hooks/useModalControlCycle.types";
import type { ThemeFileDefinition, ThemeWriteResult } from "@/domain/config/config.types";
import type { ThemeCatalogue } from "@/domain/theme/theme.catalogue.types";
import type {
  HexColor,
  ResolvedTheme,
  ThemeColorCapability,
  ThemeTokens,
  ThemeVariant,
} from "@/domain/theme/theme.types";
import type { ThemeControls } from "@/theme/ThemeContext.types";
import type { ButtonProps } from "@/ui/Button.types";

/** One picker row before the active marker is applied. */
export interface ThemePickerBaseRow {
  /** Catalogue theme name the row applies. */
  readonly name: string;
  /** Display name from the theme catalogue. */
  readonly label: string;
  /** Light or dark classification; the tab states it, so the row does not repeat it. */
  readonly variant: ThemeVariant;
  /** Swatch fill color from the capability-mapped theme, or `null` when the terminal has no color. */
  readonly swatchColor: HexColor | null;
  /** Truecolor token table, written as-is when the row is exported to a theme file. */
  readonly tokens: ThemeTokens;
}

/** One selectable theme row. */
export interface ThemePickerRow extends ThemePickerBaseRow {
  /** True for the theme currently rendered, including during a preview. */
  readonly active: boolean;
}

/** Rows split into the two variant tabs the picker renders. */
export interface ThemePickerVariantRows {
  /** Dark rows, in display order. */
  readonly dark: readonly ThemePickerRow[];
  /** Light rows, in display order. */
  readonly light: readonly ThemePickerRow[];
}

/**
 * Focus zone inside the picker.
 *
 * The tab bar, the custom theme rows, and the modal footer actions are the three keyboard
 * destinations. `focus.next` and `focus.previous` cycle them in that order and wrap, and the tab bar
 * is never natively focused, because a natively focused `<tab-select>` would take `nav.up`,
 * `nav.down`, and `nav.activate` away from the rows and Apply. Up and Down always move into the rows,
 * Left and Right always move into the footer buttons, and `[` and `]` switch tabs.
 */
export type ThemePickerFocusZone = "tabs" | "rows" | "actions";

/** Footer controls of the picker, in horizontal display order. */
export type ThemePickerControl = "export" | "cancel" | "apply";

/**
 * Persists one selected theme.
 *
 * The picker reads the resolved `config.json` path from `ConfigProvider` and passes it here, so a
 * test can substitute a writer without touching the filesystem.
 */
export type ThemePersist = (name: string, configPath: string | null) => Promise<ThemeWriteResult>;

/**
 * Writes one complete theme file.
 *
 * The picker reads the resolved themes directory from `ConfigProvider` and passes it here, so a test
 * can substitute a writer without touching the filesystem.
 */
export type ThemeExport = (
  definition: ThemeFileDefinition,
  themesDir: string | null,
) => Promise<ThemeWriteResult>;

/** Inputs accepted by `useThemePicker`. */
export interface UseThemePickerOptions {
  /** Closes the overlay that renders the picker. */
  readonly onClose: () => void;
  /** Persistence override used by tests; defaults to `config.writer.ts`. */
  readonly persist?: ThemePersist;
  /** Theme file writer override used by tests; defaults to `config.themes.write.ts`. */
  readonly exportTheme?: ThemeExport;
}

/** Search state and focus trigger owned by the picker filter. */
export interface ThemePickerSearch {
  /** Current text in the search field. */
  readonly query: string;
  /** Settled query the rows are filtered by. */
  readonly activeQuery: string;
  /** True when the settled query has visible text. */
  readonly hasQuery: boolean;
  /** Replaces the search text. */
  readonly setQuery: (value: string) => void;
  /** Clears the search text. */
  readonly clearSearch: () => void;
  /** Moves native focus to the search field. */
  readonly focusSearch: () => void;
}

/** Picker state and handlers consumed by `ThemePicker`. */
export interface ThemePickerHandle {
  /** Rows of the active tab, sorted by name and filtered by the settled search query. */
  readonly rows: readonly ThemePickerRow[];
  /** Index of the highlighted row inside the filtered rows. */
  readonly highlightedIndex: number;
  /** Footer control that currently owns the horizontal cycle. */
  readonly focusedControl: ThemePickerControl;
  /** Zone that currently owns the keyboard: tabs, theme rows, or footer actions. */
  readonly focusedZone: ThemePickerFocusZone;
  /** Variant tab that owns the list, which is the tab the picker opened on. */
  readonly variant: ThemeVariant;
  /** True when the settled query has visible text. */
  readonly hasQuery: boolean;
  /** Empty-list message, or `null` when the active tab has visible rows. */
  readonly emptyMessage: string | null;
  /** `theme.json` note, or `null` when the file is absent. */
  readonly note: string | null;
  /** Export, Cancel, and Apply actions in display order. */
  readonly actions: readonly ButtonProps[];
  /** Current text in the search field. */
  readonly query: string;
  /** Replaces the search text. */
  readonly setQuery: (value: string) => void;
  /** Highlights one row and previews its theme. */
  readonly select: (index: number) => void;
  /** Switches the visible tab without moving the keyboard focus. */
  readonly selectVariant: (variant: ThemeVariant) => void;
  /** Moves the keyboard focus to the theme rows. */
  readonly focusRows: () => void;
}

/**
 * View state of the picker, shared by its commit and navigation hooks.
 *
 * The state hook owns the highlight, the variant tab, the focus zone, the render-once guards, and the
 * footer cycle, so the hooks that read them never hold a second copy of the same view state.
 */
export interface ThemePickerViewState {
  /** Theme currently rendered, including a live preview. */
  readonly theme: ResolvedTheme;
  /** Session-only preview, commit, and restore controls. */
  readonly controls: ThemeControls;
  /** Rows of the active tab, sorted by name and filtered by the settled search query. */
  readonly rows: readonly ThemePickerRow[];
  /** Index of the highlighted row inside the filtered rows. */
  readonly highlightedIndex: number;
  /** Stores the highlighted theme by name; the highlight previews through the state effect. */
  readonly setHighlightedName: (name: string) => void;
  /** Variant tab that owns the list. */
  readonly variant: ThemeVariant;
  /** Switches the visible tab; the highlight effect previews the new first row when needed. */
  readonly selectVariant: (variant: ThemeVariant) => void;
  /**
   * Switches to the tab one horizontal step away, reading the live tab rather than the last render.
   *
   * The ref-backed read is what lets two bracket presses in one uncommitted frame advance twice.
   */
  readonly selectAdjacentVariant: (direction: ModalControlDirection) => void;
  /** Moves the keyboard focus to the theme rows. */
  readonly focusRows: () => void;
  /** Zone that currently owns the keyboard. */
  readonly focusedZone: ThemePickerFocusZone;
  /** Moves the keyboard between the tabs, the theme rows, and the footer actions. */
  readonly setFocusedZone: (zone: ThemePickerFocusZone) => void;
  /** Footer cycle that owns Up, Down, Left, and Right inside the footer and the tabs. */
  readonly cycle: ModalControlCycle<ThemePickerControl>;
  /** Theme name active when the picker opened, restored by a cancel or an unmount. */
  readonly previousName: string;
  /** Current text in the search field. */
  readonly query: string;
  /** Replaces the search text. */
  readonly setQuery: (value: string) => void;
  /** Marks the picker as settled so the unmount guard stops restoring the previous theme. */
  readonly settle: () => void;
}

/** Handlers that close the picker after applying or discarding the highlight. */
export interface ThemePickerCommit {
  /** Commits the highlighted theme, persists it, and closes the picker. */
  readonly apply: () => void;
  /** Restores the theme that was active when the picker opened and closes it. */
  readonly cancel: () => void;
  /** Writes the highlighted theme to a user theme file without closing the picker. */
  readonly exportTheme: () => void;
}

/** Inputs accepted by `useThemePickerCommit`. */
export interface UseThemePickerCommitOptions {
  /** Overlay close callback plus persistence and export overrides. */
  readonly options: UseThemePickerOptions;
  /** View state the commit reads and settles. */
  readonly state: ThemePickerViewState;
}

/** Inputs accepted by `useThemePickerNavigation`. */
export interface UseThemePickerNavigationOptions {
  /** View state the navigation reads and writes. */
  readonly state: ThemePickerViewState;
  /** Commit handlers the activation keys run. */
  readonly commit: ThemePickerCommit;
}

/** Keyboard handlers the picker registers and the view can reuse. */
export interface ThemePickerNavigation {
  /** Highlights one row and previews its theme. */
  readonly select: (index: number) => void;
  /** Moves the highlight by one row and previews the new row. */
  readonly move: (delta: number) => void;
  /** Runs the focused footer control, or moves from the tabs into the rows. */
  readonly activate: () => void;
  /** Moves keyboard focus one zone forward or backward, wrapping at both ends. */
  readonly moveZone: (delta: number) => void;
}

/** Inputs accepted by `useThemePickerRows`. */
export interface UseThemePickerRowsOptions {
  /** Catalogue that owns the row identities and their order. */
  readonly catalogue: ThemeCatalogue;
  /** Terminal capability that decides the final swatch color. */
  readonly capability: ThemeColorCapability;
  /** Theme currently rendered, including a live preview. */
  readonly activeName: string;
  /** Tab that owns the list. */
  readonly variant: ThemeVariant;
  /** Settled query the rows are filtered by. */
  readonly activeQuery: string;
}

/** Highlighted theme name of the picker. */
export interface ThemePickerHighlight {
  /** Theme name the highlight is stored under. */
  readonly highlightedName: string;
  /** Stores the highlighted theme by name; the highlight effect previews the fallback row. */
  readonly setHighlightedName: (name: string) => void;
}

/** Inputs accepted by `useThemePickerHighlight`. */
export interface UseThemePickerHighlightOptions {
  /** Rows visible in the active tab. */
  readonly rows: readonly ThemePickerRow[];
  /** Theme name the picker mounted on. */
  readonly initialName: string;
  /** Session-only preview controls the fallback previews through. */
  readonly controls: ThemeControls;
}

/** Previous theme name and the restore guard of the picker. */
export interface ThemePickerSession {
  /** Theme name active when the picker opened, restored by a cancel or an unmount. */
  readonly previousName: string;
  /** Marks the picker as settled so the unmount guard stops restoring the previous theme. */
  readonly settle: () => void;
}

/** Inputs accepted by `useThemePickerSession`. */
export interface UseThemePickerSessionOptions {
  /** Theme name the picker mounted on. */
  readonly themeName: string;
  /** Session-only preview, commit, and restore controls. */
  readonly controls: ThemeControls;
}

/** Visible variant tab and its switchers. */
export interface ThemePickerVariantTab {
  /** Variant tab that owns the list. */
  readonly variant: ThemeVariant;
  /** Switches the visible tab; the highlight effect previews the new first row when needed. */
  readonly selectVariant: (variant: ThemeVariant) => void;
  /**
   * Switches to the tab one horizontal step away, reading the live tab rather than the last render.
   *
   * The ref-backed read is what lets two bracket presses in one uncommitted frame advance twice.
   */
  readonly selectAdjacentVariant: (direction: ModalControlDirection) => void;
}

/** Keyboard focus state of the picker, shared by its state and navigation hooks. */
export interface ThemePickerFocus {
  /** Zone that currently owns the keyboard. */
  readonly focusedZone: ThemePickerFocusZone;
  /** Moves the keyboard between the tabs, the theme rows, and the footer actions. */
  readonly setFocusedZone: (zone: ThemePickerFocusZone) => void;
  /** Moves the keyboard focus to the theme rows. */
  readonly focusRows: () => void;
  /** Footer cycle that owns Up, Down, Left, and Right inside the footer and the tabs. */
  readonly cycle: ModalControlCycle<ThemePickerControl>;
}
