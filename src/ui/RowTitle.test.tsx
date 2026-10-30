import { describe, expect, it } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { act, type ReactNode } from "react";
import { ShellTestProviders } from "@/test/shell.harness";
import { ListRow } from "@/ui/ListRow";
import { RowTitle } from "@/ui/RowTitle";

/** Cell of the row title that the click tests press. */
const TITLE_CLICK_X = 1;

/** Row of the row title that the click tests press. */
const TITLE_CLICK_Y = 0;

/**
 * Renders one row title inside the provider stack.
 *
 * @param node - Content to render.
 * @returns The renderer setup.
 */
async function renderTitle(node: ReactNode): Promise<Awaited<ReturnType<typeof testRender>>> {
  const setup = await testRender(
    <ShellTestProviders>
      <box flexDirection="column" width={30} height={3}>
        {node}
      </box>
    </ShellTestProviders>,
    { width: 30, height: 3 },
  );

  await act(async () => {
    await setup.renderOnce();
  });

  return setup;
}

describe("RowTitle", () => {
  it("runs the handler from a click on its content without leaving text selected", async () => {
    let presses = 0;
    const setup = await renderTitle(
      <RowTitle
        onMouseDown={() => {
          presses += 1;
        }}
      >
        <text>file.ts</text>
      </RowTitle>,
    );

    await act(async () => {
      await setup.mockMouse.click(TITLE_CLICK_X, TITLE_CLICK_Y);
    });

    expect(presses).toBe(1);
    expect(setup.renderer.hasSelection).toBe(false);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("lets the handler stop the click before an enclosing row handles it", async () => {
    let titlePresses = 0;
    let rowPresses = 0;
    const setup = await renderTitle(
      <ListRow
        onMouseDown={() => {
          rowPresses += 1;
        }}
      >
        <RowTitle
          onMouseDown={(event) => {
            event.stopPropagation();
            titlePresses += 1;
          }}
        >
          <text>file.ts</text>
        </RowTitle>
      </ListRow>,
    );

    await act(async () => {
      await setup.mockMouse.click(TITLE_CLICK_X + 1, TITLE_CLICK_Y);
    });

    expect(titlePresses).toBe(1);
    expect(rowPresses).toBe(0);

    await act(async () => {
      await setup.dispose();
    });
  });
});
