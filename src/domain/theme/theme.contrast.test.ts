import { describe, expect, it } from "bun:test";
import { contrastRatio } from "@/domain/theme/theme.contrast";
import { THEME_NAMES, THEMES } from "@/domain/theme/theme.registry";
import type { HexColor, ThemeTokens } from "@/domain/theme/theme.types";

/** Prefix kept outside the string so colors are not written as hex literals. */
const HEX_PREFIX = "#";

/**
 * One enforced foreground-on-background requirement.
 *
 * The floors are calibrated against the official Catppuccin Latte palette, the lightest built-in
 * theme, so every requirement is met by the shipped upstream colors and a new palette cannot regress
 * legibility below the level the app already ships. `primary` is the WCAG AA body-text floor.
 */
interface ContrastRequirement {
  /** Token painted as the foreground. */
  readonly foreground: keyof ThemeTokens;
  /** Token painted as the background. */
  readonly background: keyof ThemeTokens;
  /** Minimum acceptable ratio. */
  readonly minimum: number;
  /** Human-readable purpose used in the failure message. */
  readonly purpose: string;
}

/** WCAG AA body-text contrast floor. */
const PRIMARY_FLOOR = 4.5;

/** Secondary-text and UI-component floor. */
const SECONDARY_FLOOR = 3;

/** Floor for status hues, which always pair with a text marker. */
const STATUS_FLOOR = 2;

/** Every enforced requirement, grouped by the surface it protects. */
const REQUIREMENTS: readonly ContrastRequirement[] = Object.freeze([
  {
    foreground: "text",
    background: "background",
    minimum: PRIMARY_FLOOR,
    purpose: "primary text on the app background",
  },
  {
    foreground: "text",
    background: "panel",
    minimum: PRIMARY_FLOOR,
    purpose: "primary text on panel surfaces",
  },
  {
    foreground: "text",
    background: "surface",
    minimum: PRIMARY_FLOOR,
    purpose: "primary text on raised rows and modals",
  },
  {
    foreground: "text",
    background: "selection",
    minimum: SECONDARY_FLOOR,
    purpose: "option and button text on the selected background",
  },
  {
    foreground: "muted",
    background: "background",
    minimum: SECONDARY_FLOOR,
    purpose: "secondary text on the app background",
  },
  {
    foreground: "muted",
    background: "surface",
    minimum: SECONDARY_FLOOR,
    purpose: "secondary text on raised rows and modals",
  },
  {
    foreground: "accent",
    background: "surface",
    minimum: SECONDARY_FLOOR,
    purpose: "key hints and active markers on raised rows",
  },
  {
    foreground: "diffAdd",
    background: "diffAddBackground",
    minimum: SECONDARY_FLOOR,
    purpose: "added-line signs and counts on the added background",
  },
  {
    foreground: "diffRemove",
    background: "diffRemoveBackground",
    minimum: SECONDARY_FLOOR,
    purpose: "removed-line signs and counts on the removed background",
  },
  {
    foreground: "success",
    background: "background",
    minimum: STATUS_FLOOR,
    purpose: "success status text on the app background",
  },
  {
    foreground: "warning",
    background: "background",
    minimum: STATUS_FLOOR,
    purpose: "warning status text on the app background",
  },
  {
    foreground: "error",
    background: "background",
    minimum: STATUS_FLOOR,
    purpose: "error status text on the app background",
  },
  {
    foreground: "info",
    background: "background",
    minimum: STATUS_FLOOR,
    purpose: "info status text on the app background",
  },
]);

/**
 * Reads one token as a color, failing the case for a non-color token.
 *
 * @param tokens - The theme tokens.
 * @param token - Token name under test.
 * @returns The token color.
 */
function colorOf(tokens: ThemeTokens, token: keyof ThemeTokens): HexColor {
  const value = tokens[token];

  if (typeof value !== "string") {
    throw new Error(`Token "${String(token)}" is not a single color.`);
  }

  return value;
}

describe("contrastRatio", () => {
  it("returns 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio(`${HEX_PREFIX}000000`, `${HEX_PREFIX}ffffff`)).toBeCloseTo(21, 5);
    expect(contrastRatio(`${HEX_PREFIX}ffffff`, `${HEX_PREFIX}000000`)).toBeCloseTo(21, 5);
    expect(contrastRatio(`${HEX_PREFIX}1e1e2e`, `${HEX_PREFIX}1e1e2e`)).toBeCloseTo(1, 5);
  });

  it("matches the documented WCAG reference value", () => {
    expect(contrastRatio(`${HEX_PREFIX}777777`, `${HEX_PREFIX}ffffff`)).toBeCloseTo(4.48, 2);
  });
});

describe("theme contrast", () => {
  it("meets every documented requirement in every theme", () => {
    const failures: string[] = [];

    for (const name of THEME_NAMES) {
      const tokens = THEMES[name].tokens;

      for (const requirement of REQUIREMENTS) {
        const ratio = contrastRatio(
          colorOf(tokens, requirement.foreground),
          colorOf(tokens, requirement.background),
        );

        if (ratio < requirement.minimum) {
          failures.push(
            `${name}: ${requirement.purpose} is ${ratio.toFixed(2)}, below ${requirement.minimum}`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
