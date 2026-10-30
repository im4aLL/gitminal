import type { KeymapHint } from "@/domain/keymap/keymap.types";
import type { FooterHintGroup } from "@/features/shell/Footer.hints.types";

/**
 * Merges declared action groups into single compact footer hints.
 *
 * A group replaces its member hints only when every action the group references is present in the
 * input, so an unavailable member falls back to the individual hints instead of advertising a
 * partial chord set. Group keys are read from the members' effective bindings by slot, so a
 * rebinding flows into the merged hint and a binding removed by configuration is skipped. The
 * merged hint keeps the earliest member position and the best (lowest) member priority, so width
 * shrinking still drops the least important hint first.
 *
 * @param hints - Footer hints ordered from keep-first to drop-first.
 * @param groups - Disjoint groups of actions to advertise together.
 * @returns Hints with every applicable group merged in place.
 */
export function compactHints(
  hints: readonly KeymapHint[],
  groups: readonly FooterHintGroup[],
): readonly KeymapHint[] {
  const byAction = new Map<string, KeymapHint>();
  const order = new Map<string, number>();

  hints.forEach((hint, index) => {
    if (!byAction.has(hint.actionId)) {
      byAction.set(hint.actionId, hint);
    }

    if (!order.has(hint.actionId)) {
      order.set(hint.actionId, index);
    }
  });

  const merged = new Map<string, KeymapHint>();
  const consumed = new Set<string>();

  for (const group of groups) {
    const members = [...new Set(group.keys.map((slot) => slot.actionId))];

    if (!members.every((actionId) => byAction.has(actionId))) {
      continue;
    }

    const keys = group.keys.flatMap((slot) => {
      const key = byAction.get(slot.actionId)?.keys[slot.bindingIndex];

      return key === undefined ? [] : [key];
    });

    if (keys.length === 0) {
      continue;
    }

    const anchor = members.reduce((earliest, actionId) =>
      (order.get(actionId) ?? Number.MAX_SAFE_INTEGER) <
      (order.get(earliest) ?? Number.MAX_SAFE_INTEGER)
        ? actionId
        : earliest,
    );

    merged.set(anchor, {
      actionId: group.id,
      keys: [keys.join("/")],
      label: group.label,
      priority: Math.min(...members.map((actionId) => byAction.get(actionId)?.priority ?? 0)),
    });

    for (const actionId of members) {
      consumed.add(actionId);
    }
  }

  const result: KeymapHint[] = [];

  for (const hint of hints) {
    const groupHint = merged.get(hint.actionId);

    if (groupHint !== undefined) {
      result.push(groupHint);
      continue;
    }

    if (!consumed.has(hint.actionId)) {
      result.push(hint);
    }
  }

  return result;
}
