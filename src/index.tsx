import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "@/app/App";
import { createConfigSource } from "@/app/providers/config.source";
import { queryTerminalTheme } from "@/app/providers/terminal.palette";
import { registerSyntaxParsers } from "@/app/syntax.parsers";

// The vendored grammars register before the first render because OpenTUI's tree-sitter client reads
// the registered parser set once, when the first highlighted block initializes it. The relative URL
// resolves to `assets/parsers` from `src/` in development and from `dist/` in the published package.
registerSyntaxParsers(new URL("../assets/parsers/", import.meta.url));

// Configuration loads once, before the first render, so the shell never shows a loading state. The
// same source is handed to `ConfigProvider`, which uses it when `app.reloadConfig` runs.
const configSource = createConfigSource();
const configSnapshotPromise = configSource.load();

// The renderer is created concurrently with the configuration read, because the terminal palette
// query needs a renderer and must start as early as possible. Mouse reporting starts enabled and the
// configured value is applied as soon as the configuration resolves, before the first render, so the
// first painted frame already honors `ui.mouse`.
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: true });

// The palette query runs alongside the configuration read instead of after it, so startup costs the
// longer of the two instead of their sum. Awaiting both before the first render is what keeps the app
// from painting the default theme and then switching to the detected one.
const terminalPalettePromise = queryTerminalTheme(renderer);
const configSnapshot = await configSnapshotPromise;

renderer.useMouse = configSnapshot.config.ui.mouse;

const terminalPalette = await terminalPalettePromise;

createRoot(renderer).render(
  <App
    configSource={configSource}
    configSnapshot={configSnapshot}
    terminalPalette={terminalPalette}
  />,
);
