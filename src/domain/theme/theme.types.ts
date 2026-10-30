import type { ThemeToken } from "./theme.tokens";

/** Color support level of the current terminal. */
export type ThemeColorCapability = "truecolor" | "color-256" | "monochrome";

/**
 * Built-in theme names accepted in `config.json`.
 *
 * This union is the compile-time contract for the catalogue. Every name needs a definition in exactly
 * one module under `src/domain/theme/themes/`, and `theme.registry.test.ts` holds the matching
 * runtime list so the two cannot drift apart.
 */
export type ThemeName =
  | "catppuccin-mocha"
  | "catppuccin-macchiato"
  | "catppuccin-frappe"
  | "catppuccin-latte"
  | "tokyo-night-night"
  | "tokyo-night-storm"
  | "tokyo-night-moon"
  | "tokyo-night-day"
  | "gruvbox-dark"
  | "gruvbox-light"
  | "nord"
  | "rose-pine-main"
  | "rose-pine-moon"
  | "rose-pine-dawn"
  | "flexoki-ink"
  | "flexoki-paper"
  | "dracula"
  | "dracula-alucard"
  | "one-dark"
  | "one-light"
  | "solarized-dark"
  | "solarized-light"
  | "zenburn"
  | "high-contrast-dark"
  | "high-contrast-light"
  | "kanagawa"
  | "everforest"
  | "ayu"
  | "nightfox"
  | "github-light"
  | "noctis"
  | "sonokai"
  | "zenbones"
  | "tomorrow"
  | "seoul256"
  | "srcery"
  | "iceberg"
  | "night-owl"
  | "jellybeans"
  | "tender";

/** Light or dark classification shown in the theme picker. */
export type ThemeVariant = "dark" | "light";

/** A validated `#RRGGBB` color from the built-in palette or a theme override. */
export type HexColor = `#${string}`;

/** The final color assigned to every visual token. */
export type ThemeTokens = {
  readonly [Token in Exclude<ThemeToken, "graph">]: HexColor;
} & {
  readonly graph: readonly HexColor[];
};

/**
 * One fully specified built-in theme.
 *
 * A theme module under `src/domain/theme/themes/` owns its palette vocabulary and exports final
 * tokens, so no shared role vocabulary or cross-family derivation step exists.
 */
export interface ThemeDefinition {
  /** Stable built-in name. */
  readonly name: ThemeName;
  /** Display name used by the picker and help. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Final token colors. */
  readonly tokens: ThemeTokens;
}

/** A theme resolved for the current session, including non-blocking warnings. */
export interface ResolvedTheme {
  /** Theme identity: a built-in `ThemeName` or a user theme name. */
  readonly name: string;
  /** Display name used by the picker, help, and status messages. */
  readonly label: string;
  /** Light or dark classification. */
  readonly variant: ThemeVariant;
  /** Capability that produced the final token colors; the base resolution is truecolor. */
  readonly capability: ThemeColorCapability;
  /** Final token colors after override layering and capability mapping. */
  readonly tokens: ThemeTokens;
  /** Warnings produced while resolving the requested theme. */
  readonly warnings: readonly string[];
}

/** Environment input for color capability detection. */
export interface DetectColorCapabilityOptions {
  /** Environment variables read for `COLORTERM`, `TERM`, and `NO_COLOR`. */
  readonly env?: Readonly<Record<string, string | undefined>>;
}

/** Readable two-tone palette used when the terminal reports no color support. */
export interface MonochromePalette {
  /** Base background. */
  readonly background: HexColor;
  /** Raised surface. */
  readonly surface: HexColor;
  /** Inactive border. */
  readonly border: HexColor;
  /** Focused border. */
  readonly focus: HexColor;
  /** Primary text. */
  readonly text: HexColor;
  /** Secondary text. */
  readonly muted: HexColor;
  /** Dimmed text. */
  readonly dim: HexColor;
  /** Selected background. */
  readonly selection: HexColor;
}
