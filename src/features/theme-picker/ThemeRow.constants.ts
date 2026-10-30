/**
 * Renderable id prefix of one theme picker row.
 *
 * The theme name follows the prefix, so a row id is stable across re-renders, filtering, and tab
 * switches, which is what lets the picker reveal the highlighted row through the scrollbox.
 */
export const THEME_ROW_ID_PREFIX = "theme-row";
