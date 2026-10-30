import { useCallback } from "react";
import { useAction } from "@/app/hooks/useAction";
import { useFocusState } from "@/app/hooks/useFocusState";
import { THEME_PICKER_SEARCH_INPUT_ID } from "@/features/theme-picker/ThemePicker.constants";
import { HIGHLIGHT_STEPS } from "@/features/theme-picker/useThemePicker.constants";
import type {
  ThemePickerNavigation,
  UseThemePickerNavigationOptions,
} from "@/features/theme-picker/useThemePicker.types";
import { clampIndex } from "@/lib/list";
import { MODAL_FRAME_ID } from "@/ui/ModalFrame.constants";

/**
 * Owns the picker's row highlight movement and overlay key registrations.
 *
 * Up and Down move the highlight and preview the new theme while the rows own focus, and step the
 * footer controls while the actions own focus. Every handler is overlay-scoped, so the picker only
 * sees keys while it is the open modal; `app.themePicker` belongs to the app layer and is never
 * registered here.
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
    highlightedIndex,
    rows,
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

  /** Runs the focused footer control. */
  const activate = useCallback((): void => {
    if (focusedZone === "rows") {
      commit.apply();

      return;
    }

    if (cycle.control === "cancel") {
      commit.cancel();

      return;
    }

    commit.apply();
  }, [commit, cycle.control, focusedZone]);

  /**
   * Moves keyboard focus between the search field, the theme rows, and the footer actions.
   *
   * A search field that owns native focus hands it back to the modal frame and selects the rows, so
   * Tab always leaves the field. Otherwise the picker has exactly two destinations and both
   * directions toggle, matching the palette and help field traversal. The highlighted row keeps its
   * preview while the footer owns focus.
   */
  const moveZone = useCallback((): void => {
    if (focus.state.focusedRenderableId === THEME_PICKER_SEARCH_INPUT_ID) {
      focus.focusRenderable(MODAL_FRAME_ID);
      setFocusedZone("rows");

      return;
    }

    setFocusedZone(focusedZone === "rows" ? "actions" : "rows");
  }, [focus, focusedZone, setFocusedZone]);

  useAction("nav.up", { scope: "overlay" }, () => {
    if (focusedZone === "actions") {
      cycle.move(-1);

      return;
    }

    move(HIGHLIGHT_STEPS.up);
  });
  useAction("nav.down", { scope: "overlay" }, () => {
    if (focusedZone === "actions") {
      cycle.move(1);

      return;
    }

    move(HIGHLIGHT_STEPS.down);
  });
  useAction("nav.activate", { scope: "overlay" }, activate);
  useAction("overlay.close", { scope: "overlay" }, commit.cancel);
  useAction("focus.next", { scope: "overlay" }, moveZone);
  useAction("focus.previous", { scope: "overlay" }, moveZone);

  return { select, move, activate, moveZone };
}
