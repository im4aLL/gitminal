import type {
  ConfigSnapshot,
  ConfigSource,
  ConfigSourceOptions,
} from "@/app/providers/ConfigProvider.types";
import { DEFAULT_CONFIG, UNRESOLVED_CONFIG_PATHS } from "@/domain/config/config.defaults";
import { loadConfigFiles } from "@/domain/config/config.loader";
import { resolveConfigPaths } from "@/domain/config/config.paths";
import { loadThemeFiles } from "@/domain/config/config.themes";
import type {
  ConfigFileKey,
  ConfigFileLoad,
  ConfigFileLoadStatus,
  ConfigFilePaths,
  GitminalConfig,
  LoadedConfigFiles,
  LoadedThemeFiles,
} from "@/domain/config/config.types";
import { buildEffectiveConfig } from "@/domain/config/config.validate";
import { boundConfigWarnings } from "@/domain/config/config.warnings";
import { createBuiltInCatalogue } from "@/domain/theme/theme.catalogue";
import { readUserThemeCatalogue } from "@/domain/theme/theme.user.catalogue";

/** The configuration state used before any file is read. */
export const DEFAULT_CONFIG_SNAPSHOT: ConfigSnapshot = Object.freeze({
  status: "missing",
  config: DEFAULT_CONFIG,
  paths: UNRESOLVED_CONFIG_PATHS,
  files: Object.freeze([]),
  warnings: Object.freeze([]),
  keybindingsFile: Object.freeze({}),
  themeOverrides: null,
  catalogue: createBuiltInCatalogue(),
});

/**
 * Creates the filesystem-backed configuration source.
 *
 * Paths resolve once, at launch, because configuration files are read at startup and on explicit
 * reload only; they are never watched. The returned `load` never rejects, so a reload can always
 * report a result instead of breaking the shell.
 *
 * The three configuration files and the themes directory are read concurrently, because the theme
 * files are an independent source: a directory of user themes never delays or blocks the
 * configuration files, and one slow file does not serialize the other reads.
 *
 * @param options - Environment, platform, home directory, and loader overrides.
 * @returns The source the composition root passes to `ConfigProvider`.
 */
export function createConfigSource(options: ConfigSourceOptions = {}): ConfigSource {
  const paths = resolveConfigPaths(options);
  const loadFiles = options.loadFiles ?? loadConfigFiles;
  const loadThemes = options.loadThemeFiles ?? loadThemeFiles;

  return {
    paths,
    /**
     * Reads the configuration files and the themes directory, then merges them onto the previous
     * effective configuration.
     *
     * @param previous - Effective configuration from the previous snapshot.
     * @returns The resolved snapshot.
     */
    load: async (previous?: GitminalConfig): Promise<ConfigSnapshot> => {
      const [loaded, themes] = await Promise.all([loadFiles(paths), loadThemes(paths.themesDir)]);

      return buildConfigSnapshot(loaded, themes, paths, previous);
    },
  };
}

/**
 * Builds one snapshot from the loaded files.
 *
 * Loader warnings and validation warnings are collected in that order, bounded, and stored with the
 * validated configuration so the provider never recomputes them. The theme files are turned into the
 * catalogue instead of into configuration warnings, so their warnings travel the theme pipeline and
 * reach `combineConfigurationWarnings` under the `Theme:` prefix.
 *
 * @param loaded - Raw configuration file read outcomes.
 * @param themes - Result of the themes directory scan.
 * @param paths - Paths the reads used.
 * @param previous - Effective configuration from the previous snapshot, when reloading.
 * @returns The resolved snapshot.
 */
function buildConfigSnapshot(
  loaded: LoadedConfigFiles,
  themes: LoadedThemeFiles,
  paths: ConfigFilePaths,
  previous?: GitminalConfig,
): ConfigSnapshot {
  const validated = buildEffectiveConfig({
    rawConfig: readFileValue(loaded.files, "config"),
    rawKeybindings: readFileValue(loaded.files, "keybindings"),
    rawTheme: readFileValue(loaded.files, "theme"),
    configFileStatus: readFileStatus(loaded.files, "config"),
    previousConfig: previous,
  });

  return {
    status: validated.status,
    config: validated.config,
    paths,
    files: loaded.files,
    warnings: boundConfigWarnings([...loaded.warnings, ...validated.warnings]),
    keybindingsFile: validated.keybindingsFile,
    themeOverrides: validated.themeFile,
    catalogue: readUserThemeCatalogue(themes.files, themes.warnings),
  };
}

/**
 * Reads the raw value of one loaded file.
 *
 * @param files - Per-file load outcomes.
 * @param key - File key to read.
 * @returns The parsed value, or `null` when the file is missing or unusable.
 */
function readFileValue(files: readonly ConfigFileLoad[], key: ConfigFileKey): unknown {
  return files.find((file) => file.key === key)?.value ?? null;
}

/**
 * Reads the load status of one file.
 *
 * @param files - Per-file load outcomes.
 * @param key - File key to read.
 * @returns The status, or `undefined` when the loader did not report the file.
 */
function readFileStatus(
  files: readonly ConfigFileLoad[],
  key: ConfigFileKey,
): ConfigFileLoadStatus | undefined {
  return files.find((file) => file.key === key)?.status;
}
