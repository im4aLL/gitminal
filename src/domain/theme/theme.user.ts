import { isPlainObject } from "@/lib/object";
import { getCatalogueEntry } from "./theme.catalogue";
import type { ThemeCatalogue } from "./theme.catalogue.types";
import { contrastRatio, deriveThemeVariant } from "./theme.contrast";
import { isSupportedThemeVersion, readThemeColorMap } from "./theme.override";
import { getThemeDefinition } from "./theme.registry";
import { isReservedThemeName, TERMINAL_EXPORT_NAME } from "./theme.terminal";
import type { ThemeDefinition, ThemeTokens, ThemeVariant } from "./theme.types";
import {
  mergeWithBase,
  readMissingTokens,
  readMissingWarning,
  readStandaloneTokens,
} from "./theme.user.tokens";
import type { ReadUserThemeOptions, UserThemeReadResult } from "./theme.user.types";

/** Theme identity accepted in a theme file and written to `config.json`. */
const THEME_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/** Longest accepted theme name. */
const MAX_THEME_NAME_LENGTH = 64;

/** Suffix appended to a built-in theme name when it is exported to a theme file. */
const EXPORTED_THEME_SUFFIX = "-custom";

/** WCAG AA body-text contrast floor used for the one reported contrast warning. */
const MIN_TEXT_CONTRAST = 4.5;

/**
 * Reads one theme file value into a validated theme definition.
 *
 * A theme file is the `theme.json` color schema plus identity fields. The single rule is that
 * missing tokens resolve against `extends`: with an `extends` target every missing token is
 * inherited silently, and without one nothing may be missing, so an incomplete standalone theme is
 * rejected rather than registered partially. Rejection is total, which is what keeps a registered
 * theme a complete token table and optional fields out of `ThemeTokens`.
 *
 * An unknown token name or an invalid color warns and is dropped. In an extending theme the base
 * color stays, and in a standalone theme the token counts as missing. `graph` replaces the base
 * lane list instead of merging, a name may not shadow a built-in or an already loaded user theme,
 * `extends` must name a built-in theme, and only schema version one is accepted. `variant` comes
 * from the file when it is `dark` or `light`, and is otherwise derived from the resolved
 * `background`. A label that is present but not a string warns before falling back to the theme
 * name. Contrast is reported, never enforced, through at most one warning per theme.
 *
 * @param raw - Parsed theme file value.
 * @param options - Catalogue of already registered themes, used to reject a shadowing identity.
 * @returns The validated definition, or `null` with the warnings that rejected it.
 */
export function readUserTheme(
  raw: unknown,
  options: ReadUserThemeOptions = {},
): UserThemeReadResult {
  const warnings: string[] = [];

  if (!isPlainObject(raw)) {
    warnings.push("A theme file is not a JSON object; the file was ignored.");

    return { definition: null, warnings };
  }

  const identity = readIdentity(raw, options, warnings);

  if (identity === null) {
    return { definition: null, warnings };
  }

  const { name, label } = identity;

  if (!isSupportedThemeVersion(raw.version)) {
    warnings.push(`Unsupported version in theme "${name}"; the file was ignored.`);

    return { definition: null, warnings };
  }

  const base = readBase(raw.extends, name, warnings);

  if (base === undefined) {
    return { definition: null, warnings };
  }

  const colors = raw.colors;

  if (!isPlainObject(colors)) {
    warnings.push(`Theme "${name}" has no colors object; the file was ignored.`);

    return { definition: null, warnings };
  }

  const map = readThemeColorMap(colors, {
    source: `theme "${name}"`,
    keepsBase: base !== null,
    warnings,
  });
  const tokens = base === null ? readStandaloneTokens(map) : mergeWithBase(base, map);

  if (tokens === null) {
    const missing = readMissingTokens(map, colors.graph !== undefined && map.graph === null);

    if (missing.length > 0) {
      warnings.push(readMissingWarning(name, missing));
    }

    return { definition: null, warnings };
  }

  const variant = readVariant(raw.variant, name, tokens, warnings);

  pushContrastWarning(name, tokens, warnings);

  return {
    definition: Object.freeze({
      name,
      label,
      variant,
      extends: base === null ? null : base.name,
      tokens,
    }),
    warnings,
  };
}

/**
 * Reads and validates the theme identity and display label.
 *
 * The name is the identity written to `config.json` and the key other themes may not shadow, so an
 * invalid name, a missing name, or a name already registered rejects the file. The label defaults to
 * the name, matching the documented optional field, and a label that is present but not a string
 * warns before falling back, because a hand-edited value would otherwise disappear silently.
 *
 * @param raw - Parsed theme file object.
 * @param options - Catalogue of already registered themes.
 * @param warnings - Warning accumulator.
 * @returns The identity and label, or `null` when the file is rejected.
 */
function readIdentity(
  raw: Record<string, unknown>,
  options: ReadUserThemeOptions,
  warnings: string[],
): { readonly name: string; readonly label: string } | null {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!isValidThemeName(name)) {
    warnings.push(
      name.length === 0
        ? "A theme file has no valid name; the file was ignored."
        : `Theme name "${name}" is invalid; the file was ignored.`,
    );

    return null;
  }

  if (isRegisteredThemeName(options.catalogue, name)) {
    warnings.push(`Theme "${name}" is already defined; the file was ignored.`);

    return null;
  }

  return { name, label: readLabel(raw.label, name, warnings) };
}

