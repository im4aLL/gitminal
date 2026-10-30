import { createBuiltInCatalogue } from "./theme.catalogue";
import type { ThemeCatalogue, ThemeCatalogueEntry, ThemeFileSource } from "./theme.catalogue.types";
import { readUserTheme } from "./theme.user";
import type { UserThemeDefinition } from "./theme.user.types";

/**
 * Largest number of theme file warnings a catalogue carries.
 *
 * A directory of broken files must not flood the top bar, Help, or the console, so the catalogue
 * keeps the first few and summarizes the rest in one counted line. The remaining budget in
 * `boundConfigWarnings` still belongs to configuration warnings, which are reported first.
 */
export const MAX_THEME_FILE_WARNINGS = 5;

/**
 * Builds the catalogue from the loaded theme files.
 *
 * Membership order is identity order: the built-ins in registry order, then the user themes in
 * file-name order, which the loader already sorted. Each file is validated by `readUserTheme` against
 * the catalogue built so far, so a name may not shadow a built-in or an earlier file and the first
 * registration wins deterministically. The result is a complete-token catalogue entry per accepted
 * file, which is what keeps optional fields out of `ThemeTokens`.
 *
 * Warnings stay bounded and attributable. Each file contributes at most one line: the loader's own
 * read or parse reason, or the first validation warning prefixed with the file name so the reader can
 * find the file. At most `MAX_THEME_FILE_WARNINGS` file warnings survive, followed by one counted
 * `+N more themes could not be loaded.` line for the rest. The scan warnings are directory-level only,
 * so no per-file reason is reported twice. A scan with no candidate files returns the shared
 * built-in catalogue itself, so an unconfigured install keeps the identity every memoized consumer
 * relies on.
 *
 * @param files - Parsed theme files in file-name order, as the loader reports them.
 * @param scanWarnings - Directory-level warnings from the scan, kept ahead of the file warnings.
 * @returns The catalogue the resolver and the picker read.
 */
export function readUserThemeCatalogue(
  files: readonly ThemeFileSource[],
  scanWarnings: readonly string[] = [],
): ThemeCatalogue {
  if (files.length === 0 && scanWarnings.length === 0) {
    return createBuiltInCatalogue();
  }

  const builtIn = createBuiltInCatalogue();
  const entries: ThemeCatalogueEntry[] = [];
  const fileWarnings: string[] = [];
  let catalogue = builtIn;

  for (const file of files) {
    const outcome = readUserTheme(file.value, { catalogue });
    const warning = readFileWarning(file, outcome.warnings);

    if (warning !== null) {
      fileWarnings.push(warning);
    }

    if (outcome.definition === null) {
      continue;
    }

    const entry = toCatalogueEntry(outcome.definition);
    entries.push(entry);
    catalogue = { entries: [...catalogue.entries, entry], warnings: [] };
  }

  return Object.freeze({
    entries: Object.freeze([...builtIn.entries, ...entries]),
    warnings: Object.freeze([...scanWarnings, ...boundFileWarnings(fileWarnings)]),
  });
}

/**
 * Maps one validated user definition onto a catalogue entry.
 *
 * @param definition - Validated user theme definition.
 * @returns The frozen catalogue entry carrying the user source.
 */
function toCatalogueEntry(definition: UserThemeDefinition): ThemeCatalogueEntry {
  return Object.freeze({
    name: definition.name,
    label: definition.label,
    variant: definition.variant,
    tokens: definition.tokens,
    source: "user" as const,
  });
}

/**
 * Reads the one warning a theme file contributes.
 *
 * The loader's reason already names the file, so it is used as written. A validation warning is
 * prefixed with the file name, because a file may not even have reached the point where its theme
 * name is known. Only the first validation warning is kept, which is the one that explains the
 * rejection or the most important adjustment.
 *
 * @param file - Theme file the warning belongs to.
 * @param warnings - Warnings produced while reading that file.
 * @returns The single warning line, or `null` when the file produced none.
 */
function readFileWarning(file: ThemeFileSource, warnings: readonly string[]): string | null {
  if (file.reason !== null) {
    return file.reason;
  }

  const warning = warnings[0];

  return warning === undefined ? null : `${file.fileName}: ${warning}`;
}

/**
 * Bounds the per-file warning list.
 *
 * @param warnings - One warning per theme file, in file-name order.
 * @returns The kept warnings plus one counted line for the omitted ones.
 */
function boundFileWarnings(warnings: readonly string[]): readonly string[] {
  if (warnings.length <= MAX_THEME_FILE_WARNINGS) {
    return warnings;
  }

  const kept = warnings.slice(0, MAX_THEME_FILE_WARNINGS);
  const omitted = warnings.length - kept.length;

  return [...kept, `+${omitted} more themes could not be loaded.`];
}
