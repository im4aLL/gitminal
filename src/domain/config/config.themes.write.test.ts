import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serializeThemeFile, writeUserTheme } from "@/domain/config/config.themes.write";
import type { ThemeFileDefinition } from "@/domain/config/config.types";
import { THEMES } from "@/domain/theme/theme.registry";
import { readUserTheme } from "@/domain/theme/theme.user";

/** Complete definition written by the cases. */
const DEFINITION: ThemeFileDefinition = Object.freeze({
  name: "hadi-ink",
  label: "Hadi Ink",
  variant: "dark",
  tokens: THEMES["flexoki-ink"].tokens,
});

/**
 * Runs a case against one temporary themes directory.
 *
 * @param run - Case body.
 */
async function withThemesDir(run: (directory: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "gitminal-theme-write-"));

  try {
    await run(join(root, "themes"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("serializeThemeFile", () => {
  it("writes a complete standalone file with the graph lanes", () => {
    const content = serializeThemeFile("hadi-ink", DEFINITION);
    const parsed = JSON.parse(content) as {
      version: number;
      name: string;
      label: string;
      variant: string;
      extends?: unknown;
      colors: Record<string, unknown>;
    };

    expect(parsed.version).toBe(1);
    expect(parsed.name).toBe("hadi-ink");
    expect(parsed.label).toBe("Hadi Ink");
    expect(parsed.variant).toBe("dark");
    expect(parsed.extends).toBeUndefined();
    expect(parsed.colors.graph).toEqual([...DEFINITION.tokens.graph]);
    expect(content.endsWith("\n")).toBe(true);
  });

  it("produces a file the theme reader accepts as a complete theme", () => {
    const content = serializeThemeFile("hadi-ink", DEFINITION);
    const { definition, warnings } = readUserTheme(JSON.parse(content));

    expect(warnings).toEqual([]);
    expect(definition?.name).toBe("hadi-ink");
    expect(definition?.extends).toBeNull();
    expect(definition?.tokens.background).toBe(DEFINITION.tokens.background);
  });
});

describe("writeUserTheme", () => {
  it("creates the directory and writes the theme file", async () => {
    await withThemesDir(async (directory) => {
      const result = await writeUserTheme("hadi-ink", DEFINITION, { themesDir: directory });

      expect(result.ok).toBe(true);

      const content = await readFile(join(directory, "hadi-ink.json"), "utf8");

      expect(content).toContain('"name": "hadi-ink"');
      expect(readUserTheme(JSON.parse(content)).definition).not.toBeNull();
    });
  });

  it("refuses to overwrite an existing file without the explicit flag", async () => {
    await withThemesDir(async (directory) => {
      const first = await writeUserTheme("hadi-ink", DEFINITION, { themesDir: directory });

      expect(first.ok).toBe(true);

      const second = await writeUserTheme("hadi-ink", DEFINITION, { themesDir: directory });

      expect(second.ok).toBe(false);
      expect(second.reason).toContain("already exists");
    });
  });

  it("replaces an existing file when overwrite is explicit", async () => {
    await withThemesDir(async (directory) => {
      const overwrite = { themesDir: directory, overwrite: true };
      const first = await writeUserTheme("hadi-ink", DEFINITION, overwrite);
      const second = await writeUserTheme("hadi-ink", DEFINITION, overwrite);

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
    });
  });

  it("rejects an invalid, reserved, or built-in identity", async () => {
    await withThemesDir(async (directory) => {
      const invalid = await writeUserTheme("Not Valid", DEFINITION, { themesDir: directory });
      const reserved = await writeUserTheme("terminal", DEFINITION, { themesDir: directory });
      const builtIn = await writeUserTheme("nord", DEFINITION, { themesDir: directory });

      expect(invalid.ok).toBe(false);
      expect(invalid.reason).toContain("not a valid theme name");
      expect(reserved.ok).toBe(false);
      expect(reserved.reason).toContain("reserved");
      expect(builtIn.ok).toBe(false);
      expect(builtIn.reason).toContain("built-in");
    });
  });

  it("reports a failure when no theme directory resolves", async () => {
    const result = await writeUserTheme("hadi-ink", DEFINITION, {
      themesDir: null,
      env: {},
      homeDir: "",
      platform: "linux",
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("No themes directory");
  });

  it("leaves the previous file untouched when the write fails", async () => {
    await withThemesDir(async (directory) => {
      const path = join(directory, "hadi-ink.json");

      const first = await writeUserTheme("hadi-ink", DEFINITION, { themesDir: directory });

      expect(first.ok).toBe(true);

      const before = await readFile(path, "utf8");
      const result = await writeUserTheme("hadi-ink", DEFINITION, {
        themesDir: directory,
        overwrite: true,
        renameFile: async (): Promise<void> => {
          throw new Error("disk full");
        },
      });

      expect(result.ok).toBe(false);
      expect(result.reason).toContain("disk full");
      expect(await readFile(path, "utf8")).toBe(before);
    });
  });

  it("creates the directory only when it is missing", async () => {
    await withThemesDir(async (directory) => {
      const nested = join(directory, "nested", "deeper");
      const result = await writeUserTheme("hadi-ink", DEFINITION, { themesDir: nested });

      expect(result.ok).toBe(true);
      expect(await readFile(join(nested, "hadi-ink.json"), "utf8")).toContain("hadi-ink");
    });
  });

  it("treats an unstattable path as existing and fails closed", async () => {
    await withThemesDir(async (directory) => {
      const result = await writeUserTheme("hadi-ink", DEFINITION, {
        themesDir: directory,
        fileExists: async (): Promise<boolean> => true,
      });

      expect(result.ok).toBe(false);
      expect(result.reason).toContain("already exists");
    });
  });

  it("writes a file that is not present yet", async () => {
    await withThemesDir(async (directory) => {
      const result = await writeUserTheme("hadi-ink", DEFINITION, {
        themesDir: directory,
        fileExists: async (): Promise<boolean> => false,
      });

      expect(result.ok).toBe(true);
    });
  });

  it("does not create a file when the target is refused", async () => {
    await withThemesDir(async (directory) => {
      await mkdir(directory, { recursive: true });
      await writeFile(join(directory, "existing.json"), "{}", "utf8");

      const result = await writeUserTheme("existing", DEFINITION, { themesDir: directory });

      expect(result.ok).toBe(false);
      expect(await readFile(join(directory, "existing.json"), "utf8")).toBe("{}");
    });
  });
});
