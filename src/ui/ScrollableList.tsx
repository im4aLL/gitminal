import type { ScrollBoxRenderable } from "@opentui/core";
import type { ReactNode, Ref } from "react";
import { useScrollbarOptions } from "@/ui/useScrollbarOptions";

/**
 * Renders a plain scroll container for short or moderate content.
 *
 * The scrollbox is not focusable by default because the owning region frame owns native focus. A
 * modal list that is itself a focus target, such as the command palette result list, opts in with
 * `focusable`. A caller that needs keyboard scrolling passes a typed scroll ref and registers its
 * own region or overlay actions, so the scroll position stays under that surface's control. Mouse
 * wheel and scrollbar drag remain available without any caller work.
 *
 * @param props - Content, optional id, scroll ref, size-change callback, flex grow factor, fixed
 * height, culling, and whether the list accepts native focus.
 * @returns The scroll container.
 */
export function ScrollableList(props: {
  readonly children?: ReactNode;
  readonly id?: string;
  readonly scrollRef?: Ref<ScrollBoxRenderable>;
  readonly onSizeChange?: () => void;
  readonly flexGrow?: number;
  readonly height?: number;
  readonly viewportCulling?: boolean;
  readonly focusable?: boolean;
}): ReactNode {
  const scrollbarOptions = useScrollbarOptions();

  return (
    <scrollbox
      id={props.id}
      ref={props.scrollRef}
      onSizeChange={props.onSizeChange}
      height={props.height}
      flexGrow={props.flexGrow ?? 1}
      flexShrink={1}
      focusable={props.focusable ?? false}
      viewportCulling={props.viewportCulling ?? false}
      scrollbarOptions={scrollbarOptions}
    >
      {props.children}
    </scrollbox>
  );
}
