import { useCallback, useState } from "react";
import { useModalControlCycle } from "@/app/hooks/useModalControlCycle";
import type {
  ModalControlDirection,
  ModalControlResolution,
  ModalHorizontalInput,
} from "@/app/hooks/useModalControlCycle.types";
import { INITIAL_CONTROL, PICKER_CONTROLS } from "@/features/theme-picker/useThemePicker.constants";
import type {
  ThemePickerControl,
  ThemePickerFocus,
  ThemePickerFocusZone,
} from "@/features/theme-picker/useThemePicker.types";

/**
 * Owns the picker's keyboard focus zone and its footer control cycle.
 *
 * The cycle is horizontal only, because Up and Down always move the row highlight while Left and
 * Right always navigate the footer buttons; outside the footer the first horizontal press enters it on
 * the side it points at, so Left focuses Cancel and Right focuses Apply. Tabs are switched with the
 * bracket actions instead, so a horizontal key never changes the visible tab.
 *
 * @returns The zone that owns the keyboard, its writer, the rows focus trigger, and the footer cycle.
 */
export function useThemePickerFocus(): ThemePickerFocus {
  const [focusedZone, setFocusedZone] = useState<ThemePickerFocusZone>("rows");

  /** Moves the keyboard focus to the theme rows. */
  const focusRows = useCallback((): void => {
    setFocusedZone("rows");
  }, []);

  const cycle = useModalControlCycle<ThemePickerControl>({
    order: PICKER_CONTROLS,
    initial: INITIAL_CONTROL,
    registerVerticalNavigation: false,
    onHorizontal: (input) => readHorizontalResolution(input, focusedZone, setFocusedZone),
  });

  return { focusedZone, setFocusedZone, focusRows, cycle };
}

/**
 * Applies the picker's Left and Right rule.
 *
 * Left and Right always navigate the footer buttons. Outside the footer the first press enters the
 * footer on the side it points at, so Left focuses Cancel and Right focuses Apply. Inside the footer
 * the keys step through Export, Cancel, and Apply with wraparound, which is what makes every button
 * reachable without a vertical key. Tabs are switched with the bracket actions instead, so a
 * horizontal key never changes the visible tab.
 *
 * @param input - Focused control and requested direction.
 * @param zone - Zone that currently owns the keyboard.
 * @param onFocusActions - Callback that moves keyboard focus into the footer actions.
 * @returns The control to focus next.
 */
function readHorizontalResolution(
  input: ModalHorizontalInput<ThemePickerControl>,
  zone: ThemePickerFocusZone,
  onFocusActions: (zone: ThemePickerFocusZone) => void,
): ModalControlResolution<ThemePickerControl> {
  if (zone !== "actions") {
    onFocusActions("actions");

    return {
      kind: "focus",
      control: input.direction === "left" ? "cancel" : "apply",
    };
  }

  return { kind: "focus", control: readAdjacentControl(input.control, input.direction) };
}

/**
 * Reads the footer control one horizontal step away.
 *
 * The footer buttons wrap, so Left on Export lands on Apply and Right on Apply lands on Export. A
 * control that is not in the order falls back to the first button, which keeps a stale control from
 * trapping the keyboard outside the visible row.
 *
 * @param current - Control that currently owns the keyboard.
 * @param direction - Requested horizontal direction.
 * @returns The control that should own the keyboard next.
 */
function readAdjacentControl(
  current: ThemePickerControl,
  direction: ModalControlDirection,
): ThemePickerControl {
  const count = PICKER_CONTROLS.length;
  const step = direction === "left" ? -1 : 1;
  const index = PICKER_CONTROLS.indexOf(current);
  const next = (Math.max(index, 0) + step + count) % count;

  return PICKER_CONTROLS[next] ?? current;
}
