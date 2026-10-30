import { useCallback, useEffect, useMemo, useState } from "react";
import type { ThemeSession } from "@/app/providers/useThemeSession.types";
import type { ThemeControls } from "@/theme/ThemeContext.types";

/**
 * Owns the session theme name and the controls every consumer previews through.
 *
 * The configured name is the source of truth: an effect resets the session name whenever it changes,
 * so a configuration reload wins over a preview. Until then a preview keeps rendering, because the
 * picker commits or restores it explicitly. `preview`, `commit`, and `restore` are session-only and
 * never write a file; the picker owns persistence.
 *
 * @param configuredName - Theme name the configuration resolves, or the provider override.
 * @returns The active name and the stable preview, commit, and restore controls.
 */
export function useThemeSession(configuredName: string): ThemeSession {
  const [activeName, setActiveName] = useState(configuredName);

  useEffect(() => {
    setActiveName(configuredName);
  }, [configuredName]);

  /** Previews one theme for the session without persisting it. */
  const preview = useCallback((name: string): void => {
    setActiveName(name);
  }, []);

  /** Makes one theme the active name after it was persisted. */
  const commit = useCallback((name: string): void => {
    setActiveName(name);
  }, []);

  /** Restores the theme that was active before a preview started. */
  const restore = useCallback((previous: string): void => {
    setActiveName(previous);
  }, []);

  const controls = useMemo<ThemeControls>(
    () => ({ preview, commit, restore }),
    [preview, commit, restore],
  );

  return { activeName, controls };
}
