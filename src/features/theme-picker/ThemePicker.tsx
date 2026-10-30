import type { ScrollBoxRenderable } from "@opentui/core";
import { type ReactNode, useCallback, useMemo, useRef } from "react";
import { useScrollSelectedRow } from "@/app/hooks/useScrollSelectedRow";
import type { ScrollChildIntoViewTarget } from "@/app/hooks/useScrollSelectedRow.types";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import {
  THEME_PICKER_LIST_ID,
  THEME_PICKER_MAX_VISIBLE_ROWS,
  THEME_PICKER_SEARCH_INPUT_ID,
  THEME_PICKER_SEARCH_PLACEHOLDER,
  THEME_PICKER_TITLE,
  THEME_PICKER_WIDTH,
} from "@/features/theme-picker/ThemePicker.constants";
import type { ThemePickerProps } from "@/features/theme-picker/ThemePicker.types";
import { ThemePickerTabs } from "@/features/theme-picker/ThemePickerTabs";
import { ThemeRow, themeRowId } from "@/features/theme-picker/ThemeRow";
import { useThemePicker } from "@/features/theme-picker/useThemePicker";
import { useTokens } from "@/theme/useTokens";
import { EmptyState } from "@/ui/EmptyState";
import { ModalActions } from "@/ui/ModalActions";
import { ModalFrame } from "@/ui/ModalFrame";
import { ScrollableList } from "@/ui/ScrollableList";
import { SearchField } from "@/ui/SearchField";

/**
 * Renders the theme picker modal content.
 *
 * The entry content is exactly what `OverlayHost` renders inside `ModalFrame`: the variant tab bar,
 * the search field, the custom row list, the optional `theme.json` note, and the footer actions. The
 * list is a `<scrollbox>` of `ThemeRow` boxes with `viewportCulling`, not a `<select>`, because each
 * row carries a swatch and an active marker. Highlighting a row previews that theme live; Enter or
 * Apply persists it and closes, Export writes it as a theme file, and Esc or Cancel restores the theme
 * that was active when the picker opened.
 *
 * The tab bar is rendered above the search field, is never natively focused, and is driven from picker
 * state, so the rows keep Up, Down, and Enter while `[` and `]` switch tabs. While the tab zone owns
 * the keyboard the bar brightens and marks the selected tab with `ICONS.focus`, so the focus cycle is
 * visible without moving native focus. The list shows at most `THEME_PICKER_MAX_VISIBLE_ROWS`
 * rows of the active tab and keeps the highlighted row inside that viewport. The list frame is mounted
 * either way: when nothing is visible it renders one row that states why, a filter that matched
 * nothing or a tab with no themes, so the tab body keeps its shape instead of collapsing. That message
 * uses `EmptyState` rather than a state icon, because `ICONS.missingUpstream` is reserved for the
 * upstream state. The picker owns no global action and never reads a key itself: `useThemePicker`
 * registers only overlay-scoped handlers through the shared keymap.
 *
 * @param props - Overlay close callback plus persistence and export overrides.
 * @returns The theme picker modal.
 */
export function ThemePicker(props: ThemePickerProps): ReactNode {
  const tokens = useTokens();
  const scrollRef = useRef<ScrollBoxRenderable | null>(null);
  const picker = useThemePicker({
    onClose: props.onClose,
    persist: props.persist,
    exportTheme: props.exportTheme,
  });
  const scrollTarget = useMemo<ScrollChildIntoViewTarget>(
    () => ({
      /**
       * Reveals one theme row through the picker's own scrollbox.
       *
       * @param childId - Renderable id of the row to reveal.
       */
      scrollChildIntoView: (childId: string): void => {
        scrollRef.current?.scrollChildIntoView(childId);
      },
    }),
    [],
  );
  const highlightedRow = picker.rows[picker.highlightedIndex];
  const listHeight =
    picker.emptyMessage === null ? Math.min(picker.rows.length, THEME_PICKER_MAX_VISIBLE_ROWS) : 1;

  /** Selects a tab from a click on the bar and moves the keyboard into the rows. */
  const pressTab = useCallback(
    (variant: ThemeVariant): void => {
      picker.selectVariant(variant);
      picker.focusRows();
    },
    [picker.focusRows, picker.selectVariant],
  );

  useScrollSelectedRow(
    highlightedRow === undefined ? null : themeRowId(highlightedRow.name),
    picker.highlightedIndex,
    scrollTarget,
  );

  return (
    <ModalFrame title={THEME_PICKER_TITLE} width={THEME_PICKER_WIDTH}>
      <ThemePickerTabs
        variant={picker.variant}
        focused={picker.focusedZone === "tabs"}
        onSelect={picker.selectVariant}
        onPress={pressTab}
      />
      <SearchField
        id={THEME_PICKER_SEARCH_INPUT_ID}
        value={picker.query}
        placeholder={THEME_PICKER_SEARCH_PLACEHOLDER}
        onInput={picker.setQuery}
      />
      <ScrollableList
        id={THEME_PICKER_LIST_ID}
        scrollRef={scrollRef}
        height={listHeight}
        flexGrow={0}
        viewportCulling
      >
        {picker.emptyMessage === null ? (
          picker.rows.map((row, index) => (
            <ThemeRow
              key={row.name}
              row={row}
              selected={index === picker.highlightedIndex}
              focused={picker.focusedZone === "rows" && index === picker.highlightedIndex}
              onPress={() => {
                picker.select(index);
              }}
            />
          ))
        ) : (
          <box height={1} flexShrink={0}>
            <EmptyState message={picker.emptyMessage} />
          </box>
        )}
      </ScrollableList>
      {picker.note === null ? null : (
        <text fg={tokens.muted} wrapMode="none">
          {picker.note}
        </text>
      )}
      <ModalActions actions={picker.actions} />
    </ModalFrame>
  );
}
