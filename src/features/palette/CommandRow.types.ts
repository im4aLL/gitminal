import type {
  CommandAvailability,
  CommandDescriptor,
  CommandTarget,
} from "@/domain/commands/commands.types";
import type { ActionCategory } from "@/domain/keymap/keymap.types";

/** Category of one palette row; recents are a synthetic group ahead of the catalogue groups. */
export type PaletteCategory = ActionCategory | "recent";

/**
 * One captured palette command.
 *
 * The entry is built once when the palette opens, so its target and availability are the values the
 * user saw. Activation re-derives both instead of trusting this capture.
 */
export interface PaletteCommandEntry {
  /** Configured remote for a remote-wide fetch entry. */
  readonly fetchRemote?: string;
  /** Registry descriptor the entry came from. */
  readonly descriptor: CommandDescriptor;
  /** Explicit target captured when the palette opened. */
  readonly target: CommandTarget;
  /** Availability captured with the target. */
  readonly availability: CommandAvailability;
  /** Effective bindings formatted for display, empty when the action is unbound. */
  readonly shortcuts: readonly string[];
  /** First effective shortcut, or the documented "Unbound" label. */
  readonly shortcut: string;
}

/**
 * One rendered palette row.
 *
 * A header is a full-width band naming its category, a spacer is the blank row that separates two
 * groups, and a command row carries the runnable payload plus its already-budgeted display text.
 * Only a command row is selectable.
 */
export type PaletteRow =
  | {
      readonly kind: "header";
      readonly category: PaletteCategory;
      readonly label: string;
    }
  | { readonly kind: "spacer"; readonly category: PaletteCategory }
  | {
      readonly kind: "command";
      readonly commandId: string;
      readonly target: CommandTarget;
      readonly name: string;
      readonly description: string;
    };

/** Input accepted by `buildCommandRow`. */
export interface CommandRowInput {
  /** Captured command entry. */
  readonly entry: PaletteCommandEntry;
  /** Characters available on one rendered line. */
  readonly textBudget: number;
}
