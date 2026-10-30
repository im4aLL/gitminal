import { describe, expect, it } from "bun:test";
import { DEFAULT_THEME_NAME, getThemeDefinition, THEME_NAMES, THEMES } from "./theme.registry";
import { THEME_TOKEN_NAMES } from "./theme.tokens";
import type { ThemeName } from "./theme.types";

/** Matches a validated `#RRGGBB` color. */
const HEX_PATTERN = /^#[0-9a-f]{6}$/;

/**
 * Every built-in theme name, spelled out so the union and the catalogue cannot drift apart.
 *
 * A new theme that is added to `ThemeName` but forgotten here fails the order test, and a theme added
 * to the catalogue without a union entry fails typecheck through the duplicate and order assertions.
 */
const EXPECTED_NAMES: readonly ThemeName[] = [
  "catppuccin-mocha",
  "catppuccin-macchiato",
  "catppuccin-frappe",
  "catppuccin-latte",
  "tokyo-night-night",
  "tokyo-night-storm",
  "tokyo-night-moon",
  "tokyo-night-day",
  "gruvbox-dark",
  "gruvbox-light",
  "nord",
  "rose-pine-main",
  "rose-pine-moon",
  "rose-pine-dawn",
  "flexoki-ink",
  "flexoki-paper",
  "dracula",
  "dracula-alucard",
  "one-dark",
  "one-light",
  "solarized-dark",
  "solarized-light",
  "zenburn",
  "high-contrast-dark",
  "high-contrast-light",
  "kanagawa",
  "everforest",
  "ayu",
  "nightfox",
  "github-light",
  "noctis",
  "sonokai",
  "zenbones",
  "tomorrow",
  "seoul256",
  "srcery",
  "iceberg",
  "night-owl",
  "jellybeans",
  "tender",
];

describe("theme registry", () => {
  it("lists every built-in theme in picker order", () => {
    expect([...THEME_NAMES]).toEqual([...EXPECTED_NAMES]);
    expect(Object.keys(THEMES)).toEqual([...THEME_NAMES]);
  });

  it("defines a palette for every name and no duplicates", () => {
    expect(new Set(THEME_NAMES).size).toBe(THEME_NAMES.length);

    for (const name of EXPECTED_NAMES) {
      expect(THEMES[name], name).toBeDefined();
      expect(THEMES[name].name).toBe(name);
    }
  });

  it("defaults to Catppuccin Mocha", () => {
    expect(DEFAULT_THEME_NAME).toBe("catppuccin-mocha");
    expect(getThemeDefinition(DEFAULT_THEME_NAME)?.label).toBe("Catppuccin Mocha");
  });

  it("labels every theme and classifies it as light or dark", () => {
    for (const name of THEME_NAMES) {
      const definition = THEMES[name];

      expect(definition.label.length).toBeGreaterThan(0);
      expect(["dark", "light"]).toContain(definition.variant);
    }
  });

  it("defines every token with a valid color in every theme", () => {
    for (const name of THEME_NAMES) {
      const tokens = getThemeDefinition(name)?.tokens as unknown as Record<
        string,
        string | readonly string[]
      >;

      for (const token of THEME_TOKEN_NAMES) {
        const value = tokens[token];

        if (value === undefined) {
          throw new Error(`Missing token "${token}" in theme "${name}".`);
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

  it("returns undefined for an unknown theme name", () => {
    expect(getThemeDefinition("not-a-theme")).toBeUndefined();
    expect(getThemeDefinition("Mocha")).toBeUndefined();
    expect(getThemeDefinition("")).toBeUndefined();
  });

  it("freezes the catalogue, the name list, and the nested token data", () => {
    expect(Object.isFrozen(THEME_NAMES)).toBe(true);
    expect(Object.isFrozen(THEMES)).toBe(true);
    expect(Object.isFrozen(THEME_TOKEN_NAMES)).toBe(true);

    for (const name of THEME_NAMES) {
      const definition = getThemeDefinition(name);

      expect(Object.isFrozen(definition), name).toBe(true);
      expect(Object.isFrozen(definition?.tokens), name).toBe(true);
      expect(Object.isFrozen(definition?.tokens.graph), name).toBe(true);
    }
  });

  it("does not allow mutating the frozen lookup or name list", () => {
    expect(Reflect.set(THEMES, "catppuccin-mocha", getThemeDefinition("catppuccin-latte"))).toBe(
      false,
    );
    expect(Reflect.set(THEME_NAMES, 0, "catppuccin-latte")).toBe(false);
    expect(THEMES["catppuccin-mocha"].name).toBe("catppuccin-mocha");
    expect(THEME_NAMES[0]).toBe("catppuccin-mocha");
  });
});
