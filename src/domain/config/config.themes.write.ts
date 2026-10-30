import { stat } from "node:fs/promises";
import { join } from "node:path";
import { getThemeDefinition } from "@/domain/theme/theme.registry";
import { isReservedThemeName } from "@/domain/theme/theme.terminal";
import { isValidThemeName } from "@/domain/theme/theme.user";
import { writeConfigAtomically } from "./config.atomic";
import { isMissingFileError, readErrorMessage } from "./config.errors";
import { resolveConfigPaths } from "./config.paths";
import type { ThemeFileDefinition, ThemeWriteResult, WriteUserThemeOptions } from "./config.types";

/** Schema version written into every user theme file; the same version `theme.json` accepts. */
const THEME_FILE_VERSION = 1;

/** Suffix of one user theme file. */
const THEME_FILE_SUFFIX = ".json";

/**
 * Writes one user theme file.
 *
 * The file is the complete standalone theme schema: `version`, `name`, `label`, `variant`, and a
 * `colors` object holding every token plus the graph lane list. It therefore needs no `extends` and
 * reads back as a complete theme, which is what makes an export a shareable file instead of a patch.
 *
 * The identity is validated with the same rule the theme reader applies, the reserved Native
 * Terminal name is refused, and a built-in name is refused too because a theme file may not shadow
 * one. A written file is therefore always a file the reader accepts and never a name that shadows an
 * existing theme; the picker derives a free identity before it calls this function. The write itself
 * goes through `config.atomic.ts`, so the target is replaced through a sibling temp file and rename,
 * the directory is created recursively when it does not exist, and a failed write leaves any
 * previous file untouched.
 *
 * An existing file is never replaced unless the caller passes `overwrite`, because a re-export would
 * otherwise discard the user's edits. The refusal happens before any temp file is created.
 *
 * @param name - Theme identity to write.
 * @param definition - Complete standalone theme definition.
 * @param options - Directory, overwrite flag, and filesystem overrides used by tests.
 * @returns Whether the write succeeded, with a reason on failure.
 */
export async function writeUserTheme(
  name: string,
  definition: ThemeFileDefinition,
  options: WriteUserThemeOptions = {},
): Promise<ThemeWriteResult> {
  if (!isValidThemeName(name)) {
    return { ok: false, reason: `"${name}" is not a valid theme name` };
  }

  if (isReservedThemeName(name)) {
    return { ok: false, reason: `"${name}" is reserved for Native Terminal` };
  }

  if (getThemeDefinition(name) !== undefined) {
    return {
      ok: false,
      reason: `"${name}" is a built-in theme name; export it under another name`,
    };
  }

  const directory =
    options.themesDir ??
    resolveConfigPaths({
      env: options.env,
      homeDir: options.homeDir,
      platform: options.platform,
    }).themesDir;

  if (directory === null) {
    return { ok: false, reason: "No themes directory could be resolved" };
  }

  const fileName = `${name}${THEME_FILE_SUFFIX}`;
  const filePath = join(directory, fileName);
  const exists = await (options.fileExists ?? defaultFileExists)(filePath);

  if (exists && options.overwrite !== true) {
    return { ok: false, reason: `${fileName} already exists in ${directory}` };
  }

  const content = serializeThemeFile(name, definition);

  try {
    await writeConfigAtomically(filePath, content, { renameFile: options.renameFile });
  } catch (error) {
    return { ok: false, reason: `Could not write ${filePath}: ${readErrorMessage(error)}` };
  }

  return { ok: true };
}

/**
 * Serializes one theme definition as a theme file.
 *
 * The output is pretty-printed with a trailing newline, matching the configuration writer, so a
 * written theme diffs cleanly and survives a hand edit. `extends` is never written: an exported theme
 * is always standalone.
 *
 * @param name - Theme identity written into the file.
 * @param definition - Complete standalone theme definition.
 * @returns The file content.
 */
export function serializeThemeFile(name: string, definition: ThemeFileDefinition): string {
  const { graph, ...scalars } = definition.tokens;
  const file = {
    version: THEME_FILE_VERSION,
    name,
    label: definition.label,
    variant: definition.variant,
    colors: { ...scalars, graph: [...graph] },
  };

  return `${JSON.stringify(file, null, 2)}\n`;
}

/**
 * Reports whether a path already exists.
 *
 * A missing path is the normal case; any other failure is treated as "exists", so an unreadable
 * directory fails closed instead of overwriting a file the writer could not inspect.
 *
 * @param path - Absolute path to check.
 * @returns True when the target should not be written without an explicit overwrite.
 */
async function defaultFileExists(path: string): Promise<boolean> {
  try {
    await stat(path);

    return true;
  } catch (error) {
    return !isMissingFileError(error);
  }
}
