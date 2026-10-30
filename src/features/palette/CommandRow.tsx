import { describeCommandReason } from "@/domain/commands/commands.reasons";
import { PALETTE_CATEGORY_LABELS } from "@/features/palette/CommandRow.constants";
import type {
  CommandRowInput,
  PaletteCategory,
  PaletteRow,
} from "@/features/palette/CommandRow.types";
import { truncateText } from "@/lib/text";
import { ICONS } from "@/theme/icons";

/**
 * Projects one captured command into a rendered palette row.
 *
 * The row carries its command id, explicit target, label, and effective shortcut, so the list can
 * render and dispatch it without encoding anything into a string. An unavailable command keeps its
 * row and uses the exact shared reason text as its description, so a disabled entry explains itself
 * instead of disappearing. Both strings are truncated with the measured text budget.
 *
 * @param input - Captured command and its text budget.
 * @returns The projected command row.
 */
export function buildCommandRow(input: CommandRowInput): PaletteRow {
  const { descriptor } = input.entry;
  const name = truncateText(
    `${descriptor.label} (${input.entry.shortcut})`,
    input.textBudget,
    ICONS.ellipsis,
  );
  const description = truncateText(readCommandDescription(input), input.textBudget, ICONS.ellipsis);

  return {
    kind: "command",
    commandId: descriptor.id,
    target: input.entry.target,
    name,
    description,
  };
}

/**
 * Builds one category header row.
 *
 * The header is a real band with its own background, so it carries only the category label. The
 * label is truncated with the measured text budget.
 *
 * @param category - Group the header introduces.
 * @param textBudget - Characters available on one rendered line.
 * @returns The projected header row.
 */
export function buildHeaderRow(category: PaletteCategory, textBudget: number): PaletteRow {
  return {
    kind: "header",
    category,
    label: truncateText(PALETTE_CATEGORY_LABELS[category], textBudget, ICONS.ellipsis),
  };
}

/**
 * Builds the blank row that separates one group from the previous one.
 *
 * The spacer carries the category of the header it precedes, which gives it a stable identity
 * without depending on an array index or a truncated label.
 *
 * @param category - Group the spacer precedes.
 * @returns The projected spacer row.
 */
export function buildSpacerRow(category: PaletteCategory): PaletteRow {
  return { kind: "spacer", category };
}

/**
 * Reads the stable identity of one rendered palette row.
 *
 * @param row - Rendered palette row.
 * @returns A key that is unique within one rendered list and stable across filtering.
 */
export function readPaletteRowKey(row: PaletteRow): string {
  return row.kind === "command" ? `command:${row.commandId}` : `${row.kind}:${row.category}`;
}

/**
 * Reads the description shown under one command.
 *
 * An unavailable command shows the exact shared reason text. An available command shows its
 * registry description.
 *
 * @param input - Captured command.
 * @returns The description text before truncation.
 */
function readCommandDescription(input: CommandRowInput): string {
  if (input.entry.availability.available) {
    return input.entry.descriptor.description;
  }

  return describeCommandReason(input.entry.availability.reason ?? "command-not-implemented");
}
