import type { TabSelectRenderable } from "@opentui/core";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import type { ThemeVariant } from "@/domain/theme/theme.types";
import {
  THEME_PICKER_TAB_WIDTH,
  THEME_PICKER_TABS_ID,
} from "@/features/theme-picker/ThemePicker.constants";
import {
  readTabIndex,
  readTabOptions,
  readTabVariant,
  readTabVariantAtColumn,
} from "@/features/theme-picker/ThemePicker.tabs";
import { useTokens } from "@/theme/useTokens";

/**
 * Renders the variant tab bar above the picker search field.
 *
 * The bar is a `<tab-select>` from the sanctioned component catalogue, rendered without native focus
 * on purpose: a natively focused tab bar enters native list mode and takes `nav.up`, `nav.down`, and
 * `nav.activate` away from the picker, which would break both the row highlight and Apply. Native
 * focus is therefore cleared on the mounted renderable, which the widget does not accept as a prop.
 * The picker owns Left and Right while the tab zone has the keyboard and pushes the active tab into
 * the widget through `setSelectedIndex`, so the visible bar always matches picker state.
 *
 * A mouse click cannot focus the unfocused widget, so the column under the pointer is resolved to a
 * variant and reported separately; the owning view then selects that tab and moves the keyboard focus
 * to the rows, which keeps a click and a key press consistent. `TabSelectRenderable` has no
 * click-to-select path of its own, so the click column is resolved here instead of arriving through
 * `onChange`.
 *
 * The colors blend the strip into the `surface` modal frame and use the `selection` token for the
 * selected fill, which is the same selected fill a native select paints. The tab bar is rendered
 * without the native underline block, so the selected tab is a flat fill instead of a bordered box.
 * While the tab zone owns the keyboard the whole bar brightens from `muted` to `text` and the
 * selected tab's label gains the `ICONS.focus` marker, so the focus state reads without color alone.
 * A theme whose `surface` and `selection` tokens are identical, Solarized Dark today, identifies its
 * selected tab by the brighter text and the focus marker rather than by the fill.
 *
 * @param props - Active variant, tab selection callback, mouse-press callback, and focus state.
 * @returns The native tab selector.
 */
export function ThemePickerTabs(props: {
  readonly variant: ThemeVariant;
  readonly onSelect: (variant: ThemeVariant) => void;
  readonly onPress: (variant: ThemeVariant) => void;
  readonly focused: boolean;
}): ReactNode {
  const tokens = useTokens();
  const ref = useRef<TabSelectRenderable | null>(null);
  const options = useMemo(
    () => [...readTabOptions(props.focused, props.variant)],
    [props.focused, props.variant],
  );

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.focusable = false;
    }
  }, []);

  useEffect(() => {
    ref.current?.setSelectedIndex(readTabIndex(props.variant));
  }, [props.variant]);

  return (
    <tab-select
      id={THEME_PICKER_TABS_ID}
      ref={ref}
      options={options}
      showDescription={false}
      showUnderline={false}
      tabWidth={THEME_PICKER_TAB_WIDTH}
      backgroundColor={tokens.surface}
      textColor={props.focused ? tokens.text : tokens.muted}
      selectedBackgroundColor={tokens.selection}
      selectedTextColor={tokens.text}
      selectedDescriptionColor={tokens.muted}
      onChange={(index) => {
        props.onSelect(readTabVariant(index));
      }}
      onMouseDown={(event) => {
        const bar = ref.current;

        if (bar === null) {
          return;
        }

        props.onPress(readTabVariantAtColumn(event.x - bar.x, THEME_PICKER_TAB_WIDTH));
      }}
    />
  );
}
