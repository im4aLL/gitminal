import type { MouseEvent } from "@opentui/core";
import type { ReactNode } from "react";
import { useClickWithoutSelection } from "@/ui/useClickWithoutSelection";

/**
 * Renders the clickable title region of a custom list row.
 *
 * The group is one horizontal box, so a click on the expansion indicator and a click on the title
 * both run the same handler while the row's other regions keep their own behavior. It clears the
 * renderer's text selection through `useClickWithoutSelection` and forwards the mouse event, so the
 * owning feature can stop propagation before an enclosing `ListRow` handles the same click. The
 * group never calls `focus()`, because native focus follows the click and the region frame owns the
 * focus ring.
 *
 * @param props - Group content, gap, shrink behavior, and mouse handler.
 * @returns The composed title region.
 */
export function RowTitle(props: {
  readonly children?: ReactNode;
  readonly gap?: number;
  readonly flexShrink?: number;
  readonly onMouseDown?: (event: MouseEvent) => void;
}): ReactNode {
  const onMouseDown = useClickWithoutSelection(props.onMouseDown);

  return (
    <box
      flexDirection="row"
      flexShrink={props.flexShrink ?? 0}
      gap={props.gap}
      overflow="hidden"
      onMouseDown={onMouseDown}
    >
      {props.children}
    </box>
  );
}
