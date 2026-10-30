import { applyThemeCapability } from "@/domain/theme/theme.capability";
import type { ThemeCatalogue, ThemeCatalogueEntry } from "@/domain/theme/theme.catalogue.types";
import type { HexColor, ThemeColorCapability } from "@/domain/theme/theme.types";
import type {
  ThemePickerBaseRow,
  ThemePickerRow,
  ThemePickerVariantRows,
} from "./useThemePicker.types";

/**
 * Sorts picker rows alphabetically by theme name.
 *
 * The name is the identity written to `config.json`, used by search, and shown in the palette, so it
 * is the ordering key instead of the display label, which a user-supplied file can disagree with.
 * Comparison is by UTF-16 code unit rather than a locale collation, so the same files produce the same
 * order on every machine. Built-ins and user themes interleave because this single rule is applied to
 * the whole list, which is what makes a user theme sit between two built-ins instead of after all of
 * them. The row type is generic so the picker can sort its rows once before the active marker is
 * applied.
 *
 * @param rows - Rows in catalogue order.
 * @returns A new frozen list in ascending name order.
 */
export function sortThemeRowsByName<T extends { readonly name: string }>(
  rows: readonly T[],
): readonly T[] {
  const sorted = [...rows].sort((left, right) => compareNames(left.name, right.name));

  return Object.freeze(sorted);
}

/**
 * Splits picker rows into the two variant tabs.
 *
 * @param rows - Rows in display order.
 * @returns The dark and light row lists, each keeping the input order.
 */
export function groupThemeRowsByVariant(rows: readonly ThemePickerRow[]): ThemePickerVariantRows {
  return Object.freeze({
    dark: Object.freeze(rows.filter((row) => row.variant === "dark")),
    light: Object.freeze(rows.filter((row) => row.variant === "light")),
  });
}

/**
 * Builds every picker row for the current capability, without the active marker.
 *
 * The swatch fill comes from the capability-mapped tokens, so a 256-color terminal previews the
 * quantized color the app would actually render instead of the raw truecolor value. A monochrome
 * terminal has no swatch fill, so the row falls back to the plain marker from `Swatch` and the name
 * and active marker carry all meaning. The row also keeps the entry's truecolor tokens, because
 * exporting a theme must write the palette the file describes, not the capability-mapped one.
 *
 * @param catalogue - Catalogue that owns the row identities and their order.
 * @param capability - Terminal capability that decides the final swatch color.
 * @returns The rows in catalogue order.
 */
export function buildThemeRows(
  catalogue: ThemeCatalogue,
  capability: ThemeColorCapability,
): readonly ThemePickerBaseRow[] {
  return Object.freeze(
    catalogue.entries.map((entry) => ({
      name: entry.name,
      label: entry.label,
      variant: entry.variant,
      swatchColor: readSwatchColor(entry, capability),
      tokens: entry.tokens,
    })),
  );
}

/**
 * Maps picker rows onto the active marker of the rendered theme.
 *
 * The split exists so the expensive half of building a row, the capability-mapped swatch color,
 * stays stable while the highlight moves: a preview only changes which theme is active.
 *
 * @param rows - Rows in display order, without the active flag.
 * @param activeName - Theme currently rendered, including a live preview.
 * @returns The rows with the active flag applied, in the same order.
 */
export function readActiveThemeRows(
  rows: readonly ThemePickerBaseRow[],
  activeName: string,
): readonly ThemePickerRow[] {
  return Object.freeze(rows.map((row) => ({ ...row, active: row.name === activeName })));
}

/**
 * Reads the filtered index of the highlighted theme.
 *
 * A highlighted theme that the current filter or tab hides falls back to the first visible row, which
 * keeps the highlight, the live preview, and the applied row in agreement.
 *
 * @param rows - Visible rows in display order.
 * @param highlightedName - Theme name the highlight is stored under.
 * @returns The index to render as highlighted, or zero when no row is visible.
 */
export function readHighlightedIndex(
  rows: readonly ThemePickerRow[],
  highlightedName: string,
): number {
  const index = rows.findIndex((row) => row.name === highlightedName);

  return index === -1 ? 0 : index;
}

/**
 * Reads one theme's swatch fill for the current capability.
 *
 * The theme is mapped through the same capability stage the provider uses, so the picker never shows
 * a color the rest of the app would not render. Monochrome keeps the marker path instead.
 *
 * @param entry - Catalogue entry whose background is previewed.
 * @param capability - Terminal capability.
 * @returns The mapped fill color, or `null` when the marker replaces the swatch.
 */
function readSwatchColor(
  entry: ThemeCatalogueEntry,
  capability: ThemeColorCapability,
): HexColor | null {
  if (capability === "monochrome") {
    return null;
  }

  const mapped = applyThemeCapability(
    {
      name: entry.name,
      label: entry.label,
      variant: entry.variant,
      tokens: entry.tokens,
      capability: "truecolor",
      warnings: [],
    },
    capability,
  );

  return mapped.tokens.background;
}

/**
 * Compares two theme names for ascending order.
 *
 * @param left - Left theme name.
 * @param right - Right theme name.
 * @returns A negative, zero, or positive offset for `Array.prototype.sort`.
 */
function compareNames(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}
