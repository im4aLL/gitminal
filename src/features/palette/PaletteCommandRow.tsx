import type { ReactNode } from "react";
import type { PaletteRow } from "@/features/palette/CommandRow.types";
import { useTokens } from "@/theme/useTokens";
import { ListRow } from "@/ui/ListRow";

/**
 * Renders one selectable command row in the palette result list.
 *
 * The row shows its name and description on two lines and composes `ListRow` for the leading
 * selection marker and the press handling, so the cursor never relies on color alone and clearing
 * OpenTUI's text selection stays inside the shared primitive. The description uses the
 * `diffContext` token, matching the tone the app paints for diff context lines.
 *
 * @param props - Command row, stable renderable id, selection flag, and press handler.
 * @returns The composed command row.
 */
export function PaletteCommandRow(props: {
  readonly row: Extract<PaletteRow, { readonly kind: "command" }>;
  readonly id: string;
  readonly selected: boolean;
  readonly onPress: () => void;
}): ReactNode {
  const tokens = useTokens();

  return (
    <ListRow
      id={props.id}
      selected={props.selected}
      focused={props.selected}
      onMouseDown={props.onPress}
    >
      <text fg={tokens.text} wrapMode="none">
        {` ${props.row.name}`}
      </text>
      <text fg={tokens.diffContext} wrapMode="none">
        {` ${props.row.description}`}
      </text>
    </ListRow>
  );
}
