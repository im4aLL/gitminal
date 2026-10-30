import { useCallback, useRef, useState } from "react";
import type { ModalControlDirection } from "@/app/hooks/useModalControlCycle.types";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import { readAdjacentVariant } from "@/features/theme-picker/ThemePicker.tabs";
import type { ThemePickerVariantTab } from "@/features/theme-picker/useThemePicker.types";

/**
 * Owns the visible variant tab and its two switchers.
 *
 * The tab is mirrored in a ref that every change writes synchronously, so repeated bracket presses
 * inside one uncommitted frame each step from the tab the previous press chose instead of both
 * reading the tab the last render observed. Switching tabs never moves the highlight: the highlight
 * effect previews the first row of the new tab only when the stored name is not visible there.
 *
 * @param initial - Variant of the theme that is active when the picker opens.
 * @returns The visible tab, its direct switcher, and the adjacent-tab stepper.
 */
export function useThemePickerVariant(initial: ThemeVariant): ThemePickerVariantTab {
  const [variant, setVariant] = useState<ThemeVariant>(initial);
  const variantRef = useRef<ThemeVariant>(variant);

  /** Switches the visible tab; the highlight effect previews the new first row when needed. */
  const selectVariant = useCallback((next: ThemeVariant): void => {
    variantRef.current = next;
    setVariant(next);
  }, []);

  /** Switches to the tab one horizontal step away, reading the live tab rather than the last render. */
  const selectAdjacentVariant = useCallback(
    (direction: ModalControlDirection): void => {
      selectVariant(readAdjacentVariant(variantRef.current, direction));
    },
    [selectVariant],
  );

  return { variant, selectVariant, selectAdjacentVariant };
}
