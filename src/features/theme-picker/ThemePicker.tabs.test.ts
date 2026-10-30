import { describe, expect, it } from "bun:test";
import { THEME_PICKER_TAB_WIDTH } from "@/features/theme-picker/ThemePicker.constants";
import {
  readAdjacentVariant,
  readTabIndex,
  readTabOptions,
  readTabVariant,
  readTabVariantAtColumn,
} from "@/features/theme-picker/ThemePicker.tabs";
import { ICONS } from "@/theme/icons";

describe("readTabIndex", () => {
  it("maps dark to the first tab and light to the second", () => {
    expect(readTabIndex("dark")).toBe(0);
    expect(readTabIndex("light")).toBe(1);
  });
});

describe("readTabVariant", () => {
  it("maps a tab index back to its variant", () => {
    expect(readTabVariant(0)).toBe("dark");
    expect(readTabVariant(1)).toBe("light");
  });

  it("clamps an out-of-range index to the bar", () => {
    expect(readTabVariant(-4)).toBe("dark");
    expect(readTabVariant(9)).toBe("light");
  });
});

describe("readAdjacentVariant", () => {
  it("wraps in both directions", () => {
    expect(readAdjacentVariant("dark", "right")).toBe("light");
    expect(readAdjacentVariant("light", "right")).toBe("dark");
    expect(readAdjacentVariant("dark", "left")).toBe("light");
    expect(readAdjacentVariant("light", "left")).toBe("dark");
  });
});

describe("readTabVariantAtColumn", () => {
  it("resolves the tab under a column", () => {
    expect(readTabVariantAtColumn(0, THEME_PICKER_TAB_WIDTH)).toBe("dark");
    expect(readTabVariantAtColumn(THEME_PICKER_TAB_WIDTH - 1, THEME_PICKER_TAB_WIDTH)).toBe("dark");
    expect(readTabVariantAtColumn(THEME_PICKER_TAB_WIDTH, THEME_PICKER_TAB_WIDTH)).toBe("light");
  });

  it("clamps a negative column and a click past the last tab", () => {
    expect(readTabVariantAtColumn(-3, THEME_PICKER_TAB_WIDTH)).toBe("dark");
    expect(readTabVariantAtColumn(THEME_PICKER_TAB_WIDTH * 9, THEME_PICKER_TAB_WIDTH)).toBe(
      "light",
    );
  });

  it("treats a zero width as one cell", () => {
    expect(readTabVariantAtColumn(0, 0)).toBe("dark");
    expect(readTabVariantAtColumn(1, 0)).toBe("light");
  });
});

describe("readTabOptions", () => {
  it("marks only the selected tab while the tab zone owns the keyboard", () => {
    expect(readTabOptions(true, "dark").map((option) => option.name)).toEqual([
      `${ICONS.focus} Dark`,
      "Light",
    ]);
    expect(readTabOptions(true, "light").map((option) => option.name)).toEqual([
      "Dark",
      `${ICONS.focus} Light`,
    ]);
  });

  it("keeps the plain labels in the descriptions", () => {
    for (const option of readTabOptions(true, "light")) {
      expect(option.description).not.toContain(ICONS.focus);
    }

    expect(readTabOptions(true, "light").map((option) => option.description)).toEqual([
      "Dark",
      "Light",
    ]);
  });

  it("adds no marker while another zone owns the keyboard", () => {
    expect(readTabOptions(false, "dark").map((option) => option.name)).toEqual(["Dark", "Light"]);
    expect(readTabOptions(false, "light").map((option) => option.name)).toEqual(["Dark", "Light"]);
  });
});
