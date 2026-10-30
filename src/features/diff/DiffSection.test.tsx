import { describe, expect, it } from "bun:test";
import { MouseEvent } from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";
import type { DiffFileView, DiffSectionView } from "@/domain/repository/repository.types";
import { DiffSection } from "@/features/diff/DiffSection";
import type { DiffActionView } from "@/features/diff/diffPanel.types";
import { ShellTestProviders } from "@/test/shell.harness";

/**
 * Builds one file row.
 *
 * @param overrides - Fields to override.
 * @returns The row model.
 */
function file(overrides: Partial<DiffFileView> = {}): DiffFileView {
  return {
    id: "untracked::untracked.txt",
    section: "untracked",
    statusLetter: "?",
    status: "added",
    path: "untracked.txt",
    oldPath: null,
    conflicted: false,
    ...overrides,
  };
}

/**
 * Builds one section view.
 *
 * @param files - Section files.
 * @returns The section view.
 */
function section(files: readonly DiffFileView[]): DiffSectionView {
  return {
    section: "untracked",
    title: "Untracked Files",
    files,
    paths: files.map((entry) => entry.path),
  };
}

/**
 * Builds the two bulk actions of the untracked section.
 *
 * @param disabled - Whether both actions are disabled with a reason.
 * @returns The action views.
 */
function actions(disabled: boolean): readonly DiffActionView[] {
  return [
    {
      id: "diff.stageAll",
      label: "Stage All",
      disabled,
      reason: disabled ? "no files" : undefined,
      onPress: () => {},
    },
    {
      id: "diff.deleteAllUntracked",
      label: "Delete All",
      disabled,
      reason: disabled ? "no files" : undefined,
      onPress: () => {},
    },
  ];
}

/** Column of the section title that the single-click tests press. */
const SECTION_TITLE_CLICK_X = 2;

/** Row of the section title that the single-click tests press. */
const SECTION_TITLE_CLICK_Y = 0;

/**
 * Renders one section.
 *
 * @param view - Section model.
 * @param width - Container width.
 * @param terminalWidth - Terminal width.
 * @param bulkActions - Bulk actions.
 * @param handlers - Section callbacks exercised by a test.
 * @returns The renderer setup.
 */
async function renderSection(
  view: DiffSectionView,
  width: number,
  terminalWidth: number,
  bulkActions: readonly DiffActionView[],
  handlers: { readonly onToggle?: () => void; readonly onMouseDown?: () => void } = {},
): Promise<Awaited<ReturnType<typeof testRender>>> {
  const setup = await testRender(
    <ShellTestProviders>
      <box flexDirection="column" width={width} height={8}>
        <DiffSection
          view={view}
          width={width}
          expanded
          selected={false}
          focused={false}
          emptyText="No untracked files"
          bulkActions={bulkActions}
          onToggle={handlers.onToggle ?? (() => {})}
          onMouseDown={handlers.onMouseDown ?? (() => {})}
          renderFile={() => null}
        />
      </box>
    </ShellTestProviders>,
    { width: terminalWidth, height: 10 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return setup;
}

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

describe("DiffSection", () => {
  it("keeps the title, count, and every bulk action visible at 36 cells", async () => {
    const setup = await renderSection(section([file()]), 36, 80, actions(false));
    const frame = setup.captureCharFrame();

    expect(frame).toContain("Untracked Files (1)");
    expect(frame).toContain("Stage All");
    expect(frame).toContain("Delete All");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps every disabled reason reachable when the actions move to a second line", async () => {
    const setup = await renderSection(section([]), 36, 80, actions(true));
    const frame = setup.captureCharFrame();

    expect(frame).toContain("Untracked Files (0)");
    expect(frame).toContain("Stage All");
    expect(frame).toContain("Delete All");
    expect((frame.match(/no files/g) ?? []).length).toBe(2);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("keeps the actions on the title line when the measured width has room", async () => {
    const setup = await renderSection(section([file()]), 100, 120, actions(false));
    const titleLine = setup.captureCharFrame().split("\n")[0] ?? "";

    expect(titleLine).toContain("Untracked Files (1)");
    expect(titleLine).toContain("Stage All");
    expect(titleLine).toContain("Delete All");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("moves the actions to a second line exactly when the disabled reasons stop fitting", async () => {
    const inline = await renderSection(section([]), 65, 80, actions(true));
    const inlineTitle = inline.captureCharFrame().split("\n")[0] ?? "";

    expect(inlineTitle).toContain("Untracked Files (0)");
    expect(inlineTitle).toContain("Stage All no files");
    expect(inlineTitle).toContain("Delete All no files");

    await act(async () => {
      await inline.dispose();
    });

    const wrapped = await renderSection(section([]), 64, 80, actions(true));
    const wrappedFrame = wrapped.captureCharFrame();
    const wrappedTitle = wrappedFrame.split("\n")[0] ?? "";

    expect(wrappedTitle).toContain("Untracked Files (0)");
    expect(wrappedTitle).not.toContain("Stage All");
    expect(wrappedFrame).toContain("Stage All no files");
    expect(wrappedFrame).toContain("Delete All no files");

    await act(async () => {
      await wrapped.dispose();
    });
  });

  it("toggles and selects the section from one click on the title", async () => {
    let toggles = 0;
    let selections = 0;
    const setup = await renderSection(section([file()]), 80, 80, actions(false), {
      onToggle: () => {
        toggles += 1;
      },
      onMouseDown: () => {
        selections += 1;
      },
    });

    await act(async () => {
      await setup.mockMouse.click(SECTION_TITLE_CLICK_X, SECTION_TITLE_CLICK_Y);
    });

    expect(toggles).toBe(1);
    expect(selections).toBe(1);
    expect(setup.renderer.hasSelection).toBe(false);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("does not toggle the section when a bulk action is pressed", async () => {
    let toggles = 0;
    const setup = await renderSection(section([file()]), 80, 80, actions(false), {
      onToggle: () => {
        toggles += 1;
      },
    });

    await act(async () => {
      clickById(setup, "section::untracked::diff.stageAll");
    });

    expect(toggles).toBe(0);

    await act(async () => {
      await setup.dispose();
    });
  });
});
