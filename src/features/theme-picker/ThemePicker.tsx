import type { ScrollBoxRenderable } from "@opentui/core";
import { type ReactNode, useMemo, useRef } from "react";
import { useScrollSelectedRow } from "@/app/hooks/useScrollSelectedRow";
import type { ScrollChildIntoViewTarget } from "@/app/hooks/useScrollSelectedRow.types";
import {
  THEME_PICKER_LIST_ID,
  THEME_PICKER_MAX_VISIBLE_ROWS,
  THEME_PICKER_NO_MATCH_PREFIX,
  THEME_PICKER_SEARCH_INPUT_ID,
  THEME_PICKER_SEARCH_PLACEHOLDER,
  THEME_PICKER_TITLE,
  THEME_PICKER_WIDTH,
} from "@/features/theme-picker/ThemePicker.constants";
import type { ThemePickerProps } from "@/features/theme-picker/ThemePicker.types";
import { ThemeRow, themeRowId } from "@/features/theme-picker/ThemeRow";
import { useThemePicker } from "@/features/theme-picker/useThemePicker";
import { truncateText } from "@/lib/text";
import { ICONS } from "@/theme/icons";
import { useTokens } from "@/theme/useTokens";
import { ModalActions } from "@/ui/ModalActions";
import { ModalFrame } from "@/ui/ModalFrame";
import { ScrollableList } from "@/ui/ScrollableList";
import { SearchField } from "@/ui/SearchField";

/**
 * Renders the theme picker modal content.
 *
 * The entry content is exactly what `OverlayHost` renders inside `ModalFrame`: the search field, the
 * custom row list, the optional `theme.json` note, and the footer actions. The list is a
 * `<scrollbox>` of `ThemeRow` boxes with `viewportCulling`, not a `<select>`, because each row
 * carries a swatch, a light-or-dark label, and an active marker. Highlighting a row previews that
 * theme live; Enter or Apply persists it and closes, and Esc or Cancel restores the theme that was
 * active when the picker opened. The list shows at most `THEME_PICKER_MAX_VISIBLE_ROWS` rows and
 * keeps the highlighted row inside that viewport, so a long catalogue stays keyboard-navigable. The
 * picker owns no global action and never reads a key itself: `useThemePicker` registers only
 * overlay-scoped handlers through the shared keymap.
 *
 * @param props - Overlay close callback and an optional persistence override.
 * @returns The theme picker modal.
 */
export function ThemePicker(props: ThemePickerProps): ReactNode {
  const tokens = useTokens();
  const scrollRef = useRef<ScrollBoxRenderable | null>(null);
  const picker = useThemePicker({ onClose: props.onClose, persist: props.persist });
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

  useScrollSelectedRow(
    highlightedRow === undefined ? null : themeRowId(highlightedRow.name),
    picker.highlightedIndex,
    scrollTarget,
  );

  return (
    <ModalFrame title={THEME_PICKER_TITLE} width={THEME_PICKER_WIDTH}>
      <SearchField
        id={THEME_PICKER_SEARCH_INPUT_ID}
        value={picker.query}
        placeholder={THEME_PICKER_SEARCH_PLACEHOLDER}
        onInput={picker.setQuery}
      />
      {picker.rows.length === 0 ? (
        <text fg={tokens.dim} wrapMode="none">
          {truncateText(
            `${ICONS.missingUpstream} ${THEME_PICKER_NO_MATCH_PREFIX} "${picker.query}"`,
            THEME_PICKER_WIDTH,
            ICONS.ellipsis,
          )}
        </text>
      ) : (
        <ScrollableList
          id={THEME_PICKER_LIST_ID}
          scrollRef={scrollRef}
          height={Math.min(picker.rows.length, THEME_PICKER_MAX_VISIBLE_ROWS)}
          flexGrow={0}
          viewportCulling
        >
          {picker.rows.map((row, index) => (
            <ThemeRow
              key={row.name}
              row={row}
              selected={index === picker.highlightedIndex}
              focused={picker.focusedZone === "rows" && index === picker.highlightedIndex}
              onPress={() => {
                picker.select(index);
              }}
            />
          ))}
        </ScrollableList>
      )}
      {picker.note === null ? null : (
        <text fg={tokens.muted} wrapMode="none">
          {picker.note}
        </text>
      )}
      <ModalActions actions={picker.actions} />
    </ModalFrame>
  );
}
