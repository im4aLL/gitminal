import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useModalControlCycle } from "@/app/hooks/useModalControlCycle";
import type {
  ModalControlResolution,
  ModalHorizontalInput,
} from "@/app/hooks/useModalControlCycle.types";
import { useTheme } from "@/app/hooks/useTheme";
import { applyThemeCapability } from "@/domain/theme/theme.capability";
import { THEME_NAMES, THEMES } from "@/domain/theme/theme.registry";
import type { HexColor, ThemeColorCapability, ThemeName } from "@/domain/theme/theme.types";
import { filterThemeRows } from "@/features/theme-picker/ThemePicker.filter";
import { INITIAL_CONTROL, PICKER_CONTROLS } from "@/features/theme-picker/useThemePicker.constants";
import type {
  ThemePickerControl,
  ThemePickerFocusZone,
  ThemePickerRow,
  ThemePickerSearch,
  ThemePickerViewState,
} from "@/features/theme-picker/useThemePicker.types";
import { useThemeControls } from "@/theme/useThemeControls";

/**
 * Owns the picker's highlight, focus zone, filter, footer cycle, and unmount restore.
 *
 * The highlight is stored by theme name rather than by index, so a filter change keeps the
 * highlighted theme highlighted while it stays visible and falls back to the first match when it does
 * not. The fallback previews that first match, and it never overrides an explicit preview or a
 * restore, because it only runs while the stored highlight is filtered out. The highlight is the live preview: changing it writes the provider through `ThemeControls`, so
 * the picker never re-reads a file. `settle` marks the picker as applied or cancelled, which stops
 * the unmount guard from restoring the previous theme after the user has already chosen one.
 *
 * @param search - Search state the rows are filtered by and the view renders.
 * @returns The view state the commit and navigation hooks share.
 */
export function useThemePickerState(search: ThemePickerSearch): ThemePickerViewState {
  const theme = useTheme();
  const controls = useThemeControls();
  const [highlightedName, setHighlightedName] = useState<ThemeName>(theme.name);
  const [focusedZone, setFocusedZone] = useState<ThemePickerFocusZone>("rows");
  const previousName = useRef<ThemeName>(theme.name);
  const settled = useRef(false);
  const allRows = useMemo(
    () => buildRows(theme.name, theme.capability),
    [theme.name, theme.capability],
  );
  const rows = useMemo(
    () => filterThemeRows(allRows, search.activeQuery),
    [allRows, search.activeQuery],
  );
  const highlightedIndex = readHighlightedIndex(rows, highlightedName);
  const cycle = useModalControlCycle<ThemePickerControl>({
    order: PICKER_CONTROLS,
    initial: INITIAL_CONTROL,
    registerVerticalNavigation: false,
    onHorizontal: (input) =>
      readHorizontalControl(input, () => {
        setFocusedZone("actions");
      }),
  });

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

  return {
    theme,
    controls,
    rows,
    highlightedIndex,
    setHighlightedName,
    focusedZone,
    setFocusedZone,
    cycle,
    previousName: previousName.current,
    query: search.query,
    setQuery: search.setQuery,
    settle,
  };
}

/**
 * Applies the picker's Left and Right rule.
 *
 * Left moves from Apply to Cancel and right moves back, which is the only horizontal choice in a
 * two-action footer. A horizontal step means the footer now owns focus, so the caller moves the focus
 * zone before the control changes.
 *
 * @param input - Focused control and requested direction.
 * @param onFocusActions - Callback that moves keyboard focus into the footer actions.
 * @returns The control to focus next.
 */
function readHorizontalControl(
  input: ModalHorizontalInput<ThemePickerControl>,
  onFocusActions: () => void,
): ModalControlResolution<ThemePickerControl> {
  onFocusActions();

  return {
    kind: "focus",
    control: input.direction === "left" ? "cancel" : "apply",
  };
}

/**
 * Builds every picker row for the active theme name and capability.
 *
 * The swatch fill comes from the capability-mapped tokens, so a 256-color terminal previews the
 * quantized color the app would actually render instead of the raw truecolor value. A monochrome
 * terminal has no swatch fill, so the row falls back to the plain marker from `Swatch` and the name,
 * variant label, and active marker carry all meaning.
 *
 * @param activeName - Theme currently rendered, including a live preview.
 * @param capability - Terminal capability that decides the final swatch color.
 * @returns The rows in catalogue order.
 */
function buildRows(
  activeName: ThemeName,
  capability: ThemeColorCapability,
): readonly ThemePickerRow[] {
  return Object.freeze(
    THEME_NAMES.map((name) => {
      const definition = THEMES[name];

      return {
        name,
        label: definition.label,
        variant: definition.variant,
        active: name === activeName,
        swatchColor: readSwatchColor(name, capability),
      };
    }),
  );
}

/**
 * Reads one theme's swatch fill for the current capability.
 *
 * The theme is mapped through the same capability stage the provider uses, so the picker never shows
 * a color the rest of the app would not render. Monochrome keeps the marker path instead.
 *
 * @param name - Built-in theme name.
 * @param capability - Terminal capability.
 * @returns The mapped fill color, or `null` when the marker replaces the swatch.
 */
function readSwatchColor(name: ThemeName, capability: ThemeColorCapability): HexColor | null {
  if (capability === "monochrome") {
    return null;
  }

  const definition = THEMES[name];
  const mapped = applyThemeCapability(
    { ...definition, capability: "truecolor", warnings: [] },
    capability,
  );

  return mapped.tokens.background;
}

/**
 * Reads the filtered index of the highlighted theme.
 *
 * A highlighted theme that the current filter hides falls back to the first match, which keeps the
 * highlight, the live preview, and the applied row in agreement.
 *
 * @param rows - Filtered rows in catalogue order.
 * @param highlightedName - Theme name the highlight is stored under.
 * @returns The index to render as highlighted, or zero when no row matches.
 */
function readHighlightedIndex(rows: readonly ThemePickerRow[], highlightedName: ThemeName): number {
  const index = rows.findIndex((row) => row.name === highlightedName);

  return index === -1 ? 0 : index;
}
