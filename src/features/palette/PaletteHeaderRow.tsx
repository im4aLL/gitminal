import type { ReactNode } from "react";
import { useTokens } from "@/theme/useTokens";

/**
 * Renders one palette category header as a content-sized band.
 *
 * The outer row fills the list width but stays transparent, and the inner band hugs its label with
 * one cell of horizontal padding, so the header reads as a section chip instead of a full-width
 * bar. The band uses the `panel` token against the modal's `surface` background, and the label
 * uses the `text` token. The row is never selectable, so it takes no marker and no highlight.
 *
 * @param props - Category label.
 * @returns The composed header band.
 */
export function PaletteHeaderRow(props: { readonly label: string }): ReactNode {
  const tokens = useTokens();

  return (
    <box width="100%" height={1} flexShrink={0} flexDirection="row">
      <box height={1} paddingX={1} backgroundColor={tokens.panel}>
        <text fg={tokens.text} wrapMode="none">
          {props.label}
        </text>
      </box>
    </box>
  );
}
