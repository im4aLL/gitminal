import { useMemo } from "react";
import type {
  ResolvedThemeState,
  UseResolvedThemeOptions,
} from "@/app/providers/useResolvedTheme.types";
import { applyThemeCapability, detectColorCapability } from "@/domain/theme/theme.capability";
import { withTerminalEntry } from "@/domain/theme/theme.catalogue";
import type { ThemeCatalogue } from "@/domain/theme/theme.catalogue.types";
import { resolveTheme } from "@/domain/theme/theme.resolve";
import { readTerminalResolution, TERMINAL_THEME_NAME } from "@/domain/theme/theme.terminal";
import type { TerminalResolution } from "@/domain/theme/theme.terminal.types";
import { mergeThemeWarnings } from "@/domain/theme/theme.warnings";

/**
 * Resolves the active theme name against the catalogue for the current capability.
 *
 * Resolution has two memoized stages: the requested name and override layer produce a truecolor
 * theme, and the capability maps that theme onto final colors, so a capability change never
 * re-resolves the override file. The catalogue is the one the configuration loader built, which
 * already contains the built-ins and every accepted user theme, plus the detected Native Terminal
 * entry when the terminal answered the palette query; a terminal that did not answer leaves the
 * catalogue by reference, so no memoized consumer re-resolves.
 *
 * Catalogue and terminal warnings are merged into the published warnings, which is what makes a
 * rejected theme file reach `combineConfigurationWarnings` under the `Theme:` prefix instead of
 * disappearing. The detection notes travel with the same merge, but only while Native Terminal is the
 * resolved theme, because a note about the terminal scheme has nothing to say about a built-in or
 * user theme. An unknown configured name falls back to the default theme with a warning, and a
 * configured `terminal` name that detection could not resolve falls back the same way with one
 * warning naming the detection reason.
 *
 * @param input - Requested name, catalogue, override layer, detected palette, and capability.
 * @returns The resolved theme and the widened catalogue it resolved against.
 */
export function useResolvedTheme(input: UseResolvedThemeOptions): ResolvedThemeState {
  const { activeName, catalogue: configCatalogue, overrides, terminal, capability } = input;
  const detectedCapability = useMemo(() => capability ?? detectColorCapability(), [capability]);
  const catalogue = useMemo<ThemeCatalogue>(
    () => withTerminalEntry(configCatalogue, terminal.entry),
    [configCatalogue, terminal.entry],
  );
  const resolution = useMemo<TerminalResolution>(
    () => readTerminalResolution(activeName, terminal),
    [activeName, terminal],
  );
  const baseTheme = useMemo(
    () => resolveTheme(resolution.name, { overrides, catalogue }),
    [catalogue, overrides, resolution.name],
  );
  const theme = useMemo(
    () =>
      applyThemeCapability(
        {
          ...baseTheme,
          warnings: mergeThemeWarnings(
            catalogue.warnings,
            baseTheme.warnings,
            resolution.warnings,
            resolution.name === TERMINAL_THEME_NAME ? terminal.warnings : [],
          ),
        },
        detectedCapability,
      ),
    [baseTheme, catalogue, detectedCapability, resolution, terminal],
  );

  return { theme, catalogue };
}