/**
 * Reads the identity a theme is exported under.
 *
 * A theme file may not shadow a built-in, and `terminal` is reserved for the detected entry, so an
 * export of either kind needs a free identity. Native Terminal becomes `native-terminal` and a
 * built-in gains the `-custom` suffix, which keeps an exported palette valid without changing the
 * identity the file describes.
 *
 * @param name - Theme name being exported.
 * @returns The identity to write into the user theme file.
 */
export function readExportName(name: string): string {
  if (isReservedThemeName(name)) {
    return TERMINAL_EXPORT_NAME;
  }

  return getThemeDefinition(name) === undefined ? name : `${name}${EXPORTED_THEME_SUFFIX}`;
}

/**
 * Reports whether a theme name is already registered.
 *
 * Built-in names are checked against the registry directly so a caller cannot bypass the collision
 * invariant with a catalogue that omits them. The detected Native Terminal identity is reserved the
 * same way, because the pseudo-theme occupies that name whenever the terminal answers. A supplied
 * catalogue adds the user entries loaded before this file.
 *
 * @param catalogue - Catalogue of already registered user themes, if any.
 * @param name - Candidate theme name.
 * @returns True when the name may not be reused.
 */
function isRegisteredThemeName(catalogue: ThemeCatalogue | undefined, name: string): boolean {
  if (getThemeDefinition(name) !== undefined || isReservedThemeName(name)) {
    return true;
  }

  return catalogue !== undefined && getCatalogueEntry(catalogue, name) !== undefined;
}

/**
 * Reports whether a theme name follows the documented identity rule.
 *
 * The same rule validates a theme file and the identity a user theme is exported under, so a name the
 * writer accepted is always a name the reader accepts.
 *
 * @param name - Trimmed theme name.
 * @returns True for one to 64 characters matching `/^[a-z0-9][a-z0-9-]*$/`.
 */
export function isValidThemeName(name: string): boolean {
  return name.length > 0 && name.length <= MAX_THEME_NAME_LENGTH && THEME_NAME_PATTERN.test(name);
}

/**
 * Reads the optional display label.
 *
 * An absent or `null` label takes the theme name without a warning, matching the documented optional
 * field, and a blank label does the same. A present value of any other type warns and falls back to
 * the theme name, the same hand-edited-file rule `variant` follows, so a typed number cannot vanish
 * from a theme the user thought they labelled.
 *
 * @param raw - Raw `label` value.
 * @param name - Validated theme name used as the default.
 * @param warnings - Warning accumulator.
 * @returns The trimmed label, or the theme name when the field is absent, blank, or invalid.
 */
function readLabel(raw: unknown, name: string, warnings: string[]): string {
  if (raw === undefined || raw === null) {
    return name;
  }

  if (typeof raw !== "string") {
    warnings.push(`Invalid "label" in theme "${name}"; the theme name was used instead.`);

    return name;
  }

  const label = raw.trim();

  return label.length === 0 ? name : label;
}

/**
 * Reads the optional `extends` target.
 *
 * Only a built-in theme name is accepted, so there is no cycle to detect and no ordering dependency
 * between theme files. An absent or `null` target means a standalone theme.
 *
 * @param raw - Raw `extends` value.
 * @param name - Theme identity used in warnings.
 * @param warnings - Warning accumulator.
 * @returns The built-in base definition, `null` for a standalone theme, or `undefined` on rejection.
 */
function readBase(
  raw: unknown,
  name: string,
  warnings: string[],
): ThemeDefinition | null | undefined {
  if (raw === undefined || raw === null) {
    return null;
  }

  const target = typeof raw === "string" ? raw.trim() : "";

  if (target.length === 0) {
    warnings.push(
      `Invalid "extends" in theme "${name}"; it must name a built-in theme. The file was ignored.`,
    );

    return undefined;
  }

  const definition = getThemeDefinition(target);

  if (definition === undefined) {
    warnings.push(`Unknown "extends" target "${target}" in theme "${name}"; the file was ignored.`);

    return undefined;
  }

  return definition;
}

/**
 * Resolves the theme variant.
 *
 * An explicit `dark` or `light` wins. Otherwise the background luminance decides, through the shared
 * variant rule in `theme.contrast.ts`. Any other non-null value warns and is derived the same way, so
 * a typo cannot register a variant the rest of the app would not render.
 *
 * @param raw - Raw `variant` value.
 * @param name - Theme identity used in warnings.
 * @param tokens - Resolved tokens.
 * @param warnings - Warning accumulator.
 * @returns The theme variant.
 */
function readVariant(
  raw: unknown,
  name: string,
  tokens: ThemeTokens,
  warnings: string[],
): ThemeVariant {
  if (raw === "dark" || raw === "light") {
    return raw;
  }

  if (raw !== undefined && raw !== null) {
    warnings.push(`Invalid "variant" in theme "${name}"; it was derived from the background.`);
  }

  return deriveThemeVariant(tokens.background);
}

/**
 * Appends the one reported contrast warning when text on the background is below the AA floor.
 *
 * Contrast is reported, not enforced: a user theme is their choice, but an unreadable combination
 * should still be visible in the warning pipeline. Built-in themes keep the hard floors in
 * `theme.contrast.test.ts`.
 *
 * @param name - Theme identity.
 * @param tokens - Resolved tokens.
 * @param warnings - Warning accumulator.
 */
function pushContrastWarning(name: string, tokens: ThemeTokens, warnings: string[]): void {
  const ratio = contrastRatio(tokens.text, tokens.background);

  if (ratio >= MIN_TEXT_CONTRAST) {
    return;
  }

  warnings.push(
    `Theme "${name}" text-on-background contrast is ${ratio.toFixed(2)}, below the ${MIN_TEXT_CONTRAST} AA floor.`,
  );
}
