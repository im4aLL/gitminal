import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { isMissingFileError, readErrorMessage } from "./config.errors";
import { nodeFileReader } from "./config.loader";
import type { LoadedThemeFiles, LoadThemeFilesOptions, ThemeFileRead } from "./config.types";

/**
 * Largest number of theme files read from one directory.
 *
 * The cap keeps a hand-populated directory from turning launch into an unbounded scan. A directory
 * with more candidates reports one warning naming how many were ignored instead of reading them.
 */
export const MAX_THEME_FILES = 64;

/**
 * Number of theme files read at once.
 *
 * Files are read in bounded batches, so a directory at the cap never opens more than eight reads at
 * a time while still finishing in one pass instead of a sequential loop.
 */
export const THEME_FILE_CONCURRENCY = 8;

/** Suffix a theme file must have; every other entry is ignored silently. */
const THEME_FILE_SUFFIX = ".json";

/** Result shared by a scan that had nothing to do. */
const EMPTY_SCAN: LoadedThemeFiles = Object.freeze({
  files: Object.freeze([]),
  warnings: Object.freeze([]),
});

/**
 * Reads the user theme files from the themes directory.
 *
 * The scan is bounded and deterministic: only regular files whose name ends in `.json` are
 * considered, subdirectories are never entered, names are sorted before reading so a name collision
 * always resolves the same way, at most `MAX_THEME_FILES` files are read, and each read goes through
 * the shared stat-before-read reader that caps a file at the configuration byte limit. Files are
 * read `THEME_FILE_CONCURRENCY` at a time.
 *
 * A missing directory is the normal unconfigured case and produces no warning and no file. Any other
 * directory failure produces one single-line warning naming the directory, and the scan keeps going.
 * A file that cannot be read or parsed keeps its reason on that file's own outcome and adds no scan
 * warning, because `readUserThemeCatalogue` turns the same outcome into one bounded, named catalogue
 * warning; reporting it here as well would publish it twice and let the per-file reasons bypass the
 * catalogue's warning bound.
 *
 * @param directory - Resolved themes directory, or `null` when no location could be resolved.
 * @param options - Reader override used by tests.
 * @returns The parsed files in file-name order plus the directory-level scan warnings.
 */
export async function loadThemeFiles(
  directory: string | null,
  options: LoadThemeFilesOptions = {},
): Promise<LoadedThemeFiles> {
  if (directory === null) {
    return EMPTY_SCAN;
  }

  const listing = await listThemeFileNames(directory);

  if (listing.names.length === 0) {
    return listing.warnings.length === 0
      ? EMPTY_SCAN
      : Object.freeze({ files: Object.freeze([]), warnings: Object.freeze(listing.warnings) });
  }

  const reader = options.readFile ?? nodeFileReader;
  const selected = listing.names.slice(0, MAX_THEME_FILES);
  const omitted = listing.names.length - selected.length;
  const warnings = [...listing.warnings, ...readOmittedWarnings(omitted)];
  const files = await readThemeFileBatches(directory, selected, reader);

  return Object.freeze({
    files: Object.freeze(files),
    warnings: Object.freeze(warnings),
  });
}

/**
 * Lists the candidate theme file names in one directory.
 *
 * Only directory entries that are regular files and end in `.json` qualify, so a subdirectory, a
 * symlink, and the atomic writer's dot-prefixed temp files are all ignored. Names are sorted so the
 * caller reads them in a deterministic order.
 *
 * @param directory - Absolute themes directory.
 * @returns The sorted candidate names plus a warning when the directory could not be listed.
 */
async function listThemeFileNames(
  directory: string,
): Promise<{ readonly names: readonly string[]; readonly warnings: readonly string[] }> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const names = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(THEME_FILE_SUFFIX))
      .map((entry) => entry.name)
      .sort();

    return { names, warnings: [] };
  } catch (error) {
    if (isMissingFileError(error)) {
      return { names: [], warnings: [] };
    }

    const reason = readErrorMessage(error);

    return {
      names: [],
      warnings: [`Could not read the themes directory (${directory}): ${reason}`],
    };
  }
}

/**
 * Builds the warning for candidates beyond the scan cap.
 *
 * @param omitted - Number of theme files that were not read.
 * @returns The warning line, or an empty list when nothing was omitted.
 */
function readOmittedWarnings(omitted: number): readonly string[] {
  if (omitted <= 0) {
    return [];
  }

  return [`${omitted} more theme files were ignored; at most ${MAX_THEME_FILES} are read.`];
}

/**
 * Reads every selected theme file in bounded concurrent batches.
 *
 * Batching keeps the file-name order while reading several files at once, so the result never
 * depends on which read finished first.
 *
 * @param directory - Absolute themes directory.
 * @param names - Sorted file names to read.
 * @param reader - File reader to use.
 * @returns One read outcome per name, in the same order.
 */
async function readThemeFileBatches(
  directory: string,
  names: readonly string[],
  reader: (path: string) => Promise<string>,
): Promise<ThemeFileRead[]> {
  const files: ThemeFileRead[] = [];

  for (let start = 0; start < names.length; start += THEME_FILE_CONCURRENCY) {
    const batch = names.slice(start, start + THEME_FILE_CONCURRENCY);
    const outcomes = await Promise.all(
      batch.map(async (fileName) => await readThemeFile(directory, fileName, reader)),
    );

    files.push(...outcomes);
  }

  return files;
}

/**
 * Reads and parses one theme file.
 *
 * Both the read and the parse failure become one warning naming the file, so the caller can skip a
 * broken file without interrupting the scan.
 *
 * @param directory - Absolute themes directory.
 * @param fileName - File name inside that directory.
 * @param reader - File reader to use.
 * @returns The parsed value, or the one-line reason the file was skipped.
 */
async function readThemeFile(
  directory: string,
  fileName: string,
  reader: (path: string) => Promise<string>,
): Promise<ThemeFileRead> {
  const path = join(directory, fileName);

  let content: string;

  try {
    content = await reader(path);
  } catch (error) {
    return {
      fileName,
      path,
      value: null,
      reason: `Could not read theme file "${fileName}": ${readErrorMessage(error)}`,
    };
  }

  let value: unknown;

  try {
    value = JSON.parse(content);
  } catch (error) {
    return {
      fileName,
      path,
      value: null,
      reason: `Could not parse theme file "${fileName}": ${readErrorMessage(error)}`,
    };
  }

  return { fileName, path, value, reason: null };
}
