import { useTheme } from "@/app/hooks/useTheme";
import { readHighlightedIndex } from "@/features/theme-picker/ThemePicker.rows";
import type {
  ThemePickerSearch,
  ThemePickerViewState,
} from "@/features/theme-picker/useThemePicker.types";
import { useThemePickerFocus } from "@/features/theme-picker/useThemePickerFocus";
import { useThemePickerHighlight } from "@/features/theme-picker/useThemePickerHighlight";
import { useThemePickerRows } from "@/features/theme-picker/useThemePickerRows";
import { useThemePickerSession } from "@/features/theme-picker/useThemePickerSession";
import { useThemePickerVariant } from "@/features/theme-picker/useThemePickerVariant";
import { useThemeCatalogue } from "@/theme/useThemeCatalogue";
import { useThemeControls } from "@/theme/useThemeControls";

/**
 * Composes the picker's view state from one hook per concern.
 *
 * The picker's view state is five independent concerns, so each one owns its own hook: the rendered
 * rows and their filter (`useThemePickerRows`), the highlighted name and its fallback
 * (`useThemePickerHighlight`), the visible tab (`useThemePickerVariant`), the keyboard zone and its
 * footer cycle (`useThemePickerFocus`), and the previous-name restore guard
 * (`useThemePickerSession`). This hook only reads the shared context and composes the pieces, which
 * keeps each concern's hook small enough to read and leaves one owner per piece of state.
 *
 * The highlight is the live preview: changing it writes the provider through `ThemeControls`, so the
 * picker never re-reads a file and never persists a preview. Rows come from the provider's theme
 * catalogue rather than the static registry, so a user theme and the detected Native Terminal entry
 * are listed without a second code path.
 *
 * @param search - Search state the rows are filtered by and the view renders.
 * @returns The view state the commit and navigation hooks share.
 */
export function useThemePickerState(search: ThemePickerSearch): ThemePickerViewState {
  const theme = useTheme();
  const controls = useThemeControls();
  const catalogue = useThemeCatalogue();
  const tab = useThemePickerVariant(theme.variant);
  const rows = useThemePickerRows({
    catalogue,
    capability: theme.capability,
    activeName: theme.name,
    variant: tab.variant,
    activeQuery: search.activeQuery,
  });
  const highlight = useThemePickerHighlight({ rows, initialName: theme.name, controls });
  const session = useThemePickerSession({ themeName: theme.name, controls });
  const focus = useThemePickerFocus();

  return {
    theme,
    controls,
    rows,
    highlightedIndex: readHighlightedIndex(rows, highlight.highlightedName),
    setHighlightedName: highlight.setHighlightedName,
    variant: tab.variant,
    selectVariant: tab.selectVariant,
    selectAdjacentVariant: tab.selectAdjacentVariant,
    focusRows: focus.focusRows,
    focusedZone: focus.focusedZone,
    setFocusedZone: focus.setFocusedZone,
    cycle: focus.cycle,
    previousName: session.previousName,
    query: search.query,
    setQuery: search.setQuery,
    settle: session.settle,
  };
}
