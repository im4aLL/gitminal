import { describe, expect, it } from "bun:test";
import { THEME_TOKEN_NAMES } from "../theme.tokens";
import type { HexColor } from "../theme.types";
import { CATPPUCCIN_DEFINITIONS, MOCHA_ROLES } from "./catppuccin";

/** Matches a validated `#RRGGBB` color. */
const HEX_PATTERN = /^#[0-9a-f]{6}$/;

/** Prefixes pinned palette suffixes; a bare `#` stays outside the hex-literal boundary check. */
const HEX_PREFIX = "#";

/**
 * Builds the expected color for a pinned palette value.
 *
 * @param suffix - Six hexadecimal digits without the leading `#`.
 * @returns The expected `#RRGGBB` color.
 */
function mochaColor(suffix: string): HexColor {
  return `${HEX_PREFIX}${suffix}` as HexColor;
}

/** Pinned official Catppuccin Mocha values for every role the token table uses. */
const EXPECTED_MOCHA_ROLES = {
  base: mochaColor("1e1e2e"),
  mantle: mochaColor("181825"),
  surface0: mochaColor("313244"),
  surface1: mochaColor("45475a"),
  surface2: mochaColor("585b70"),
  overlay1: mochaColor("7f849c"),
  subtext0: mochaColor("a6adc8"),
  text: mochaColor("cdd6f4"),
  mauve: mochaColor("cba6f7"),
  red: mochaColor("f38ba8"),
  peach: mochaColor("fab387"),
  yellow: mochaColor("f9e2af"),
  green: mochaColor("a6e3a1"),
  teal: mochaColor("94e2d5"),
  pink: mochaColor("f5c2e7"),
  sapphire: mochaColor("74c7ec"),
  blue: mochaColor("89b4fa"),
} as const;

/**
 * Reads one Catppuccin definition by name.
 *
 * @param name - Catppuccin theme name.
 * @returns The matching definition.
 */
function catppuccin(name: string): (typeof CATPPUCCIN_DEFINITIONS)[number] {
  const definition = CATPPUCCIN_DEFINITIONS.find((entry) => entry.name === name);

  if (!definition) {
    throw new Error(`Catppuccin definition "${name}" is missing.`);
  }

  return definition;
}

describe("Catppuccin palettes", () => {
  it("defines the four flavors in picker order", () => {
    expect(CATPPUCCIN_DEFINITIONS.map((definition) => definition.name)).toEqual([
      "catppuccin-mocha",
      "catppuccin-macchiato",
      "catppuccin-frappe",
      "catppuccin-latte",
    ]);
  });

  it("labels every flavor with its official name", () => {
    expect(CATPPUCCIN_DEFINITIONS.map((definition) => definition.label)).toEqual([
      "Catppuccin Mocha",
      "Catppuccin Macchiato",
      "Catppuccin Frappe",
      "Catppuccin Latte",
    ]);
  });

  it("classifies Latte as light and the other flavors as dark", () => {
    expect(
      CATPPUCCIN_DEFINITIONS.map((definition) => [definition.name, definition.variant]),
    ).toEqual([
      ["catppuccin-mocha", "dark"],
      ["catppuccin-macchiato", "dark"],
      ["catppuccin-frappe", "dark"],
      ["catppuccin-latte", "light"],
    ]);
  });

  it("defines every token with a valid color in every flavor", () => {
    for (const definition of CATPPUCCIN_DEFINITIONS) {
      const tokens = definition.tokens as unknown as Record<string, string | readonly string[]>;

      for (const token of THEME_TOKEN_NAMES) {
        const value = tokens[token];

        if (value === undefined) {
          throw new Error(`Missing token "${token}" in theme "${definition.name}".`);
        }

        if (typeof value === "string") {
          expect(value).toMatch(HEX_PATTERN);
        } else {
          expect(value.length).toBeGreaterThan(0);

          for (const color of value) {
            expect(color).toMatch(HEX_PATTERN);
          }
        }
      }
    }
  });
});

describe("Catppuccin Mocha token roles", () => {
  it("pins the official Mocha palette roles", () => {
    expect(MOCHA_ROLES).toEqual(EXPECTED_MOCHA_ROLES);
  });

  it("maps every token to its documented Catppuccin role", () => {
    const tokens = catppuccin("catppuccin-mocha").tokens;

    expect(tokens).toMatchObject({
      background: EXPECTED_MOCHA_ROLES.base,
      panel: EXPECTED_MOCHA_ROLES.mantle,
      surface: EXPECTED_MOCHA_ROLES.surface0,
      border: EXPECTED_MOCHA_ROLES.surface1,
      focus: EXPECTED_MOCHA_ROLES.mauve,
      text: EXPECTED_MOCHA_ROLES.text,
      muted: EXPECTED_MOCHA_ROLES.subtext0,
      dim: EXPECTED_MOCHA_ROLES.overlay1,
      selection: EXPECTED_MOCHA_ROLES.surface2,
      accent: EXPECTED_MOCHA_ROLES.mauve,
      success: EXPECTED_MOCHA_ROLES.green,
      warning: EXPECTED_MOCHA_ROLES.yellow,
      error: EXPECTED_MOCHA_ROLES.red,
      info: EXPECTED_MOCHA_ROLES.blue,
      scrollbar: EXPECTED_MOCHA_ROLES.surface2,
      tag: EXPECTED_MOCHA_ROLES.peach,
      branchLocal: EXPECTED_MOCHA_ROLES.mauve,
      branchRemote: EXPECTED_MOCHA_ROLES.sapphire,
      diffAdd: EXPECTED_MOCHA_ROLES.green,
      diffRemove: EXPECTED_MOCHA_ROLES.red,
      diffContext: EXPECTED_MOCHA_ROLES.overlay1,
      diffHunk: EXPECTED_MOCHA_ROLES.blue,
      graph: [
        EXPECTED_MOCHA_ROLES.mauve,
        EXPECTED_MOCHA_ROLES.blue,
        EXPECTED_MOCHA_ROLES.teal,
        EXPECTED_MOCHA_ROLES.peach,
        EXPECTED_MOCHA_ROLES.pink,
        EXPECTED_MOCHA_ROLES.green,
      ],
    });

    expect(tokens.diffAddBackground).toMatch(HEX_PATTERN);
    expect(tokens.diffRemoveBackground).toMatch(HEX_PATTERN);
    expect(tokens.diffAddBackground).not.toBe(tokens.diffAdd);
    expect(tokens.diffRemoveBackground).not.toBe(tokens.diffRemove);
  });

  it("pins the documented Mocha diff backgrounds", () => {
    const tokens = catppuccin("catppuccin-mocha").tokens;

    expect(tokens.diffAddBackground).toBe(mochaColor("1f3b2c"));
    expect(tokens.diffRemoveBackground).toBe(mochaColor("3b1f2a"));
  });

  it("freezes the palette roles and every definition", () => {
    expect(Object.isFrozen(MOCHA_ROLES)).toBe(true);
    expect(Object.isFrozen(CATPPUCCIN_DEFINITIONS)).toBe(true);

    for (const definition of CATPPUCCIN_DEFINITIONS) {
      expect(Object.isFrozen(definition), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens), definition.name).toBe(true);
      expect(Object.isFrozen(definition.tokens.graph), definition.name).toBe(true);
    }
  });
});
