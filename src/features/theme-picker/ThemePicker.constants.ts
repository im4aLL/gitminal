import type { ThemeVariant } from "@/domain/theme/theme.types";

/** Overlay entry id of the theme picker. */
export const THEME_PICKER_OVERLAY_ID = "theme-picker";

/** Modal title. */
export const THEME_PICKER_TITLE = "Theme";

/** Modal width in cells before the frame clamps it to the terminal. */
export const THEME_PICKER_WIDTH = 70;

/** Footer label of the cancel action. */
export const THEME_PICKER_CANCEL_LABEL = "Cancel";

/** Footer label of the apply action. */
export const THEME_PICKER_APPLY_LABEL = "Apply";

/** Footer label of the export action. */
export const THEME_PICKER_EXPORT_LABEL = "Export";

/** Button id of the cancel action. */
export const THEME_PICKER_CANCEL_BUTTON_ID = "theme-picker-cancel";

/** Button id of the apply action. */
export const THEME_PICKER_APPLY_BUTTON_ID = "theme-picker-apply";

/** Button id of the export action. */
export const THEME_PICKER_EXPORT_BUTTON_ID = "theme-picker-export";

/** Status shown when the theme applied for the session but could not be saved. */
export const THEME_SAVE_FAILED_MESSAGE = "theme applied for this session; could not save";

/** Prefix of the success status shown after the theme is written. */
export const THEME_SAVED_MESSAGE_PREFIX = "Theme saved:";

/** Prefix of the success status shown after a theme file is written. */
export const THEME_EXPORTED_MESSAGE_PREFIX = "Theme exported:";

/** Status shown when the theme file could not be written. */
export const THEME_EXPORT_FAILED_MESSAGE = "could not export the theme";

/** Note shown below the list when `theme.json` exists. */
export const THEME_PICKER_NOTE_PREFIX = "theme.json overrides apply over every theme";

/** Stable renderable id of the theme picker search input. */
export const THEME_PICKER_SEARCH_INPUT_ID = "theme-picker-search";

/** Placeholder shown in the theme picker search input. */
export const THEME_PICKER_SEARCH_PLACEHOLDER = "Search themes";

/** Action id that focuses the theme picker search field. */
export const THEME_PICKER_SEARCH_ACTION_ID = "overlay.search";

/** Quiet interval before the theme picker search filters, in milliseconds. */
export const THEME_PICKER_SEARCH_DEBOUNCE_MS = 60;

/** Stable renderable id of the theme picker row list. */
export const THEME_PICKER_LIST_ID = "theme-picker-list";

/** Stable renderable id of the theme picker tab bar. */
export const THEME_PICKER_TABS_ID = "theme-picker-tabs";

/** Width of one tab in the picker tab bar, in cells. */
export const THEME_PICKER_TAB_WIDTH = 12;

/**
 * Maximum rows the picker list shows before it scrolls.
 *
 * The value leaves room for the tab bar, the search field, the optional `theme.json` note, and the
 * footer inside the modal's terminal-height clamp, so a full list never pushes the footer or the note
 * out of view on a short terminal.
 */
export const THEME_PICKER_MAX_VISIBLE_ROWS = 10;

/** Message shown when the filter matches no theme. */
export const THEME_PICKER_NO_MATCH_PREFIX = "No themes match";

/** Variant tabs in bar order. */
export const THEME_PICKER_TAB_VARIANTS: readonly ThemeVariant[] = Object.freeze(["dark", "light"]);

/** Tab labels, keyed by the variant each tab lists. */
export const THEME_PICKER_TAB_LABELS: Readonly<Record<ThemeVariant, string>> = Object.freeze({
  dark: "Dark",
  light: "Light",
});

/** Empty-list message of a variant tab that has no themes at all. */
export const THEME_PICKER_EMPTY_MESSAGES: Readonly<Record<ThemeVariant, string>> = Object.freeze({
  dark: "No dark themes installed",
  light: "No light themes installed",
});
