import { type ReactNode, useMemo } from "react";
import { useConfig } from "@/app/hooks/useConfig";
import type { ThemeProviderProps } from "@/app/providers/ThemeProvider.types";
import { useResolvedTheme } from "@/app/providers/useResolvedTheme";
import { useTerminalPalette } from "@/app/providers/useTerminalPalette";
import { useThemeSession } from "@/app/providers/useThemeSession";
import { ThemeContext } from "@/theme/ThemeContext";
import type { ThemeContextValue } from "@/theme/ThemeContext.types";
import { useThemeSyntaxStyle } from "@/theme/useThemeSyntaxStyle";

/**
 * Resolves the active theme and provides its tokens and controls to the app.
 *
 * The provider is a composition root, not a state owner: the session name and its preview controls
 * come from `useThemeSession`, the resolved tokens and catalogue from `useResolvedTheme`, and the
 * renderer-bound `SyntaxStyle` from `useThemeSyntaxStyle`. It only reads the configuration and the
 * detected terminal palette, wires those three together, and publishes one context value.
 *
 * The syntax style is rebuilt from the final tokens whenever the theme or capability changes and is
 * the only syntax style the app creates, so every code and diff surface repaints together without
 * holding a second color source.
 *
 * @param props - Optional static theme and capability overrides plus provider content.
 * @returns The theme context provider.
 */
export function ThemeProvider(props: ThemeProviderProps): ReactNode {
  const { catalogue: configCatalogue, config, themeOverrides } = useConfig();
  const terminal = useTerminalPalette();
  const configuredName = props.themeName ?? config.theme;
  const session = useThemeSession(configuredName);
  const resolved = useResolvedTheme({
    activeName: session.activeName,
    catalogue: configCatalogue,
    overrides: themeOverrides,
    terminal: terminal.snapshot,
    capability: props.capability,
  });
  const syntaxStyle = useThemeSyntaxStyle(resolved.theme.tokens);
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolved.theme,
      controls: session.controls,
      syntaxStyle,
      catalogue: resolved.catalogue,
    }),
    [resolved.catalogue, resolved.theme, session.controls, syntaxStyle],
  );

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}
