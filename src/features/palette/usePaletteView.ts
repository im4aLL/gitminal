import { useCallback, useMemo, useState } from "react";
import { useTerminalSize } from "@/app/hooks/useTerminalSize";
import {
  PALETTE_MAX_OPTION_ROWS,
  PALETTE_MIN_OPTION_ROWS,
  PALETTE_RESERVED_COLUMNS,
  PALETTE_RESERVED_ROWS,
} from "@/features/palette/CommandPalette.constants";
import type { PaletteCommandEntry, PaletteRow } from "@/features/palette/CommandRow.types";
import {
  buildPaletteRows,
  moveSelectableIndex,
  resolveSelectableIndex,
} from "@/features/palette/palette.search";

/** Rows, query, and highlight the palette view renders. */
export interface PaletteView {
  /** Current search text. */
  readonly query: string;
  /** Replaces the search text and resets the highlight to the first match. */
  readonly setQuery: (value: string) => void;
  /** Rendered rows, including header and spacer rows. */
  readonly rows: readonly PaletteRow[];
  /** Number of commands that survived filtering. */
  readonly matchCount: number;
  /** Visible row window used as the page-step size. */
  readonly optionRows: number;
  /** Height the result list needs, capped by the viewport and the documented maximum. */
  readonly listHeight: number;
  /** Highlighted row index, always a selectable command row. */
  readonly highlightedIndex: number;
  /**
   * Moves the highlight by a number of command rows.
   *
   * @param delta - Command rows to move; negative moves up.
   */
  readonly move: (delta: number) => void;
  /** Puts the highlight on the first selectable command row. */
  readonly moveToFirst: () => void;
  /** Puts the highlight on the last selectable command row. */
  readonly moveToLast: () => void;
  /**
   * Puts the highlight on one rendered row, resolving headers and spacers to a command.
   *
   * @param index - Requested row index.
   */
  readonly highlightRow: (index: number) => void;
}

/**
 * Owns the palette query, its rendered rows, and the highlight over them.
 *
 * The rows are rebuilt only when the query, the captured entries, the recents, or the measured text
 * budget change, so typing never re-derives a command target. The highlight is resolved through
 * `resolveSelectableIndex`, so it always names a command row even while the rows carry header and
 * spacer rows. The list height is the rendered row height, so a custom list never reserves the two
 * lines a command row needs for a one-line header.
 *
 * @param entries - Captured palette entries.
 * @param recentCommandIds - Session recents captured at open time.
 * @returns The query, rows, and highlight operations.
 */
export function usePaletteView(
  entries: readonly PaletteCommandEntry[],
  recentCommandIds: readonly string[],
): PaletteView {
  const size = useTerminalSize({
    reservedRows: PALETTE_RESERVED_ROWS,
    reservedColumns: PALETTE_RESERVED_COLUMNS,
  });
  const [query, setQueryState] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rows = useMemo(
    () =>
      buildPaletteRows({
        entries,
        query,
        recentCommandIds,
        textBudget: size.textBudget,
      }),
    [entries, query, recentCommandIds, size.textBudget],
  );
  const selectableIndex = resolveSelectableIndex(rows.rows, highlightedIndex);
  const optionRows = clampOptionRows(size.visibleRows);
  const listHeight = rows.matchCount === 0 ? 0 : readListHeight(rows.rows, optionRows);

  /** Replaces the query and resets the highlight to the first match. */
  const setQuery = useCallback((value: string): void => {
    setQueryState(value);
    setHighlightedIndex(0);
  }, []);

  /** Moves the highlight by a number of command rows. */
  const move = useCallback(
    (delta: number): void => {
      setHighlightedIndex(moveSelectableIndex(rows.rows, selectableIndex, delta));
    },
    [rows.rows, selectableIndex],
  );

  /** Puts the highlight on the first selectable command row. */
  const moveToFirst = useCallback((): void => {
    setHighlightedIndex(resolveSelectableIndex(rows.rows, 0));
  }, [rows.rows]);

  /** Puts the highlight on the last selectable command row. */
  const moveToLast = useCallback((): void => {
    setHighlightedIndex(resolveSelectableIndex(rows.rows, rows.rows.length - 1));
  }, [rows.rows]);

  /** Puts the highlight on one rendered row, resolving headers and spacers to a command. */
  const highlightRow = useCallback(
    (index: number): void => {
      setHighlightedIndex(resolveSelectableIndex(rows.rows, index));
    },
    [rows.rows],
  );

  return {
    query,
    setQuery,
    rows: rows.rows,
    matchCount: rows.matchCount,
    optionRows,
    listHeight,
    highlightedIndex: selectableIndex,
    move,
    moveToFirst,
    moveToLast,
    highlightRow,
  };
}

/**
 * Clamps the visible row window to the measured rows and the documented bounds.
 *
 * @param visibleRows - Rows the terminal leaves for content.
 * @returns The page-step and height ceiling.
 */
function clampOptionRows(visibleRows: number): number {
  return Math.max(PALETTE_MIN_OPTION_ROWS, Math.min(visibleRows, PALETTE_MAX_OPTION_ROWS));
}

/**
 * Reads the rendered height the result list needs.
 *
 * A header and a spacer occupy one row, and a command occupies its name and description lines. The
 * height never exceeds the visible window, so the list scrolls instead of growing the modal.
 *
 * @param rows - Rendered palette rows.
 * @param visibleRows - Visible row window.
 * @returns The list height in rows.
 */
function readListHeight(rows: readonly PaletteRow[], visibleRows: number): number {
  const contentRows = rows.reduce((total, row) => total + (row.kind === "command" ? 2 : 1), 0);

  return Math.max(PALETTE_MIN_OPTION_ROWS, Math.min(contentRows, visibleRows));
}
