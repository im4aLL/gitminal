import { useCallback, useEffect, useRef } from "react";
import type {
  ThemePickerSession,
  UseThemePickerSessionOptions,
} from "@/features/theme-picker/useThemePicker.types";

/**
 * Owns the picker's previous theme and its unmount restore guard.
 *
 * The theme that was active when the picker mounted is what Cancel and an unmount restore. `settle`
 * records that the user already applied or discarded the preview, so the unmount guard cannot undo a
 * committed theme; the commit hook calls it on Apply, Cancel, and Export-driven closes before the
 * overlay unmounts.
 *
 * @param input - Theme name the picker opened on and the session theme controls.
 * @returns The previous theme name and the settle trigger.
 */
export function useThemePickerSession(input: UseThemePickerSessionOptions): ThemePickerSession {
  const { themeName, controls } = input;
  const previousName = useRef<string>(themeName);
  const settled = useRef(false);

  useEffect(
    () => () => {
      if (!settled.current) {
        controls.restore(previousName.current);
      }
    },
    [controls],
  );

  /** Marks the picker as settled so the unmount guard stops restoring the previous theme. */
  const settle = useCallback((): void => {
    settled.current = true;
  }, []);

  return { previousName: previousName.current, settle };
}
