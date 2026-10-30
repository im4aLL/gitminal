import { useMemo } from "react";
import { useConfig } from "@/app/hooks/useConfig";
import type { ConfigFileLoad } from "@/domain/config/config.types";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import {
  THEME_PICKER_APPLY_BUTTON_ID,
  THEME_PICKER_APPLY_LABEL,
  THEME_PICKER_CANCEL_BUTTON_ID,
  THEME_PICKER_CANCEL_LABEL,
  THEME_PICKER_EMPTY_MESSAGES,
  THEME_PICKER_EXPORT_BUTTON_ID,
  THEME_PICKER_EXPORT_LABEL,
  THEME_PICKER_NO_MATCH_PREFIX,
  THEME_PICKER_NOTE_PREFIX,
} from "@/features/theme-picker/ThemePicker.constants";
import type {
  ThemePickerCommit,
  ThemePickerControl,
  ThemePickerFocusZone,
  ThemePickerHandle,
  ThemePickerSearch,
  UseThemePickerOptions,
} from "@/features/theme-picker/useThemePicker.types";
import { useThemePickerCommit } from "@/features/theme-picker/useThemePickerCommit";
import { useThemePickerNavigation } from "@/features/theme-picker/useThemePickerNavigation";
import { useThemePickerSearch } from "@/features/theme-picker/useThemePickerSearch";
import { useThemePickerState } from "@/features/theme-picker/useThemePickerState";
import type { ButtonProps } from "@/ui/Button.types";

/**
 * Owns the theme picker's highlight, live preview, persistence, export, and tab state.
 *
 * The highlighted row previews immediately through `ThemeProvider`, so moving the highlight is a live
 * preview and never re-reads a file. The search field narrows the active tab, and switching tabs or
 * filtering keeps the highlighted theme highlighted while it stays visible. Enter or Apply commits the
 * highlighted theme, writes the `theme` field through `config.writer.ts`, and closes; a write that
 * fails keeps the theme applied for the session and shows the documented warning. Esc or Cancel
 * restores the theme that was active when the picker opened. Export is a footer control: it writes the
 * highlighted theme as a user theme file and leaves the picker open.
 *
 * Every handler this hook registers is overlay-scoped: `nav.up` and `nav.down` move the row highlight
 * and always hand the keyboard to the rows, `nav.left` and `nav.right` move the keyboard into the
 * footer and navigate its buttons, `nav.activate` runs the focused control, `focus.next` and
 * `focus.previous` cycle the tabs, rows, and footer actions, and `overlay.close` restores and closes.
 * The `app.themePicker` global action belongs to the app layer and is never registered here.
 *
 * @param options - Overlay close callback plus persistence and export overrides.
 * @returns The rows, highlight, tab, note, empty message, and footer actions the view renders.
 */
export function useThemePicker(options: UseThemePickerOptions): ThemePickerHandle {
  const config = useConfig();
  const search = useThemePickerSearch();
  const state = useThemePickerState(search);
  const commit = useThemePickerCommit({ options, state });
  const navigation = useThemePickerNavigation({ state, commit });
  const note = readOverrideNote(config.files);
  const actions = useMemo(
    () => buildActions(state.cycle.control, state.focusedZone, commit),
    [commit, state.cycle.control, state.focusedZone],
  );

  return {
    rows: state.rows,
    highlightedIndex: state.highlightedIndex,
    focusedControl: state.cycle.control,
    focusedZone: state.focusedZone,
    variant: state.variant,
    hasQuery: search.hasQuery,
    emptyMessage: readEmptyMessage(state.rows.length, search, state.variant),
    note,
    actions,
    query: search.query,
    setQuery: search.setQuery,
    select: navigation.select,
    selectVariant: state.selectVariant,
    focusRows: state.focusRows,
  };
}

/**
 * Builds the Export, Cancel, and Apply actions in display order.
 *
 * Export comes first because it is the only non-terminal control: it writes a file and keeps the
 * picker open, while the other two close it. The footer keeps Cancel and Apply in their existing
 * order, so the Left and Right rule still lands on the same controls it did before Export existed.
 *
 * @param control - Footer control that currently owns the horizontal cycle.
 * @param zone - Zone that currently owns the keyboard; footer actions show focus only from `actions`.
 * @param commit - Apply, cancel, and export handlers.
 * @returns The footer actions with their focus state.
 */
function buildActions(
  control: ThemePickerControl,
  zone: ThemePickerFocusZone,
  commit: ThemePickerCommit,
): readonly ButtonProps[] {
  return [
    {
      id: THEME_PICKER_EXPORT_BUTTON_ID,
      label: THEME_PICKER_EXPORT_LABEL,
      focused: zone === "actions" && control === "export",
      onPress: commit.exportTheme,
    },
    {
      id: THEME_PICKER_CANCEL_BUTTON_ID,
      label: THEME_PICKER_CANCEL_LABEL,
      focused: zone === "actions" && control === "cancel",
      onPress: commit.cancel,
    },
    {
      id: THEME_PICKER_APPLY_BUTTON_ID,
      label: THEME_PICKER_APPLY_LABEL,
      focused: zone === "actions" && control === "apply",
      onPress: commit.apply,
    },
  ];
}

/**
 * Reads the message a list with no visible rows shows.
 *
 * The two empty states are deliberately different. An active query explains that the filter found
 * nothing and quotes the query, while a tab with no themes at all states the absence per variant, so a
 * user who only has dark themes is not told their search failed.
 *
 * @param rowCount - Number of rows visible in the active tab.
 * @param search - Search state of the picker.
 * @param variant - Variant tab that owns the list.
 * @returns The empty message, or `null` when rows are visible.
 */
function readEmptyMessage(
  rowCount: number,
  search: ThemePickerSearch,
  variant: ThemeVariant,
): string | null {
  if (rowCount > 0) {
    return null;
  }

  if (search.hasQuery) {
    return `${THEME_PICKER_NO_MATCH_PREFIX} "${search.activeQuery}"`;
  }

  return THEME_PICKER_EMPTY_MESSAGES[variant];
}

/**
 * Builds the `theme.json` note.
 *
 * The note appears only when the file exists, so an unconfigured install never claims overrides that
 * are not there. A file that failed to load still shows the note, because the reader needs to know
 * why the colors did not change. The note states the rule only; the resolved path is shown in the
 * help Configuration section, because a fixed-width picker would clip a long path.
 *
 * @param files - Per-file load outcomes from `ConfigProvider`.
 * @returns The note text, or `null` when no theme file exists.
 */
function readOverrideNote(files: readonly ConfigFileLoad[]): string | null {
  const themeFile = files.find((file) => file.key === "theme");

  if (themeFile === undefined || themeFile.status === "missing") {
    return null;
  }

  return THEME_PICKER_NOTE_PREFIX;
}
