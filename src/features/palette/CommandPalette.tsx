import type { ScrollBoxRenderable } from "@opentui/core";
import { type ReactNode, useMemo, useRef } from "react";
import { useScrollSelectedRow } from "@/app/hooks/useScrollSelectedRow";
import type { ScrollChildIntoViewTarget } from "@/app/hooks/useScrollSelectedRow.types";
import {
  PALETTE_LIST_ID,
  PALETTE_ROW_ID_PREFIX,
  PALETTE_SEARCH_INPUT_ID,
  PALETTE_SEARCH_PLACEHOLDER,
  PALETTE_TITLE,
  PALETTE_WIDTH,
} from "@/features/palette/CommandPalette.constants";
import type { CommandPaletteProps } from "@/features/palette/CommandPalette.types";
import { readPaletteRowKey } from "@/features/palette/CommandRow";
import { PaletteCommandRow } from "@/features/palette/PaletteCommandRow";
import { PaletteHeaderRow } from "@/features/palette/PaletteHeaderRow";
import { useCommandPalette } from "@/features/palette/useCommandPalette";
import { truncateText } from "@/lib/text";
import { ICONS } from "@/theme/icons";
import { useTokens } from "@/theme/useTokens";
import { KeyHint } from "@/ui/KeyHint";
import { ModalFrame } from "@/ui/ModalFrame";
import { ScrollableList } from "@/ui/ScrollableList";
import { SearchField } from "@/ui/SearchField";

/**
 * Renders the command palette modal content.
 *
 * The overlay host supplies the entry and the close callback, so this component only composes the
 * modal frame, the search field, the result list, the no-match row, and the key hint strip. The
 * result list is a focusable `<scrollbox>` of custom rows rather than a native `<select>`, because
 * a select cannot paint a per-option header background: category headers render as full-width
 * bands, spacers render as blank rows, and command rows render their name and description. The
 * search field owns the `search` input mode, so query typing stays in the field while Up, Down,
 * PageUp, PageDown, and Enter route to the palette, and the wheel scrolls the list natively. The
 * highlighted command is revealed through the scrollbox as it moves, and pressing a row selects and
 * runs it once.
 *
 * @param props - Overlay close callback.
 * @returns The command palette modal.
 */
export function CommandPalette(props: CommandPaletteProps): ReactNode {
  const tokens = useTokens();
  const palette = useCommandPalette({ onClose: props.onClose });
  const scrollRef = useRef<ScrollBoxRenderable | null>(null);
  const scrollTarget = useMemo<ScrollChildIntoViewTarget>(
    () => ({
      /**
       * Reveals one palette row through the palette's own scrollbox.
       *
       * @param childId - Renderable id of the row to reveal.
       */
      scrollChildIntoView: (childId: string): void => {
        scrollRef.current?.scrollChildIntoView(childId);
      },
    }),
    [],
  );
  const highlightedRow = palette.rows[palette.highlightedIndex];
  const highlightedRowId =
    highlightedRow?.kind === "command"
      ? `${PALETTE_ROW_ID_PREFIX}:${readPaletteRowKey(highlightedRow)}`
      : null;

  useScrollSelectedRow(highlightedRowId, palette.highlightedIndex, scrollTarget);

  return (
    <ModalFrame title={PALETTE_TITLE} width={PALETTE_WIDTH}>
      <SearchField
        id={PALETTE_SEARCH_INPUT_ID}
        value={palette.query}
        placeholder={PALETTE_SEARCH_PLACEHOLDER}
        onInput={palette.setQuery}
      />
      {palette.matchCount === 0 ? (
        <text fg={tokens.dim} wrapMode="word">
          {readEmptyPaletteMessage(palette.query)}
        </text>
      ) : (
        <ScrollableList
          id={PALETTE_LIST_ID}
          scrollRef={scrollRef}
          height={palette.listHeight}
          flexGrow={0}
          focusable
          viewportCulling
        >
          {palette.rows.map((row, index) =>
            row.kind === "command" ? (
              <PaletteCommandRow
                key={readPaletteRowKey(row)}
                id={`${PALETTE_ROW_ID_PREFIX}:${readPaletteRowKey(row)}`}
                row={row}
                selected={index === palette.highlightedIndex}
                onPress={() => {
                  palette.highlightRow(index);
                  palette.activateRow(index);
                }}
              />
            ) : row.kind === "header" ? (
              <PaletteHeaderRow key={readPaletteRowKey(row)} label={row.label} />
            ) : (
              <box key={readPaletteRowKey(row)} height={1} flexShrink={0} />
            ),
          )}
        </ScrollableList>
      )}
      <box flexDirection="row" flexShrink={0} paddingLeft={1} gap={2}>
        <KeyHint keyLabel={palette.hints.activate} label="Run" />
        <KeyHint keyLabel={palette.hints.close} label="Close" />
        <KeyHint keyLabel={palette.hints.nextField} label="Next field" />
      </box>
    </ModalFrame>
  );
}

/**
 * Reads the no-match message.
 *
 * The marker comes from `ICONS`, so the palette never inlines a reusable glyph. The budget keeps a
 * very long query from overflowing the modal line.
 *
 * @param query - Current search text.
 * @returns The message rendered when no command matches.
 */
function readEmptyPaletteMessage(query: string): string {
  return truncateText(
    `${ICONS.missingUpstream} No matching commands "${query}"`,
    120,
    ICONS.ellipsis,
  );
}
