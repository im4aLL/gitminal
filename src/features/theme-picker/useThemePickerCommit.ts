import { useCallback } from "react";
import { useConfig } from "@/app/hooks/useConfig";
import { useStatus } from "@/app/hooks/useStatus";
import { writeUserTheme } from "@/domain/config/config.themes.write";
import type { ThemeFileDefinition, ThemeWriteResult } from "@/domain/config/config.types";
import { writeTheme } from "@/domain/config/config.writer";
import { readExportName } from "@/domain/theme/theme.user";
import {
  THEME_EXPORT_FAILED_MESSAGE,
  THEME_EXPORTED_MESSAGE_PREFIX,
  THEME_SAVE_FAILED_MESSAGE,
  THEME_SAVED_MESSAGE_PREFIX,
} from "@/features/theme-picker/ThemePicker.constants";
import type {
  ThemePickerCommit,
  ThemePickerRow,
  UseThemePickerCommitOptions,
} from "@/features/theme-picker/useThemePicker.types";

/**
 * Owns the picker's apply, cancel, and export paths.
 *
 * Apply commits the highlighted theme for the session, closes, and writes the `theme` field in the
 * background, so a slow or failing write never blocks the close. Cancel restores the theme that was
 * active when the picker opened. Both paths settle the picker first, so the unmount guard cannot
 * restore the previous theme after the user has already chosen one.
 *
 * Export is the footer control that turns a catalogue theme into a shareable file. It writes the
 * highlighted theme's truecolor tokens as one complete standalone theme file, so the resulting file
 * needs no base and no `extends`. It does not close the picker and it never overwrites an existing
 * file, so a second export of the same theme reports the refusal instead of replacing the user's
 * edits. Native Terminal is exported under its own non-reserved identity, because `terminal` belongs
 * to the detected entry.
 *
 * @param input - Overlay close callback, persistence and export overrides, and the picker view state.
 * @returns The apply, cancel, and export handlers.
 */
export function useThemePickerCommit(input: UseThemePickerCommitOptions): ThemePickerCommit {
  const config = useConfig();
  const { setStatus } = useStatus();
  const { options, state } = input;
  const { controls, highlightedIndex, previousName, rows, settle } = state;

  /** Persists one row and reports the outcome without blocking the close. */
  const persistRow = useCallback(
    (row: ThemePickerRow): void => {
      const persist = options.persist ?? writeConfiguredTheme;

      void persist(row.name, config.paths.config)
        .then((result) => {
          setStatus(
            result.ok
              ? { kind: "success", message: `${THEME_SAVED_MESSAGE_PREFIX} ${row.label}` }
              : { kind: "warning", message: readFailureMessage(THEME_SAVE_FAILED_MESSAGE, result) },
          );
        })
        .catch(() => {
          setStatus({ kind: "warning", message: THEME_SAVE_FAILED_MESSAGE });
        });
    },
    [config.paths.config, options.persist, setStatus],
  );

  /** Commits the highlighted theme, persists it, and closes the picker. */
  const apply = useCallback((): void => {
    const row = rows[highlightedIndex];

    if (row === undefined) {
      return;
    }

    settle();
    controls.commit(row.name);
    options.onClose();
    persistRow(row);
  }, [controls, highlightedIndex, options, persistRow, rows, settle]);

  /** Restores the theme that was active when the picker opened and closes it. */
  const cancel = useCallback((): void => {
    settle();
    controls.restore(previousName);
    options.onClose();
  }, [controls, options, previousName, settle]);

  /** Writes the highlighted theme to a user theme file and reports the outcome. */
  const exportTheme = useCallback((): void => {
    const row = rows[highlightedIndex];

    if (row === undefined) {
      return;
    }

    const definition: ThemeFileDefinition = {
      name: readExportName(row.name),
      label: row.label,
      variant: row.variant,
      tokens: row.tokens,
    };
    const write = options.exportTheme ?? writeConfiguredUserTheme;
    const savedMessage = `${THEME_EXPORTED_MESSAGE_PREFIX} ${definition.name}`;

    void write(definition, config.paths.themesDir)
      .then((result) => {
        setStatus(
          result.ok
            ? { kind: "success", message: savedMessage }
            : { kind: "warning", message: readFailureMessage(THEME_EXPORT_FAILED_MESSAGE, result) },
        );
      })
      .catch(() => {
        setStatus({ kind: "warning", message: THEME_EXPORT_FAILED_MESSAGE });
      });
  }, [config.paths.themesDir, highlightedIndex, options.exportTheme, rows, setStatus]);

  return { apply, cancel, exportTheme };
}

/**
 * Builds the status message of a failed write.
 *
 * A writer that reports a reason keeps it, because the reason is what tells the user which file
 * already exists or which directory could not be created. A failure without a reason keeps the
 * generic message, so the status strip is never empty.
 *
 * @param message - Generic failure message for the operation.
 * @param result - Failed write result.
 * @returns The message to show in the status strip.
 */
function readFailureMessage(message: string, result: ThemeWriteResult): string {
  const reason = result.reason;

  return reason === undefined || reason.length === 0 ? message : `${message}: ${reason}`;
}

/**
 * Writes the selected theme through the shared configuration writer.
 *
 * @param name - Theme name to persist.
 * @param configPath - Resolved `config.json` path, or `null` when none could be resolved.
 * @returns Whether the write succeeded, with a reason on failure.
 */
async function writeConfiguredTheme(
  name: string,
  configPath: string | null,
): Promise<ThemeWriteResult> {
  if (configPath === null) {
    return { ok: false, reason: "No config.json location could be resolved" };
  }

  return await writeTheme(name, { configPath });
}

/**
 * Writes the selected theme through the shared user theme file writer.
 *
 * @param definition - Complete standalone theme to write.
 * @param themesDir - Resolved themes directory, or `null` when none could be resolved.
 * @returns Whether the write succeeded, with a reason on failure.
 */
async function writeConfiguredUserTheme(
  definition: ThemeFileDefinition,
  themesDir: string | null,
): Promise<ThemeWriteResult> {
  if (themesDir === null) {
    return { ok: false, reason: "No themes directory could be resolved" };
  }

  return await writeUserTheme(definition.name, definition, { themesDir });
}
