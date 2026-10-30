/** One key slot of a grouped footer hint. */
export interface FooterHintGroupKey {
  /** Action that supplies the binding. */
  readonly actionId: string;
  /** Index into the action's effective binding list. */
  readonly bindingIndex: number;
}

/**
 * A group of actions advertised as one compact footer hint.
 *
 * Groups must be disjoint: an action may belong to at most one group, because a consumed action is
 * removed from the individual hint list.
 */
export interface FooterHintGroup {
  /** Stable group id used as the merged hint's action id. */
  readonly id: string;
  /** Merged hint label. */
  readonly label: string;
  /** Ordered key slots shown in the merged hint. */
  readonly keys: readonly FooterHintGroupKey[];
}
