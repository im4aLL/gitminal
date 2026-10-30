import type { ThemeDefinition, ThemeName } from "./theme.types";
import { AYU_DEFINITIONS } from "./themes/ayu";
import { CATPPUCCIN_DEFINITIONS } from "./themes/catppuccin";
import { DRACULA_DEFINITIONS } from "./themes/dracula";
import { EVERFOREST_DEFINITIONS } from "./themes/everforest";
import { FLEXOKI_DEFINITIONS } from "./themes/flexoki";
import { GITHUB_DEFINITIONS } from "./themes/github";
import { GRUVBOX_DEFINITIONS } from "./themes/gruvbox";
import { HIGH_CONTRAST_DEFINITIONS } from "./themes/high-contrast";
import { ICEBERG_DEFINITIONS } from "./themes/iceberg";
import { JELLYBEANS_DEFINITIONS } from "./themes/jellybeans";
import { KANAGAWA_DEFINITIONS } from "./themes/kanagawa";
import { NIGHT_OWL_DEFINITIONS } from "./themes/night-owl";
import { NIGHTFOX_DEFINITIONS } from "./themes/nightfox";
import { NOCTIS_DEFINITIONS } from "./themes/noctis";
import { NORD_DEFINITIONS } from "./themes/nord";
import { ONE_DEFINITIONS } from "./themes/one";
import { ROSE_PINE_DEFINITIONS } from "./themes/rose-pine";
import { SEOUL256_DEFINITIONS } from "./themes/seoul256";
import { SOLARIZED_DEFINITIONS } from "./themes/solarized";
import { SONOKAI_DEFINITIONS } from "./themes/sonokai";
import { SRCERY_DEFINITIONS } from "./themes/srcery";
import { TENDER_DEFINITIONS } from "./themes/tender";
import { TOKYO_NIGHT_DEFINITIONS } from "./themes/tokyo-night";
import { TOMORROW_DEFINITIONS } from "./themes/tomorrow";
import { ZENBONES_DEFINITIONS } from "./themes/zenbones";
import { ZENBURN_DEFINITIONS } from "./themes/zenburn";

/** The default built-in theme name. */
export const DEFAULT_THEME_NAME: ThemeName = "catppuccin-mocha";

/**
 * Every built-in definition, in picker order.
 *
 * Order is the picker's order: the default family first, then the remaining families in the order they
 * appear here, with each family's variants kept together and dark variants before light ones. Each
 * family module is one entry, so adding a palette family adds exactly one line.
 */
const DEFINITION_GROUPS: readonly (readonly ThemeDefinition[])[] = [
  CATPPUCCIN_DEFINITIONS,
  TOKYO_NIGHT_DEFINITIONS,
  GRUVBOX_DEFINITIONS,
  NORD_DEFINITIONS,
  ROSE_PINE_DEFINITIONS,
  FLEXOKI_DEFINITIONS,
  DRACULA_DEFINITIONS,
  ONE_DEFINITIONS,
  SOLARIZED_DEFINITIONS,
  ZENBURN_DEFINITIONS,
  HIGH_CONTRAST_DEFINITIONS,
  KANAGAWA_DEFINITIONS,
  EVERFOREST_DEFINITIONS,
  AYU_DEFINITIONS,
  NIGHTFOX_DEFINITIONS,
  GITHUB_DEFINITIONS,
  NOCTIS_DEFINITIONS,
  SONOKAI_DEFINITIONS,
  ZENBONES_DEFINITIONS,
  TOMORROW_DEFINITIONS,
  SEOUL256_DEFINITIONS,
  SRCERY_DEFINITIONS,
  ICEBERG_DEFINITIONS,
  NIGHT_OWL_DEFINITIONS,
  JELLYBEANS_DEFINITIONS,
  TENDER_DEFINITIONS,
];

/** Every built-in definition, flattened in picker order. */
const ALL_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  DEFINITION_GROUPS.flatMap((group) => [...group]),
);

/** Every built-in theme name in picker order. */
export const THEME_NAMES: readonly ThemeName[] = Object.freeze(
  ALL_DEFINITIONS.map((definition) => definition.name),
);

/** Every built-in definition keyed by name. */
export const THEMES: Readonly<Record<ThemeName, ThemeDefinition>> = Object.freeze(
  Object.fromEntries(
    ALL_DEFINITIONS.map((definition) => [definition.name, definition] as const),
  ) as Record<ThemeName, ThemeDefinition>,
);

/**
 * Looks up a built-in theme by name.
 *
 * @param name - The requested theme name.
 * @returns The matching definition, or `undefined` for an unknown name.
 */
export function getThemeDefinition(name: string): ThemeDefinition | undefined {
  if (!Object.hasOwn(THEMES, name)) {
    return undefined;
  }

  return THEMES[name as ThemeName];
}
