import { useCallback } from "react";
import { useAction } from "@/app/hooks/useAction";
import { useFocusState } from "@/app/hooks/useFocusState";
import { THEME_PICKER_SEARCH_INPUT_ID } from "@/features/theme-picker/ThemePicker.constants";
import {
  FOCUS_ZONE_ORDER,
  HIGHLIGHT_STEPS,
} from "@/features/theme-picker/useThemePicker.constants";
import type {
  ThemePickerFocusZone,
  ThemePickerNavigation,
  UseThemePickerNavigationOptions,
} from "@/features/theme-picker/useThemePicker.types";
import { clampIndex } from "@/lib/list";
import { MODAL_FRAME_ID } from "@/ui/ModalFrame.constants";

/**
 * Owns the picker's row highlight movement and overlay key registrations.
 *
 * The complete key set is: Up and Down always move the highlight and preview the new theme, and they
 * hand the keyboard to the rows from either the tab bar or the footer, so a vertical key never has
 * to be pressed twice before it does something visible. Enter applies the highlighted theme from the
 * rows and runs the focused footer control from the actions, while Enter in the tab zone moves the
 * keyboard into the rows and never commits a theme. Esc cancels through the shared `overlay.close`,
 * `e` exports, and `[` or `]` switch tabs from any zone. Left and Right are owned by the footer
 * cycle's horizontal rule and always navigate the footer buttons; the tab bar is switched with the
 * brackets instead of a horizontal key.
 *
 * Every handler is overlay-scoped, so the picker only sees keys while it is the open modal;
 * `app.themePicker` belongs to the app layer and is never registered here. Left and Right are
 * registered by `useModalControlCycle` in the same scope, which is why this hook never registers them.
 * The picker's own brackets are `theme.tabLeft` and `theme.tabRight` (`[` and `]`): they switch tabs
 * from any zone and wrap, so a user in the rows or the footer does not have to reach the tab bar
 * first, while Left and Right stay the shared, zone-sensitive cycle. `theme.export` (`e`) writes the
 * highlighted theme from any zone and leaves the picker open. Both brackets read the current tab
 * through `selectAdjacentVariant`, so two presses in one uncommitted frame advance two tabs.
 *
 * @param input - Picker view state and the commit handlers the activation keys run.
 * @returns The navigation handlers the view can reuse.
 */
export function useThemePickerNavigation(
  input: UseThemePickerNavigationOptions,
): ThemePickerNavigation {
  const { state, commit } = input;
  const focus = useFocusState();
  const {
    cycle,
    controls,
    focusedZone,
    focusRows,
    highlightedIndex,
    rows,
    selectAdjacentVariant,
    setFocusedZone,
    setHighlightedName,
  } = state;

  /** Highlights one row and previews it. */
  const select = useCallback(
    (index: number): void => {
      const row = rows[clampIndex(index, rows.length)];

      if (row === undefined) {
        return;
      }

      setFocusedZone("rows");
      setHighlightedName(row.name);
      controls.preview(row.name);
    },
    [controls, rows, setFocusedZone, setHighlightedName],
  );

  /** Moves the highlight by one row and previews the new row. */
  const move = useCallback(
    (delta: number): void => {
      select(highlightedIndex + delta);
    },
    [highlightedIndex, select],
  );

  /** Runs the focused footer control, or hands the keyboard to the rows from the tab bar. */
  const activate = useCallback((): void => {
    if (focusedZone === "tabs") {
      focusRows();

      return;
    }

    if (focusedZone === "actions") {
      if (cycle.control === "cancel") {
        commit.cancel();

        return;
      }

      if (cycle.control === "export") {
        commit.exportTheme();

        return;
      }
    }

    commit.apply();
  }, [commit, cycle.control, focusRows, focusedZone]);

  /**
   * Moves keyboard focus one zone forward or backward, wrapping at both ends.
   *
   * A search field that owns native focus hands it back to the modal frame and selects the rows, so
   * Tab always leaves the field. Anywhere else the three zones cycle in the documented order, which is
   * what makes the tab bar and the footer reachable from the rows with one key in either direction.
   *
   * @param delta - Forward (`1`) or backward (`-1`) step.
   */
  const moveZone = useCallback(
    (delta: number): void => {
      if (focus.state.focusedRenderableId === THEME_PICKER_SEARCH_INPUT_ID) {
        focus.focusRenderable(MODAL_FRAME_ID);
        setFocusedZone("rows");

        return;
      }

      setFocusedZone(stepFocusZone(focusedZone, delta));
    },
    [focus, focusedZone, setFocusedZone],
  );

  useAction("nav.up", { scope: "overlay" }, () => {
    move(HIGHLIGHT_STEPS.up);
  });
  useAction("nav.down", { scope: "overlay" }, () => {
    move(HIGHLIGHT_STEPS.down);
  });
  useAction("nav.activate", { scope: "overlay" }, activate);
  useAction("theme.tabLeft", { scope: "overlay" }, () => {
    selectAdjacentVariant("left");
  });
  useAction("theme.tabRight", { scope: "overlay" }, () => {
    selectAdjacentVariant("right");
  });
  useAction("theme.export", { scope: "overlay" }, commit.exportTheme);
  useAction("overlay.close", { scope: "overlay" }, commit.cancel);
  useAction("focus.next", { scope: "overlay" }, () => {
    moveZone(1);
  });
  useAction("focus.previous", { scope: "overlay" }, () => {
    moveZone(-1);
  });

  return { select, move, activate, moveZone };
}

/**
 * Steps one focus zone with wrapping.
 *
 * @param zone - Zone that currently owns the keyboard.
 * @param delta - Forward (`1`) or backward (`-1`) step.
 * @returns The zone that owns the keyboard next.
 */
function stepFocusZone(zone: ThemePickerFocusZone, delta: number): ThemePickerFocusZone {
  const count = FOCUS_ZONE_ORDER.length;
  const index = FOCUS_ZONE_ORDER.indexOf(zone);
  const next = (index + delta + count) % count;

  return FOCUS_ZONE_ORDER[next] ?? zone;
}
