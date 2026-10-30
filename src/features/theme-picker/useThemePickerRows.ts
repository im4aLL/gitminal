import { useMemo } from "react";
import { filterThemeRows } from "@/features/theme-picker/ThemePicker.filter";
import {
  buildThemeRows,
  groupThemeRowsByVariant,
  readActiveThemeRows,
  sortThemeRowsByName,
} from "@/features/theme-picker/ThemePicker.rows";
import type {
  ThemePickerRow,
  UseThemePickerRowsOptions,
} from "@/features/theme-picker/useThemePicker.types";

/**
 * Derives the visible picker rows from the catalogue, the capability, and the view state.
 *
 * The row pipeline is four memos so a keystroke never rebuilds what it cannot change. The catalogue
 * and the capability build the rows and sort them once. The active marker is applied in a second
 * memo that gates on the rendered theme name alone, because a preview changes only that flag. The
 * variant split then gates on the rows, and the search filter gates on the settled query and the
 * visible tab, so typing re-runs one filter and switching tabs re-runs the same one.
 *
 * @param input - Catalogue, capability, rendered theme name, visible tab, and settled query.
 * @returns The rows of the active tab, sorted by name and filtered by the settled query.
 */
export function useThemePickerRows(input: UseThemePickerRowsOptions): readonly ThemePickerRow[] {
  const { catalogue, capability, activeName, variant, activeQuery } = input;
  const baseRows = useMemo(
    () => sortThemeRowsByName(buildThemeRows(catalogue, capability)),
    [catalogue, capability],
  );
  const allRows = useMemo(() => readActiveThemeRows(baseRows, activeName), [baseRows, activeName]);
  const activeRows = useMemo(() => groupThemeRowsByVariant(allRows), [allRows]);
  const variantRows = activeRows[variant];

  return useMemo(() => filterThemeRows(variantRows, activeQuery), [activeQuery, variantRows]);
}
