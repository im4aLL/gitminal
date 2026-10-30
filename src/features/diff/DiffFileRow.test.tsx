import { describe, expect, it } from "bun:test";
import { MouseEvent } from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";
import type { DiffFileView, DiffStatusLetter } from "@/domain/repository/repository.types";
import { DiffFileRow } from "@/features/diff/DiffFileRow";
import { ShellTestProviders } from "@/test/shell.harness";
import { ICONS } from "@/theme/icons";

/**
 * Builds one file row model.
 *
 * @param overrides - Fields to override.
 * @returns The row model.
 */
function file(overrides: Partial<DiffFileView> = {}): DiffFileView {
  return {
    id: "working::src/app.ts",
    section: "working",
    statusLetter: "M",
    status: "modified",
    path: "src/app.ts",
    oldPath: null,
    conflicted: false,
    ...overrides,
  };
}

/** Column of the expand indicator that the single-click tests press. */
const INDICATOR_CLICK_X = 0;

/** Column of the path text that the single-click tests press. */
const PATH_CLICK_X = 4;

/** Row of the only interactive row that the single-click tests press. */
const ROW_CLICK_Y = 0;

/**
 * Dispatches a mouse-down event to one rendered box.
 *
 * @param setup - Renderer setup.
 * @param id - Renderable id.
 */
function clickById(setup: Awaited<ReturnType<typeof testRender>>, id: string): void {
  const box = setup.renderer.root.findDescendantById(id);

  if (box === undefined) {
    throw new Error(`box ${id} is missing`);
  }

  box.processMouseEvent(
    new MouseEvent(box, {
      type: "down",
      button: 0,
      x: 0,
      y: 0,
      modifiers: { shift: false, alt: false, ctrl: false },
    }),
  );
}

/**
 * Renders one row inside the provider stack.
 *
 * @param view - Row model.
 * @param options - Expansion, counts, actions, width, and row callbacks.
 * @returns The renderer setup.
 */
async function renderRow(
  view: DiffFileView,
  options: {
    readonly expanded?: boolean;
    readonly counts?: { readonly add: number; readonly remove: number } | null;
    readonly actions?: readonly {
      readonly id: string;
      readonly label: string;
      readonly disabled: boolean;
      readonly reason?: string;
      readonly onPress: () => void;
    }[];
    readonly width?: number;
    readonly terminalWidth?: number;
    readonly onToggle?: () => void;
    readonly onMouseDown?: () => void;
  } = {},
): Promise<Awaited<ReturnType<typeof testRender>>> {
  const width = options.width ?? 70;
  const terminalWidth = options.terminalWidth ?? width;
  const setup = await testRender(
    <ShellTestProviders>
      <box flexDirection="column" width={width} height={6}>
        <DiffFileRow
          file={view}
          width={width}
          selected
          focused
          expanded={options.expanded ?? false}
          counts={options.counts ?? null}
          actions={options.actions ?? []}
          onToggle={options.onToggle ?? (() => {})}
          onMouseDown={options.onMouseDown ?? (() => {})}
        />
      </box>
    </ShellTestProviders>,
    { width: terminalWidth, height: 8 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return setup;
}

describe("DiffFileRow", () => {
  it("renders the status letter, path, counts, and expand indicator", async () => {
    const setup = await renderRow(file(), {
      counts: { add: 3, remove: 1 },
      expanded: true,
    });
    const frame = setup.captureCharFrame();

    expect(frame).toContain("M");
    expect(frame).toContain("src/app.ts");
    expect(frame).toContain("+3 -1");
    expect(frame).toContain(ICONS.expanded);
    expect(frame).not.toContain(ICONS.selected);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("renders each documented status letter", async () => {
    const letters: readonly (readonly [DiffStatusLetter, string])[] = [
      ["M", "modified"],
      ["A", "added"],
      ["D", "deleted"],
      ["R", "renamed"],
      ["C", "copied"],
      ["U", "conflicted"],
      ["?", "added"],
    ];

    for (const [letter, status] of letters) {
      const setup = await renderRow(
        file({ statusLetter: letter, status: status as DiffFileView["status"] }),
      );

      expect(setup.captureCharFrame()).toContain(letter);

      await act(async () => {
        await setup.dispose();
      });
    }
  });

  it("renders a rename as old -> new", async () => {
    const setup = await renderRow(
      file({ statusLetter: "R", status: "renamed", oldPath: "old.ts" }),
    );
    const frame = setup.captureCharFrame();

    expect(frame).toContain("old.ts -> src/app.ts");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("renders inline actions and keeps a disabled one visible with its reason", async () => {
    const setup = await renderRow(file({ section: "staged" }), {
      actions: [
        {
          id: "diff.unstage",
          label: "Unstage",
          disabled: true,
          reason: "read-only",
          onPress: () => {},
        },
      ],
    });
    const frame = setup.captureCharFrame();

    expect(frame).toContain("Unstage");
    expect(frame).toContain("read-only");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("truncates a long path and keeps the status letter", async () => {
    const setup = await renderRow(file({ path: `${"very-long-path/".repeat(12)}file.ts` }), {
      width: 40,
    });
    const frame = setup.captureCharFrame();

    expect(frame).toContain("...");
    expect(frame).toContain("M");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("budgets the path from its container width when the terminal is wider", async () => {
    const setup = await renderRow(file({ path: `${"very-long-path/".repeat(12)}file.ts` }), {
      width: 40,
      terminalWidth: 80,
      counts: { add: 12, remove: 3 },
    });
    const frame = setup.captureCharFrame();
    const firstLine = frame.split("\n")[0] ?? "";

    expect(firstLine).toContain("...");
    expect(firstLine).toContain("M");
    expect(firstLine).toContain("+12 -3");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("toggles and selects the file from one click on the indicator or the path", async () => {
    let toggles = 0;
    let selections = 0;
    const setup = await renderRow(file(), {
      onToggle: () => {
        toggles += 1;
      },
      onMouseDown: () => {
        selections += 1;
      },
    });

    await act(async () => {
      await setup.mockMouse.click(INDICATOR_CLICK_X, ROW_CLICK_Y);
      await setup.mockMouse.click(PATH_CLICK_X, ROW_CLICK_Y);
    });

    expect(toggles).toBe(2);
    expect(selections).toBe(2);
    expect(setup.renderer.hasSelection).toBe(false);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("does not toggle the file when an inline action is pressed", async () => {
    let toggles = 0;
    const setup = await renderRow(file(), {
      actions: [
        {
          id: "diff.stage",
          label: "Stage",
          disabled: false,
          onPress: () => {},
        },
      ],
      onToggle: () => {
        toggles += 1;
      },
    });

    await act(async () => {
      clickById(setup, "working::src/app.ts::diff.stage");
    });

    expect(toggles).toBe(0);

    await act(async () => {
      await setup.dispose();
    });
  });
});
