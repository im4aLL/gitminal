import { describe, expect, it } from "bun:test";
import { filterThemeRows } from "@/features/theme-picker/ThemePicker.filter";
import type { ThemePickerRow } from "@/features/theme-picker/useThemePicker.types";

/**
 * Builds one row for the filter tests.
 *
 * @param name - Row name.
 * @param label - Display label.
 * @returns A row with the fixed test values.
 */
function row(name: ThemePickerRow["name"], label: string): ThemePickerRow {
  return { name, label, variant: "dark", active: false, swatchColor: null };
}

/** Rows used by every case, in catalogue order. */
const ROWS: readonly ThemePickerRow[] = Object.freeze([
  row("catppuccin-mocha", "Catppuccin Mocha"),
  row("catppuccin-latte", "Catppuccin Latte"),
  row("catppuccin-frappe", "Catppuccin Frappe"),
  row("catppuccin-macchiato", "Catppuccin Macchiato"),
]);

describe("filterThemeRows", () => {
  it("keeps every row for an empty or blank query", () => {
    expect(filterThemeRows(ROWS, "")).toBe(ROWS);
    expect(filterThemeRows(ROWS, "   ")).toBe(ROWS);
  });

  it("matches a name substring case-insensitively", () => {
    expect(filterThemeRows(ROWS, "CAT").map((entry) => entry.name)).toEqual([
      "catppuccin-mocha",
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
    ]);
    expect(filterThemeRows(ROWS, "LATTE").map((entry) => entry.name)).toEqual(["catppuccin-latte"]);
  });

  it("matches a label substring", () => {
    expect(filterThemeRows(ROWS, "Macchiato").map((entry) => entry.name)).toEqual([
      "catppuccin-macchiato",
    ]);
  });

  it("requires every term to match", () => {
    expect(filterThemeRows(ROWS, "cat latte").map((entry) => entry.name)).toEqual([
      "catppuccin-latte",
    ]);
    expect(filterThemeRows(ROWS, "cat frappe latte")).toEqual([]);
  });

  it("returns an empty frozen list when nothing matches", () => {
    const matches = filterThemeRows(ROWS, "zzz");

    expect(matches).toEqual([]);
    expect(Object.isFrozen(matches)).toBe(true);
  });

  it("keeps catalogue order", () => {
    expect(filterThemeRows(ROWS, "catppuccin").map((entry) => entry.name)).toEqual([
      "catppuccin-mocha",
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
    ]);
  });
});
