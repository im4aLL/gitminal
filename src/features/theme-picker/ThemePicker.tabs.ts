import type { TabSelectOption } from "@opentui/core";
import type { ModalControlDirection } from "@/app/hooks/useModalControlCycle.types";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import {
  THEME_PICKER_TAB_LABELS,
  THEME_PICKER_TAB_VARIANTS,
} from "@/features/theme-picker/ThemePicker.constants";
import { ICONS } from "@/theme/icons";

/**
 * Reads the tab position of one variant.
 *
 * @param variant - Variant the tab bar shows.
 * @returns The zero-based tab index.
 */
export function readTabIndex(variant: ThemeVariant): number {
  const index = THEME_PICKER_TAB_VARIANTS.indexOf(variant);

  return Math.max(index, 0);
}

/**
 * Reads the variant one tab position shows.
 *
 * A position outside the bar falls back to the first tab, which is what a stale index after a narrowed
 * bar would otherwise need a second guard for.
 *
 * @param index - Zero-based tab index.
 * @returns The variant that tab renders.
 */
export function readTabVariant(index: number): ThemeVariant {
  return (
    THEME_PICKER_TAB_VARIANTS[Math.min(Math.max(0, index), THEME_PICKER_TAB_VARIANTS.length - 1)] ??
    "dark"
  );
}

/**
 * Reads the variant one horizontal step away.
 *
 * The two tabs wrap, so stepping left from the first tab lands on the last one and stepping right from
 * the last tab lands on the first. The bracket actions use the same wrapped step the zone cycle used
 * to provide.
 *
 * @param current - Variant the tab bar is showing.
 * @param direction - Requested horizontal direction.
 * @returns The variant the tab bar should show next.
 */
export function readAdjacentVariant(
  current: ThemeVariant,
  direction: ModalControlDirection,
): ThemeVariant {
  const count = THEME_PICKER_TAB_VARIANTS.length;
  const step = direction === "left" ? -1 : 1;
  const index = (readTabIndex(current) + step + count) % count;

  return readTabVariant(index);
}

/**
 * Builds the tab options the bar renders for one focus state.
 *
 * The selected tab carries the `ICONS.focus` marker only while the tab zone owns the keyboard, which
 * is what makes the focus state legible without relying on color alone. Descriptions stay the plain
 * labels, because the bar never shows them and a tab-select option requires the field.
 *
 * @param focused - True while the tab bar owns the keyboard.
 * @param variant - Variant tab the bar is showing.
 * @returns The options in bar order.
 */
export function readTabOptions(
  focused: boolean,
  variant: ThemeVariant,
): readonly TabSelectOption[] {
  return THEME_PICKER_TAB_VARIANTS.map((tab) => ({
    name: readTabLabel(tab, focused && tab === variant),
    description: THEME_PICKER_TAB_LABELS[tab],
  }));
}

/**
 * Reads one tab's rendered label.
 *
 * @param tab - Variant the tab lists.
 * @param marked - True when the tab is selected and the bar owns the keyboard.
 * @returns The plain label, or the label prefixed with the focus marker.
 */
function readTabLabel(tab: ThemeVariant, marked: boolean): string {
  const label = THEME_PICKER_TAB_LABELS[tab];

  return marked ? `${ICONS.focus} ${label}` : label;
}

/**
 * Reads the variant under one column of the tab bar.
 *
 * The tab bar is a frame-buffer renderable with a fixed tab width, so the column inside the bar
 * decides which tab a click landed on. A click past the last tab resolves to that last tab.
 *
 * @param column - Column inside the tab bar, already relative to its left edge.
 * @param tabWidth - Width of one tab in cells.
 * @returns The variant that column shows.
 */
export function readTabVariantAtColumn(column: number, tabWidth: number): ThemeVariant {
  const safeWidth = tabWidth > 0 ? tabWidth : 1;

  return readTabVariant(Math.floor(Math.max(0, column) / safeWidth));
}
