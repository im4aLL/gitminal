import { describe, expect, it } from "bun:test";
import type { KeymapHint } from "@/domain/keymap/keymap.types";
import { compactHints } from "@/features/shell/Footer.hints";
import type { FooterHintGroup } from "@/features/shell/Footer.hints.types";

/** Move group used across the fixtures. */
const MOVE_GROUP: FooterHintGroup = {
  id: "footer.group.move",
  label: "Move",
  keys: [
    { actionId: "nav.up", bindingIndex: 0 },
    { actionId: "nav.down", bindingIndex: 0 },
    { actionId: "nav.down", bindingIndex: 1 },
    { actionId: "nav.up", bindingIndex: 1 },
  ],
};

/**
 * Builds one footer hint fixture.
 *
 * @param actionId - Action that owns the hint.
 * @param keys - Formatted effective bindings.
 * @param priority - Drop priority.
 * @returns The hint fixture.
 */
function hint(actionId: string, keys: readonly string[], priority = 1): KeymapHint {
  return { actionId, label: actionId, keys, priority };
}

describe("compactHints", () => {
  it("merges a group at its earliest member position with joined keys", () => {
    const result = compactHints(
      [
        hint("nav.up", ["Up", "k"]),
        hint("diff.toggle", ["Enter"]),
        hint("nav.down", ["Down", "j"]),
      ],
      [MOVE_GROUP],
    );

    expect(result).toEqual([
      { actionId: "footer.group.move", label: "Move", keys: ["Up/Down/j/k"], priority: 1 },
      hint("diff.toggle", ["Enter"]),
    ]);
  });

  it("keeps the best member priority so the merged hint drops last", () => {
    const result = compactHints(
      [hint("nav.up", ["Up", "k"], 4), hint("nav.down", ["Down", "j"], 0)],
      [MOVE_GROUP],
    );

    expect(result).toEqual([
      { actionId: "footer.group.move", label: "Move", keys: ["Up/Down/j/k"], priority: 0 },
    ]);
  });

  it("keeps the individual hints when a group member is missing", () => {
    const hints = [hint("nav.up", ["Up", "k"]), hint("diff.toggle", ["Enter"])];

    expect(compactHints(hints, [MOVE_GROUP])).toEqual(hints);
  });

  it("skips a binding slot removed by configuration", () => {
    const result = compactHints([hint("nav.up", ["Up"]), hint("nav.down", ["Down"])], [MOVE_GROUP]);

    expect(result).toEqual([
      { actionId: "footer.group.move", label: "Move", keys: ["Up/Down"], priority: 1 },
    ]);
  });

  it("leaves hints outside every group untouched and in order", () => {
    const hints = [
      hint("app.help", ["?"]),
      hint("nav.up", ["Up", "k"]),
      hint("nav.down", ["Down", "j"]),
    ];

    expect(compactHints(hints, [])).toEqual(hints);
  });
});
