import { useEffect, useState } from "react";
import type {
  ThemePickerHighlight,
  UseThemePickerHighlightOptions,
} from "@/features/theme-picker/useThemePicker.types";

/**
 * Owns the highlighted theme name and the fallback that keeps it visible.
 *
 * The highlight is stored by name rather than by index, so a filter or tab change keeps the
 * highlighted theme highlighted while it stays visible. When the visible rows no longer contain it,
 * the effect falls back to the first visible row and previews it, which is what keeps the highlight,
 * the live preview, and the row that Enter would apply in agreement. It only runs while the stored
 * name is hidden, so it never overrides an explicit preview.
 *
 * @param input - Visible rows, the theme name the picker opened on, and the preview controls.
 * @returns The highlighted name and its writer.
 */
export function useThemePickerHighlight(
  input: UseThemePickerHighlightOptions,
): ThemePickerHighlight {
  const { rows, initialName, controls } = input;
  const [highlightedName, setHighlightedName] = useState<string>(initialName);

  useEffect(() => {
    if (rows.some((row) => row.name === highlightedName)) {
      return;
    }

    const fallback = rows[0];

    if (fallback === undefined) {
      return;
    }

    setHighlightedName(fallback.name);
    controls.preview(fallback.name);
  }, [controls, highlightedName, rows]);

  return { highlightedName, setHighlightedName };
}
