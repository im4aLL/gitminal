import type { ModalControlCycle } from "@/app/hooks/useModalControlCycle.types";
import type { ThemeWriteResult } from "@/domain/config/config.types";
import type { HexColor, ResolvedTheme, ThemeName, ThemeVariant } from "@/domain/theme/theme.types";
import type { ThemeControls } from "@/theme/ThemeContext.types";
import type { ButtonProps } from "@/ui/Button.types";

/** One selectable theme row. */
export interface ThemePickerRow {
  /** Built-in theme name the row applies. */
  readonly name: ThemeName;
  /** Display name from the flavor catalogue. */
  readonly label: string;
  /** Light or dark classification shown next to the name. */
  readonly variant: ThemeVariant;
  /** True for the theme currently rendered, including during a preview. */
  readonly active: boolean;
  /** Swatch fill color from the capability-mapped theme, or `null` when the terminal has no color. */
  readonly swatchColor: HexColor | null;
}

/**
 * Focus zone inside the picker.
 *
 * The picker has two keyboard destinations: the custom theme rows, where movement previews a theme,
 * and the modal footer actions. `focus.next` and `focus.previous` move between them.
 */
export type ThemePickerFocusZone = "rows" | "actions";

/** Footer controls of the picker, in vertical navigation order. */
export type ThemePickerControl = "cancel" | "apply";

/**
 * Persists one selected theme.
 *
 * The picker reads the resolved `config.json` path from `ConfigProvider` and passes it here, so a
 * test can substitute a writer without touching the filesystem.
 */
export type ThemePersist = (name: string, configPath: string | null) => Promise<ThemeWriteResult>;

/** Inputs accepted by `useThemePicker`. */
export interface UseThemePickerOptions {
  /** Closes the overlay that renders the picker. */
  readonly onClose: () => void;
  /** Persistence override used by tests; defaults to `config.writer.ts`. */
  readonly persist?: ThemePersist;
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
  /** Rows in picker order, filtered by the settled search query. */
  readonly rows: readonly ThemePickerRow[];
  /** Index of the highlighted row inside the filtered rows. */
  readonly highlightedIndex: number;
  /** Footer control that currently owns the horizontal cycle. */
  readonly focusedControl: ThemePickerControl;
  /** Zone that currently owns the keyboard: the theme rows or the footer actions. */
  readonly focusedZone: ThemePickerFocusZone;
  /** `theme.json` note, or `null` when the file is absent. */
  readonly note: string | null;
  /** Cancel and Apply actions in display order. */
  readonly actions: readonly ButtonProps[];
  /** Current text in the search field. */
  readonly query: string;
  /** Replaces the search text. */
  readonly setQuery: (value: string) => void;
  /** Highlights one row and previews its theme. */
  readonly select: (index: number) => void;
}

/**
 * View state of the picker, shared by its commit and navigation hooks.
 *
 * The state hook owns the highlight, the focus zone, the render-once guards, and the footer cycle, so
 * the hooks that read them never hold a second copy of the same view state.
 */
export interface ThemePickerViewState {
  /** Theme currently rendered, including a live preview. */
  readonly theme: ResolvedTheme;
  /** Session-only preview, commit, and restore controls. */
  readonly controls: ThemeControls;
  /** Rows in picker order, filtered by the settled search query. */
  readonly rows: readonly ThemePickerRow[];
  /** Index of the highlighted row inside the filtered rows. */
  readonly highlightedIndex: number;
  /** Stores the highlighted theme by name; the highlight previews through the state effect. */
  readonly setHighlightedName: (name: ThemeName) => void;
  /** Zone that currently owns the keyboard. */
  readonly focusedZone: ThemePickerFocusZone;
  /** Moves the keyboard between the theme rows and the footer actions. */
  readonly setFocusedZone: (zone: ThemePickerFocusZone) => void;
  /** Footer cycle that owns Left and Right inside the actions. */
  readonly cycle: ModalControlCycle<ThemePickerControl>;
  /** Theme name active when the picker opened, restored by a cancel or an unmount. */
  readonly previousName: ThemeName;
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
}

/** Inputs accepted by `useThemePickerCommit`. */
export interface UseThemePickerCommitOptions {
  /** Overlay close callback and optional persistence override. */
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
  /** Runs the focused footer control. */
  readonly activate: () => void;
  /** Moves keyboard focus between the theme rows and the modal footer actions. */
  readonly moveZone: () => void;
}
