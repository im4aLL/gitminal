import { useContext } from "react";
import type { ThemeCatalogue } from "@/domain/theme/theme.catalogue.types";
import { ThemeContext } from "@/theme/ThemeContext";

/**
 * Reads the catalogue the active theme resolves against.
 *
 * The provider owns the catalogue, including any loaded user themes, so a consumer such as the
 * theme picker lists exactly the themes resolution can select instead of rebuilding a parallel
 * catalogue.
 *
 * @returns The catalogue the provider resolves theme names against.
 * @throws When called outside a `ThemeProvider`.
 */
export function useThemeCatalogue(): ThemeCatalogue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeCatalogue must be used within a ThemeProvider.");
  }

  return context.catalogue;
}
