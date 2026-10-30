import type { ThemeCatalogue } from "@/domain/theme/theme.catalogue.types";
import type { TerminalThemeResult } from "@/domain/theme/theme.terminal.types";
import type { ResolvedTheme, ThemeColorCapability } from "@/domain/theme/theme.types";

/** Inputs accepted by `useResolvedTheme`. */
export interface UseResolvedThemeOptions {
  /** Theme name to resolve, including a live preview. */
  readonly activeName: string;
  /** Catalogue the configuration loader built: built-ins plus every accepted user theme. */
  readonly catalogue: ThemeCatalogue;
  /** Raw parsed `theme.json` override layer, or `null` when absent. */
  readonly overrides: unknown;
  /** Detected terminal palette; its entry widens the catalogue when detection answered. */
  readonly terminal: TerminalThemeResult;
  /** Capability override for tests and embeddings; defaults to environment detection. */
  readonly capability?: ThemeColorCapability;
}

/** Active theme and the catalogue it resolved against. */
export interface ResolvedThemeState {
  /** Final resolved theme, including the capability-mapped tokens. */
  readonly theme: ResolvedTheme;
  /** Catalogue widened with the detected terminal entry. */
  readonly catalogue: ThemeCatalogue;
}
