import type { ThemePickerRow } from "@/features/theme-picker/useThemePicker.types";

/**
 * Filters picker rows by a search query.
 *
 * Matching is a case-insensitive substring test over the row name and its display label, so
 * `night`, `Tokyo`, and `tokyo-night` all find the same row, and a space-separated query matches when
 * every term appears somewhere in either field. An empty or whitespace-only query keeps every row in
 * catalogue order, so clearing the field restores the full list without a second code path.
 *
 * @param rows - Every row in catalogue order.
 * @param query - Raw text from the search field.
 * @returns The matching rows, in catalogue order.
 */
export function filterThemeRows(
  rows: readonly ThemePickerRow[],
  query: string,
): readonly ThemePickerRow[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (terms.length === 0) {
    return rows;
  }

  return Object.freeze(
    rows.filter((row) => {
      const haystack = `${row.name} ${row.label}`.toLowerCase();

      return terms.every((term) => haystack.includes(term));
    }),
  );
}
