import type { HexColor, ThemeDefinition, ThemeTokens } from "../theme.types";

/**
 * The Catppuccin role vocabulary shared by the four official flavors.
 *
 * This vocabulary is local to Catppuccin on purpose: every other palette family names its colors in
 * its own terms, so there is no cross-family role type to map onto.
 */
export interface CatppuccinRoles {
  /** Base background. */
  readonly base: HexColor;
  /** Mantle background. */
  readonly mantle: HexColor;
  /** Lowest surface. */
  readonly surface0: HexColor;
  /** Middle surface. */
  readonly surface1: HexColor;
  /** Highest surface. */
  readonly surface2: HexColor;
  /** Overlay used for dim text. */
  readonly overlay1: HexColor;
  /** Secondary text. */
  readonly subtext0: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Mauve accent. */
  readonly mauve: HexColor;
  /** Red error. */
  readonly red: HexColor;
  /** Peach tag color. */
  readonly peach: HexColor;
  /** Yellow warning. */
  readonly yellow: HexColor;
  /** Green success. */
  readonly green: HexColor;
  /** Teal graph lane. */
  readonly teal: HexColor;
  /** Pink graph lane. */
  readonly pink: HexColor;
  /** Sapphire remote branch color. */
  readonly sapphire: HexColor;
  /** Blue info color. */
  readonly blue: HexColor;
}

/** One Catppuccin flavor before its tokens are derived. */
interface CatppuccinFlavor {
  /** Stable built-in name. */
  readonly name: ThemeDefinition["name"];
  /** Display name. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeDefinition["variant"];
  /** Official palette roles used by the token table. */
  readonly roles: CatppuccinRoles;
  /** Explicit added-line background. */
  readonly diffAddBackground: HexColor;
  /** Explicit removed-line background. */
  readonly diffRemoveBackground: HexColor;
}

/** Official Catppuccin Mocha roles. */
export const MOCHA_ROLES: CatppuccinRoles = Object.freeze({
  base: "#1e1e2e",
  mantle: "#181825",
  surface0: "#313244",
  surface1: "#45475a",
  surface2: "#585b70",
  overlay1: "#7f849c",
  subtext0: "#a6adc8",
  text: "#cdd6f4",
  mauve: "#cba6f7",
  red: "#f38ba8",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  pink: "#f5c2e7",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
});

/** Official Catppuccin Macchiato roles. */
const MACCHIATO_ROLES: CatppuccinRoles = Object.freeze({
  base: "#24273a",
  mantle: "#1e2030",
  surface0: "#363a4f",
  surface1: "#494d64",
  surface2: "#5b6078",
  overlay1: "#8087a2",
  subtext0: "#a5adcb",
  text: "#cad3f5",
  mauve: "#c6a0f6",
  red: "#ed8796",
  peach: "#f5a97f",
  yellow: "#eed49f",
  green: "#a6da95",
  teal: "#8bd5ca",
  pink: "#f5bde6",
  sapphire: "#7dc4e4",
  blue: "#8aadf4",
});

/** Official Catppuccin Frappe roles. */
const FRAPPE_ROLES: CatppuccinRoles = Object.freeze({
  base: "#303446",
  mantle: "#292c3c",
  surface0: "#414559",
  surface1: "#51576d",
  surface2: "#626880",
  overlay1: "#838ba7",
  subtext0: "#a5adce",
  text: "#c6d0f5",
  mauve: "#ca9ee6",
  red: "#e78284",
  peach: "#ef9f76",
  yellow: "#e5c890",
  green: "#a6d189",
  teal: "#81c8be",
  pink: "#f4b8e4",
  sapphire: "#85c1dc",
  blue: "#8caaee",
});

/** Official Catppuccin Latte roles. */
const LATTE_ROLES: CatppuccinRoles = Object.freeze({
  base: "#eff1f5",
  mantle: "#e6e9ef",
  surface0: "#ccd0da",
  surface1: "#bcc0cc",
  surface2: "#acb0be",
  overlay1: "#8c8fa1",
  subtext0: "#6c6f85",
  text: "#4c4f69",
  mauve: "#8839ef",
  red: "#d20f39",
  peach: "#fe640b",
  yellow: "#df8e1d",
  green: "#40a02b",
  teal: "#179299",
  pink: "#ea76cb",
  sapphire: "#209fb5",
  blue: "#1e66f5",
});

