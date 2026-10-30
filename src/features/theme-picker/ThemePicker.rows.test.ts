import { describe, expect, it } from "bun:test";
import { THEMES } from "@/domain/theme/theme.registry";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import {
  groupThemeRowsByVariant,
  sortThemeRowsByName,
} from "@/features/theme-picker/ThemePicker.rows";
import type { ThemePickerRow } from "@/features/theme-picker/useThemePicker.types";

/**
 * Builds one picker row.
 *
 * @param name - Theme identity.
 * @param variant - Light or dark classification.
 * @returns The row with the fixed test values.
 */
function row(name: string, variant: ThemeVariant): ThemePickerRow {
  return {
    name,
    label: name,
    variant,
    active: false,
    swatchColor: null,
    tokens: THEMES["catppuccin-mocha"].tokens,
  };
}

describe("sortThemeRowsByName", () => {
  it("sorts by name ascending and interleaves variants", () => {
    const rows = [row("zeta", "light"), row("alpha", "dark"), row("mike", "light")];
    const sorted = sortThemeRowsByName(rows);

    expect(sorted.map((entry) => entry.name)).toEqual(["alpha", "mike", "zeta"]);
    expect(sorted.map((entry) => entry.variant)).toEqual(["dark", "light", "light"]);
  });

  it("leaves the input list untouched and returns a frozen list", () => {
    const rows = [row("b", "dark"), row("a", "dark")];
    const sorted = sortThemeRowsByName(rows);

    expect(rows.map((entry) => entry.name)).toEqual(["b", "a"]);
    expect(Object.isFrozen(sorted)).toBe(true);
  });

  it("is stable for equal names", () => {
    const rows = [row("same", "dark"), row("same", "light")];
    const sorted = sortThemeRowsByName(rows);

    expect(sorted.map((entry) => entry.variant)).toEqual(["dark", "light"]);
  });

  it("sorts by identity, not by display label", () => {
    const rows: ThemePickerRow[] = [
      { ...row("zeta", "dark"), label: "Aaa" },
      { ...row("alpha", "dark"), label: "Zzz" },
    ];

    expect(sortThemeRowsByName(rows).map((entry) => entry.name)).toEqual(["alpha", "zeta"]);
  });
});

describe("groupThemeRowsByVariant", () => {
  it("splits rows into dark and light lists, keeping their order", () => {
    const rows = [row("a", "light"), row("b", "dark"), row("c", "light")];
    const grouped = groupThemeRowsByVariant(rows);

    expect(grouped.dark.map((entry) => entry.name)).toEqual(["b"]);
    expect(grouped.light.map((entry) => entry.name)).toEqual(["a", "c"]);
    expect(Object.isFrozen(grouped)).toBe(true);
    expect(Object.isFrozen(grouped.dark)).toBe(true);
    expect(Object.isFrozen(grouped.light)).toBe(true);
  });

  it("returns empty lists when nothing matches a variant", () => {
    const grouped = groupThemeRowsByVariant([row("only", "dark")]);

    expect(grouped.light).toEqual([]);
  });
});
