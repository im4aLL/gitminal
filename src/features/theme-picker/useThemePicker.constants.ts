import type {
  ThemePickerControl,
  ThemePickerFocusZone,
} from "@/features/theme-picker/useThemePicker.types";

/** Footer controls in vertical navigation order. */
export const PICKER_CONTROLS: readonly ThemePickerControl[] = Object.freeze([
  "export",
  "cancel",
  "apply",
]);

/** Control focused when the picker opens; applying the highlighted theme is non-destructive. */
export const INITIAL_CONTROL: ThemePickerControl = "apply";

/** Focus zones in the order `focus.next` and `focus.previous` cycle them. */
export const FOCUS_ZONE_ORDER: readonly ThemePickerFocusZone[] = Object.freeze([
  "tabs",
  "rows",
  "actions",
]);

/** Scroll keys the picker owns itself, as a plain list of steps. */
export const HIGHLIGHT_STEPS: Readonly<Record<"up" | "down", number>> = Object.freeze({
  up: -1,
  down: 1,
});
