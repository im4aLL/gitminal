import { createBuiltInCatalogue, getCatalogueEntry } from "./theme.catalogue";
import type { ThemeCatalogue, ThemeCatalogueEntry } from "./theme.catalogue.types";
import { mergeOverrideLayer, readOverrideLayer } from "./theme.override";
import { DEFAULT_THEME_NAME } from "./theme.registry";
import type { ResolveThemeOptions } from "./theme.resolve.types";
import type { ResolvedTheme, ThemeTokens } from "./theme.types";

/**
 * Resolves the active theme and layers the optional `theme.json` overrides.
 *
 * The layer order is the selected catalogue entry, then the per-token overrides and the graph lane
 * array from `theme.json`. An unknown or empty theme name falls back to Catppuccin Mocha with a
 * warning. The override file is validated entry by entry through the shared color-map reader in
 * `theme.override.ts`: an unknown token name, an invalid color value, or an unsupported schema
 * version is ignored with a warning while the base token is kept, so a bad override can never
 * prevent launch. Capability mapping stays in `theme.capability.ts`.
 *
 * The catalogue defaults to the built-in one, so a one-argument call keeps resolving a built-in
 * theme. A caller that loaded user theme files passes its widened catalogue, which is also where the
 * load warnings enter resolution. Catalogue warnings come first because a rejected theme file
 * explains why a configured name may be unknown.
 *
 * @param name - The requested theme name from configuration.
 * @param options - Raw `theme.json` value to layer and the catalogue to resolve against.
 * @returns The resolved theme tokens with resolution warnings and the truecolor capability.
 */
export function resolveTheme(
  name: string | null | undefined,
  options: ResolveThemeOptions = {},
): ResolvedTheme {
  const catalogue = options.catalogue ?? createBuiltInCatalogue();
  const warnings: string[] = [...catalogue.warnings];
  const definition = readDefinition(name?.trim() ?? "", catalogue, warnings);
  const layer = readOverrideLayer(options.overrides, warnings);

  return toResolvedTheme(definition, mergeOverrideLayer(definition, layer), warnings);
}

/**
 * Reads one catalogue entry by name.
 *
 * @param requested - The requested theme name, already trimmed.
 * @param catalogue - Catalogue to resolve against.
 * @param warnings - Warning accumulator.
 * @returns The matched entry, or the default entry with an unknown-name warning.
 */
function readDefinition(
  requested: string,
  catalogue: ThemeCatalogue,
  warnings: string[],
): ThemeCatalogueEntry {
  if (requested.length === 0) {
    return readDefaultDefinition(catalogue);
  }

  const definition = getCatalogueEntry(catalogue, requested);

  if (definition) {
    return definition;
  }

  warnings.push(`Unknown theme "${requested}"; using "${DEFAULT_THEME_NAME}".`);

  return readDefaultDefinition(catalogue);
}

/**
 * Reads the default entry, which every built-in catalogue defines.
 *
 * @param catalogue - Catalogue to resolve against.
 * @returns The default Catppuccin Mocha entry.
 * @throws When the catalogue does not define the documented default theme.
 */
function readDefaultDefinition(catalogue: ThemeCatalogue): ThemeCatalogueEntry {
  const definition = getCatalogueEntry(catalogue, DEFAULT_THEME_NAME);

  if (!definition) {
    throw new Error(`Default theme "${DEFAULT_THEME_NAME}" is not defined.`);
  }

  return definition;
}

/**
 * Builds the resolved theme from a definition and its final tokens.
 *
 * The name is a plain string rather than the built-in `ThemeName` union, because a resolved theme
 * may come from a user catalogue entry.
 *
 * @param definition - The selected catalogue entry.
 * @param tokens - Final tokens after any override layer.
 * @param warnings - Warnings produced while resolving.
 * @returns The resolved theme with the truecolor base capability.
 */
function toResolvedTheme(
  definition: ThemeCatalogueEntry,
  tokens: ThemeTokens,
  warnings: readonly string[],
): ResolvedTheme {
  return {
    name: definition.name,
    label: definition.label,
    variant: definition.variant,
    capability: "truecolor",
    tokens,
    warnings,
  };
}
