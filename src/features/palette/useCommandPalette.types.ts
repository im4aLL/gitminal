import type { PaletteRow } from "@/features/palette/CommandRow.types";

/** Options accepted by `useCommandPalette`. */
export interface UseCommandPaletteOptions {
  /**
   * Closes the overlay entry that renders the palette.
   *
   * @param afterRestore - Work the overlay provider runs once the captured background focus is
   * restored. The palette passes its owning handler or its refusal focus move here, so dispatch is
   * caused by the restore instead of racing it.
   */
  readonly onClose: (afterRestore?: () => void) => void;
}

/** Effective keys the modal footer advertises. */
export interface PaletteHintKeys {
  /** Key that runs the highlighted command. */
  readonly activate: string;
  /** Key that closes the palette. */
  readonly close: string;
  /** Key that moves focus to the result list. */
  readonly nextField: string;
}

/** State and callbacks the palette view renders. */
export interface PaletteHandle {
  /** Current search text. */
  readonly query: string;
  /** Replaces the search text and resets the highlight to the first matching command. */
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
  /** Effective shortcut keys for the modal footer. */
  readonly hints: PaletteHintKeys;
  /**
   * Moves the highlight to one rendered row, resolving headers and spacers to a command.
   *
   * @param index - Requested row index.
   */
  readonly highlightRow: (index: number) => void;
  /**
   * Runs the command at one rendered row after revalidation.
   *
   * @param index - Requested row index.
   */
  readonly activateRow: (index: number) => void;
}
