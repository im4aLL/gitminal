import { describe, expect, it } from "bun:test";
import type { SelectRenderable } from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";
import { ShellTestProviders } from "@/test/shell.harness";
import { SelectField } from "@/ui/SelectField";

const OPTIONS = [
  { label: "Delete locally", value: "local" },
  { label: "Delete locally and remotely", description: "pushes a delete", value: "local-remote" },
] as const;

describe("SelectField", () => {
  it("maps labelled options to the native select shape", async () => {
    const setup = await testRender(
      <ShellTestProviders>
        <box flexDirection="column" width={40} height={6}>
          <SelectField id="scope" options={OPTIONS} height={4} />
        </box>
      </ShellTestProviders>,
      { width: 40, height: 6 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    const select = setup.renderer.root.findDescendantById("scope") as SelectRenderable | undefined;
    const frame = setup.captureCharFrame();

    expect(select?.options[0]?.name).toBe("Delete locally");
    expect(select?.options[1]?.description).toBe("pushes a delete");
    expect(frame).toContain("Delete locally");

    await act(async () => {
      await setup.dispose();
    });
  });

  it("reports the option value on navigation and confirmation", async () => {
    const changes: string[] = [];
    const selections: string[] = [];
    const setup = await testRender(
      <ShellTestProviders>
        <box flexDirection="column" width={40} height={6}>
          <SelectField
            id="scope"
            options={OPTIONS}
            height={4}
            onChange={(value) => changes.push(value)}
            onSelect={(value) => selections.push(value)}
          />
        </box>
      </ShellTestProviders>,
      { width: 40, height: 6 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    const select = setup.renderer.root.findDescendantById("scope") as SelectRenderable | undefined;

    await act(async () => {
      select?.moveDown();
    });
    await act(async () => {
      select?.selectCurrent();
    });

    expect(changes).toEqual(["local-remote"]);
    expect(selections).toEqual(["local-remote"]);

    await act(async () => {
      await setup.dispose();
    });
  });

  it("marks a list that outgrows its viewport with the scroll indicator", async () => {
    const options = Array.from({ length: 6 }, (_, index) => ({
      label: `Option ${index}`,
      value: `option-${index}`,
    }));
    const setup = await testRender(
      <ShellTestProviders>
        <box flexDirection="column" width={40} height={4}>
          <SelectField id="scope" options={options} height={4} />
        </box>
      </ShellTestProviders>,
      { width: 40, height: 4 },
    );

    await act(async () => {
      await setup.renderOnce();
    });

    const select = setup.renderer.root.findDescendantById("scope") as SelectRenderable | undefined;

    expect(select?.showScrollIndicator).toBe(true);
    expect(select?.options.length).toBeGreaterThan(2);

    await act(async () => {
      await setup.dispose();
    });
  });
});