/**
 * The four built-in Catppuccin definitions before token derivation.
 *
 * Mocha's diff backgrounds are the documented example. The Macchiato and Frappe pairs are
 * provisional hand-picked values. The Latte add background is lighter than the upstream surface it
 * resembles so the official green reaches the enforced 3:1 floor; every pair is verified by
 * `theme.contrast.test.ts`, so a hand-picked value can no longer ship unreadable.
 */
const CATPPUCCIN_FLAVORS: readonly CatppuccinFlavor[] = [
  {
    name: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    variant: "dark",
    roles: MOCHA_ROLES,
    diffAddBackground: "#1f3b2c",
    diffRemoveBackground: "#3b1f2a",
  },
  {
    name: "catppuccin-macchiato",
    label: "Catppuccin Macchiato",
    variant: "dark",
    roles: MACCHIATO_ROLES,
    diffAddBackground: "#343c45",
    diffRemoveBackground: "#3c3245",
  },
  {
    name: "catppuccin-frappe",
    label: "Catppuccin Frappe",
    variant: "dark",
    roles: FRAPPE_ROLES,
    diffAddBackground: "#3e464e",
    diffRemoveBackground: "#463d4d",
  },
  {
    name: "catppuccin-latte",
    label: "Catppuccin Latte",
    variant: "light",
    roles: LATTE_ROLES,
    diffAddBackground: "#eef6f1",
    diffRemoveBackground: "#ecd6de",
  },
];

/** Every Catppuccin definition, in picker order. */
export const CATPPUCCIN_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  CATPPUCCIN_FLAVORS.map(createDefinition),
);

/**
 * Builds one Catppuccin definition from its palette roles.
 *
 * The result is frozen because the registry stores it once and every consumer receives it by
 * reference; an accidental mutation would change the theme process-wide.
 *
 * @param flavor - The Catppuccin flavor definition.
 * @returns The fully specified, frozen definition.
 */
function createDefinition(flavor: CatppuccinFlavor): ThemeDefinition {
  return Object.freeze({
    name: flavor.name,
    label: flavor.label,
    variant: flavor.variant,
    tokens: createTokens(flavor.roles, flavor.diffAddBackground, flavor.diffRemoveBackground),
  });
}

/**
 * Maps Catppuccin roles onto the Gitminal token table.
 *
 * The token object and its graph array are frozen because the same instance is handed to every
 * consumer by reference.
 *
 * @param roles - The flavor's palette roles.
 * @param diffAddBackground - Explicit added-line background.
 * @param diffRemoveBackground - Explicit removed-line background.
 * @returns The final, frozen token set.
 */
function createTokens(
  roles: CatppuccinRoles,
  diffAddBackground: HexColor,
  diffRemoveBackground: HexColor,
): ThemeTokens {
  return Object.freeze({
    background: roles.base,
    panel: roles.mantle,
    surface: roles.surface0,
    border: roles.surface1,
    focus: roles.mauve,
    text: roles.text,
    muted: roles.subtext0,
    dim: roles.overlay1,
    selection: roles.surface2,
    accent: roles.mauve,
    success: roles.green,
    warning: roles.yellow,
    error: roles.red,
    info: roles.blue,
    scrollbar: roles.surface2,
    tag: roles.peach,
    branchLocal: roles.mauve,
    branchRemote: roles.sapphire,
    diffAdd: roles.green,
    diffRemove: roles.red,
    diffAddBackground,
    diffRemoveBackground,
    diffContext: roles.overlay1,
    diffHunk: roles.blue,
    graph: Object.freeze([
      roles.mauve,
      roles.blue,
      roles.teal,
      roles.peach,
      roles.pink,
      roles.green,
    ]),
  });
}
