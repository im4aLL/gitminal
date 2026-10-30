import { describe, expect, it } from "bun:test";
import { describeCommandReason } from "@/domain/commands/commands.reasons";
import { getCommandDescriptor } from "@/domain/commands/commands.registry";
import type { CommandAvailability, CommandDescriptor } from "@/domain/commands/commands.types";
import {
  buildCommandRow,
  buildHeaderRow,
  buildSpacerRow,
  readPaletteRowKey,
} from "@/features/palette/CommandRow";
import { PALETTE_UNBOUND_LABEL } from "@/features/palette/CommandRow.constants";
import type { PaletteCommandEntry } from "@/features/palette/CommandRow.types";

/**
 * Builds one captured entry for a catalogue command.
 *
 * @param commandId - Command id present in the registry.
 * @param availability - Availability shown by the entry.
 * @param shortcut - Effective shortcut label.
 * @returns The captured entry.
 */
function entry(
  commandId: string,
  availability: CommandAvailability = { available: true },
  shortcut: string = "x",
): PaletteCommandEntry {
  const descriptor = getCommandDescriptor(commandId) as CommandDescriptor;

  return {
    descriptor,
    target: { kind: "none" },
    availability,
    shortcuts: shortcut === PALETTE_UNBOUND_LABEL ? [] : [shortcut],
    shortcut,
  };
}

describe("buildCommandRow", () => {
  it("renders the label with the effective shortcut", () => {
    const row = buildCommandRow({
      entry: entry("app.refresh", { available: true }, "r"),
      textBudget: 120,
    });

    expect(row.kind).toBe("command");
    expect(row.kind === "command" ? row.name : "").toBe("Refresh (r)");
    expect(row.kind === "command" ? row.description : "").toBe("Reload repository state");
  });

  it("labels an unbound command in the name", () => {
    const row = buildCommandRow({
      entry: entry("focus.region.topBar", { available: true }, PALETTE_UNBOUND_LABEL),
      textBudget: 120,
    });

    expect(row.kind === "command" ? row.name : "").toBe(`Focus top bar (${PALETTE_UNBOUND_LABEL})`);
  });

  it("uses the exact shared reason as the description of a disabled command", () => {
    const row = buildCommandRow({
      entry: entry("branch.delete", { available: false, reason: "missing-target" }, "d"),
      textBudget: 120,
    });

    expect(row.kind === "command" ? row.description : "").toBe(
      describeCommandReason("missing-target"),
    );
  });

  it("carries the command id and target on the row", () => {
    const target = { kind: "branch", name: "feature" } as const;
    const captured: PaletteCommandEntry = {
      ...entry("branch.checkout", { available: true }, "enter"),
      target,
    };
    const row = buildCommandRow({ entry: captured, textBudget: 120 });

    expect(row).toMatchObject({
      kind: "command",
      commandId: "branch.checkout",
      target,
    });
  });

  it("truncates a long name and description to the text budget", () => {
    const row = buildCommandRow({
      entry: entry("remote.pushForceOverwrite", { available: true }, "Ctrl+Shift+P"),
      textBudget: 20,
    });

    if (row.kind !== "command") {
      throw new Error("expected a command row");
    }

    expect(row.name.length).toBeLessThanOrEqual(20);
    expect(row.name).toContain("...");
    expect(row.description.length).toBeLessThanOrEqual(20);
  });
});

describe("buildHeaderRow", () => {
  it("renders the category label without decoration", () => {
    const row = buildHeaderRow("focus", 120);

    expect(row).toEqual({ kind: "header", category: "focus", label: "Focus" });
  });
});

describe("buildSpacerRow", () => {
  it("renders a blank spacer row that names the header it precedes", () => {
    expect(buildSpacerRow("focus")).toEqual({ kind: "spacer", category: "focus" });
  });
});

describe("readPaletteRowKey", () => {
  it("gives command and header rows stable identities", () => {
    const command = buildCommandRow({
      entry: entry("app.refresh", { available: true }, "r"),
      textBudget: 120,
    });

    expect(readPaletteRowKey(command)).toBe("command:app.refresh");
    expect(readPaletteRowKey(buildHeaderRow("focus", 120))).toBe("header:focus");
    expect(readPaletteRowKey(buildSpacerRow("focus"))).toBe("spacer:focus");
  });
});
