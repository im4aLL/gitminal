import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAX_CONFIG_FILE_BYTES } from "@/domain/config/config.loader";
import {
  loadThemeFiles,
  MAX_THEME_FILES,
  THEME_FILE_CONCURRENCY,
} from "@/domain/config/config.themes";
import {
  MAX_THEME_FILE_WARNINGS,
  readUserThemeCatalogue,
} from "@/domain/theme/theme.user.catalogue";

/**
 * Runs a case against one temporary themes directory.
 *
 * @param run - Case body.
 */
async function withThemesDir(run: (directory: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "gitminal-themes-"));

  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

/**
 * Writes one file into the themes directory.
 *
 * @param directory - Themes directory.
 * @param name - File name.
 * @param content - File content.
 */
async function writeTheme(directory: string, name: string, content: string): Promise<void> {
  await writeFile(join(directory, name), content, "utf8");
}

describe("loadThemeFiles", () => {
  it("returns nothing for an unresolved or missing directory", async () => {
    const unresolved = await loadThemeFiles(null);

    expect(unresolved.files).toEqual([]);
    expect(unresolved.warnings).toEqual([]);

    const missing = await loadThemeFiles(join(tmpdir(), "gitminal-missing-themes-dir"));

    expect(missing.files).toEqual([]);
    expect(missing.warnings).toEqual([]);
  });

  it("reads only regular .json files in file-name order", async () => {
    await withThemesDir(async (directory) => {
      await writeTheme(directory, "b.json", '{"name":"b"}');
      await writeTheme(directory, "a.json", '{"name":"a"}');
      await writeTheme(directory, "notes.txt", "ignored");
      await mkdir(join(directory, "nested.json"));

      const loaded = await loadThemeFiles(directory);

      expect(loaded.files.map((file) => file.fileName)).toEqual(["a.json", "b.json"]);
      expect(loaded.files.map((file) => file.value)).toEqual([{ name: "a" }, { name: "b" }]);
      expect(loaded.warnings).toEqual([]);
    });
  });

  it("ignores a symlink to a theme file", async () => {
    await withThemesDir(async (directory) => {
      await writeTheme(directory, "target.json", '{"name":"target"}');
      await symlink(join(directory, "target.json"), join(directory, "link.json"));

      const loaded = await loadThemeFiles(directory);

      expect(loaded.files.map((file) => file.fileName)).toEqual(["target.json"]);
    });
  });

  it("keeps a parse failure on the file and out of the scan warnings", async () => {
    await withThemesDir(async (directory) => {
      await writeTheme(directory, "broken.json", "{ not json");
      await writeTheme(directory, "good.json", '{"name":"good"}');

      const loaded = await loadThemeFiles(directory);

      expect(loaded.files.map((file) => file.fileName)).toEqual(["broken.json", "good.json"]);
      expect(loaded.files[0]?.value).toBeNull();
      expect(loaded.files[0]?.reason).toContain('Could not parse theme file "broken.json"');
      expect(loaded.files[1]?.reason).toBeNull();
      expect(loaded.warnings).toEqual([]);
    });
  });

  it("keeps an oversized file reason on the file and out of the scan warnings", async () => {
    await withThemesDir(async (directory) => {
      await writeTheme(directory, "huge.json", "x".repeat(MAX_CONFIG_FILE_BYTES + 1));

      const loaded = await loadThemeFiles(directory);

      expect(loaded.files[0]?.value).toBeNull();
      expect(loaded.files[0]?.reason).toContain('Could not read theme file "huge.json"');
      expect(loaded.files[0]?.reason).toContain("larger than");
      expect(loaded.warnings).toEqual([]);
    });
  });

  it("keeps file-name order when reads settle out of order", async () => {
    await withThemesDir(async (directory) => {
      const names = Array.from({ length: 10 }, (_, index) => `theme-${index}.json`);

      for (const name of names) {
        await writeTheme(directory, name, '{"name":"x"}');
      }

      const loaded = await loadThemeFiles(directory, {
        readFile: async (path: string): Promise<string> => {
          const index = names.findIndex((name) => path.endsWith(name));

          await new Promise((resolve) => setTimeout(resolve, 10 - index));

          return '{"name":"x"}';
        },
      });

      expect(loaded.files.map((file) => file.fileName)).toEqual(names);
    });
  });

  it("reads at most THEME_FILE_CONCURRENCY files at a time", async () => {
    await withThemesDir(async (directory) => {
      const count = THEME_FILE_CONCURRENCY * 2 + 4;

      for (let index = 0; index < count; index += 1) {
        await writeTheme(directory, `theme-${String(index).padStart(3, "0")}.json`, "{}");
      }

      let inFlight = 0;
      let peak = 0;
      const loaded = await loadThemeFiles(directory, {
        readFile: async (): Promise<string> => {
          inFlight += 1;
          peak = Math.max(peak, inFlight);

          await new Promise((resolve) => setTimeout(resolve, 1));
          inFlight -= 1;

          return "{}";
        },
      });

      expect(loaded.files).toHaveLength(count);
      expect(peak).toBe(THEME_FILE_CONCURRENCY);
    });
  });

  it("caps the number of read files and warns once", async () => {
    await withThemesDir(async (directory) => {
      const count = MAX_THEME_FILES + 2;

      for (let index = 0; index < count; index += 1) {
        await writeTheme(directory, `theme-${String(index).padStart(3, "0")}.json`, "{}");
      }

      const loaded = await loadThemeFiles(directory);

      expect(loaded.files).toHaveLength(MAX_THEME_FILES);
      expect(loaded.warnings).toHaveLength(1);
      expect(loaded.warnings[0]).toContain("2 more theme files were ignored");
    });
  });

  it("bounds the catalogue warnings once from scan to catalogue", async () => {
    await withThemesDir(async (directory) => {
      for (let index = 0; index < MAX_THEME_FILE_WARNINGS + 3; index += 1) {
        await writeTheme(directory, `broken-${index}.json`, "{ not json");
      }

      const loaded = await loadThemeFiles(directory);
      const catalogue = readUserThemeCatalogue(loaded.files, loaded.warnings);
      let named = 0;

      for (const warning of catalogue.warnings) {
        if (warning.includes("Could not parse")) {
          named += 1;
        }
      }

      expect(loaded.warnings).toEqual([]);
      expect(catalogue.warnings).toHaveLength(MAX_THEME_FILE_WARNINGS + 1);
      expect(named).toBe(MAX_THEME_FILE_WARNINGS);
      expect(catalogue.warnings.at(-1)).toBe("+3 more themes could not be loaded.");
      expect(new Set(catalogue.warnings).size).toBe(catalogue.warnings.length);
    });
  });
});
