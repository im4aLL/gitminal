# Changelog

All notable changes to Gitminal are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-10-30

### Added

- Theme picker keys. `[` and `]` switch the `Dark` and `Light` tabs from any focus zone and wrap, and `e` exports the highlighted theme to a user theme file without closing the picker. The three are overlay-scoped actions (`theme.tabLeft`, `theme.tabRight`, `theme.export`), so they are rebindable through `keybindings.json`; while the search field has focus those characters reach the field instead. Up and Down (or `j` and `k`) now always move the highlight and hand the keyboard to the list from any zone, Left and Right (or `h` and `l`) always move the keyboard to the footer buttons and wrap through them, and the selected tab no longer paints the native underline border. The footer advertises the theme picker keys and both bindings of each movement action while the modal is open.
- User theme files. Every `*.json` file in the themes directory (`<config dir>/themes`, or `$GITMINAL_THEMES_DIR`) is a theme you can select by name. A file is the `theme.json` color schema plus `version`, `name`, `label`, `variant`, and `extends`, and missing tokens resolve against a built-in base; a standalone theme must define all 24 tokens plus its graph lanes. Broken, shadowing, oversized, and non-JSON files degrade to one bounded warning and never prevent launch.
- Theme picker tabs and ordering. The picker has `Dark` and `Light` tabs, opens on the active theme's tab, sorts by theme name inside each tab with built-in and user themes interleaved, filters inside the active tab, and states why a tab is empty. Focus cycles through the tab bar, the rows, and the footer actions; the tab bar is rendered without native focus, so Up, Down, and Enter keep working on the rows, and it shows its focus zone in text by brightening its labels and prefixing the selected tab with `>`.
- Theme export. The picker's `Export` footer control writes the highlighted theme as a complete standalone file in the themes directory, creating the directory when needed and refusing to overwrite an existing file. A built-in is written with a `-custom` suffix and Native Terminal as `native-terminal`, so an exported file never shadows the theme it came from.
- Native Terminal theme. A `terminal` entry detected from the terminal itself through `renderer.getPalette` (OSC 4, 10, and 11), mapped onto every token, with guarded secondary text and diff line backgrounds, a derived light or dark tab, and a 150 ms bounded startup query that runs concurrently with the configuration read. A terminal that cannot answer falls back to Catppuccin Mocha with one warning, and `app.reloadConfig` re-detects after a terminal profile change.
- `$GITMINAL_THEMES_DIR`, which relocates the user themes directory the same way `$GITMINAL_THEME` relocates `theme.json`.
- Help now reports the active theme's variant and source, and the resolved themes directory.
- The final five theme families, one theme each: Srcery, Iceberg, Night Owl, Jellybeans, and Tender. All five are MIT licensed. Srcery and Jellybeans use their own diff fills where the upstream fill clears the contrast floor, and Night Owl's selected-row fill is its published selection alpha flattened over the background.
- Five more theme families, one theme each: Noctis (default), Sonokai (default), Zenbones (Zenwritten dark), Tomorrow (base light), and Seoul256 (dark). Noctis, Sonokai, Zenbones, Tomorrow, and Seoul256 are all MIT licensed. Sonokai uses upstream's `bg_green` and `bg_red` diff fills and Seoul256 uses its own DiffAdd and DiffDelete fills.
- Five new theme families, one theme each: Kanagawa (Wave), Everforest (medium dark), Ayu (dark), Nightfox (default), and GitHub Light. Kanagawa and Everforest use upstream's own diff line backgrounds, GitHub Light uses Primer's `diffBlob` line fills, and Ayu's selected-row fill is the published selection alpha flattened over its background. All five are MIT licensed. New families now ship exactly one theme, the variant upstream treats as primary, so the picker gains distinct looks instead of brightness ladders.
- Twenty-one new built-in themes across ten palette families, bringing the catalogue to twenty-five: Tokyo Night (Night, Storm, Moon, Day), Gruvbox (Dark, Light), Nord, Rose Pine (Main, Moon, Dawn), Flexoki (Ink, Paper), Dracula (Dracula, Alucard), Atom One (Dark, Light), Solarized (Dark, Light), Zenburn, and High Contrast (Dark, Light). Each family owns its colors in its own module under `src/domain/theme/themes/`, and the registry flattens them into one picker order.
- Theme search in the picker. The modal has a search field that filters by name and label, and Up, Down, and Enter keep working while it is focused.
- A checked legibility floor for every built-in theme. `theme.contrast.test.ts` enforces WCAG contrast for primary text, secondary text, selection text, accents, diff signs on their own backgrounds, and status hues, and the picker list now caps its visible rows and scrolls the highlighted theme into view.
- A WCAG contrast helper at `src/domain/theme/theme.contrast.ts` in the domain layer.

### Changed

- Footer hints group related chords. Focused lists advertise `Up/Down/j/k Move` instead of separate up and down hints, and the diff panel advertises `J/K/H/L Scroll` for all four viewport directions, so every valid diff hint including the `S`/`U`/`D` bulk verbs and the `Right`/`Left` expand and collapse keys fits on one line at 160 columns. Diff catalogue labels shorten to `Toggle`, `Stage`, `Unstage`, `Discard`, and `Discard all`, and a group falls back to its individual hints when one member is unavailable. Modal hints keep their per-action bindings.

- The theme surface splits into one hook per concern. `ThemeProvider` is now a composition root over `useThemeSession` and `useResolvedTheme`, and the picker's view state composes `useThemePickerRows`, `useThemePickerHighlight`, `useThemePickerVariant`, `useThemePickerFocus`, and `useThemePickerSession`, so no hook exceeds the complexity ceiling the pre-commit gate enforces.
- The theme picker drops the per-row light-or-dark label, because the tab bar states it.
- `ThemeProvider` resolves against the catalogue the configuration loader built, so a reload lists new user themes without a restart.
- `help.search` is now `overlay.search`, because the help modal and the theme picker share one "focus this overlay's search field" action. A `keybindings.json` entry for `help.search` is reported as an unknown action and ignored.
- Catppuccin Latte's `diffAddBackground` is now lighter so the official green reaches the enforced 3:1 floor.
- Three upstream palettes needed a documented legibility adjustment. One Light, Solarized Light, and Tokyo Night Day use the same official diff-sign hues a few points darker, and Solarized assigns body text to the more legible member of its base pair, because the published values cannot reach the enforced contrast floors on their own paper backgrounds. Every other token keeps the published value, and each adjustment is explained in the family module.
- The theme token module split into `theme.registry.ts`, `theme.mono.ts`, and one module per palette family under `themes/`. `theme.catppuccin.ts` is gone, and `THEME_FLAVORS` is now `THEMES` with `getThemeDefinition` replacing `getThemeFlavor`.
- Hex color literals are now allowed anywhere under `src/domain/theme/themes/` plus `theme.mono.ts`, instead of one Catppuccin module.

## [1.4.0] - 2026-10-29

### Added

- Shared feature search overlay. Pressing `/` in Remotes, Tags, Stashes, or Worktrees opens one wide modal with a non-scrolling search field, wrapping details for the highlighted item, and a single scrolling results list. Results come from the same repository selectors as the sidebars and are not limited by the sidebar render caps, and names keep their `remote/` prefix, full tag name, stash index plus object identity, and absolute worktree path. The arrow keys, paging, Home, and End move only the overlay highlight; Escape closes immediately with the sidebar focus and selection unchanged, and Enter closes the modal and scrolls the accepted row into view.
- Local-tracker marker on remote branches. A `[L]` prefix marks a remote branch that at least one local branch tracks, even when the local name differs or the tracker is inactive or checked out in another worktree.
- Documentation site under `web/`, deployed by `.github/workflows/deploy-web-ftp.yml`.

### Changed

- Ordinary Fetch (`f`) now always fetches origin's configured refspecs with `git fetch --progress --no-prune --no-prune-tags -- origin`, independently of local upstreams. The command palette offers one Fetch entry per configured remote and runs the chosen remote explicitly. A missing origin blocks with `unknown-remote` instead of silently choosing another remote, and a fetch refspec that could write local branches is refused with the new `unsafe-fetch-refspec` reason.
- `config.remote.fetchScope` keeps its `local` default and `current` alternative but now governs only Fetch --prune, whose scoped fetch phase is unchanged.
- Remotes, Tags, Stashes, and Worktrees no longer render an inline search field; Branches keeps its own. This removes `RemoteFilter` and `useRemoteFilter`.
- Remote rows are now the branch name alone beneath a remote group header, with the stale or unknown marker and the new `[L]` marker inline. Within each group, branches sort by tip commit date newest first with branch name as the tie-breaker, and remote search results use the same order. Command targets and search identities stay remote-qualified.

## [1.3.0] - 2026-10-28

### Changed

- Every scrollable surface now shares one scrollbar implementation through `src/ui/useScrollbarOptions.ts`: thumb and arrow foregrounds use the `scrollbar` token, track and arrow backgrounds use `background`, and the colors follow theme previews, restores, and terminal capability changes. Sidebar panels use a vertical-only scrollbar and hide the horizontal one.
- Modals now size to their content up to the terminal height instead of reserving a fixed height. `ModalFrame` applies one cell of content padding and one row of gap, short dialogs no longer render empty filler rows, and bounded option lists scroll instead of padding themselves out. Help keeps its explicit scroll viewport, and Delete Branch overrides the gap for its separately budgeted risk section.
- Branch name validation in the New Branch modal now follows edits after a failed submit, so a corrected name clears its inline error immediately.
- `stash.includeUntrackedByDefault` now defaults to `true`, so the Create Stash modal includes untracked files unless the user turns the checkbox off or overrides the setting.

## [1.2.0] - 2026-10-28

### Changed

- The splash update notice now suggests `bun add -g @im4all/gitminal` instead of the npm command, and names only the version to upgrade to because the running version is already shown above it.

## [1.1.0] - 2026-10-28

### Added

- Fetch and prune (`F`) now removes stale remote branches after the prune, not just remote-tracking refs, and reports the removed branches in the operation console.
- Global "stage all unstaged" action (`A`). The existing `S` binding stays scoped to the focused unstaged section.
- Diff scrolling controls: `J` and `K` scroll one line, `shift+down` and `shift+up` scroll five lines, and `H`, `L`, `shift+left`, and `shift+right` scroll horizontally by eight columns.
- Commit search results now scroll into view, and history can be paged explicitly with the `L` "load older commits" action or the in-list button. Scrolling and cursor movement never page the graph automatically.
- Mouse wheel and trackpad scrolling of the commit graph now moves the native viewport only and leaves the selection where it is.
- `ctrl+space` toggles the console as an alias for `ctrl+backtick` in WSL sessions, where Windows Terminal can encode the two chords identically.
- README terminal color guide covering `NO_COLOR`, `COLORTERM`, `TERM`, WSL, Linux, macOS, and Windows PowerShell.

### Changed

- Custom-row lists mount the whole bounded loaded window inside one `<scrollbox>` with viewport culling, so native scrollbars and scroll offsets describe the real list instead of a hand-rolled mounted slice.
- The footer shows a curated subset of keybindings instead of every binding.

### Fixed

- The repository watcher no longer hits the maximum listener warning.
- `S` consistently stages within the focused unstaged section.
- Drilling into a diff and its files scrolls the selected row into view.
- The prepublish hook runs the full check suite correctly.
- Formatting and lint issues found by the audit.

## [1.0.0] - 2026-10-27

### Added

- Initial public release of Gitminal, a keyboard-first terminal git client with full mouse support.
- Repository support for empty, detached HEAD, conflict, and normal states, with a background watch loop plus manual refresh.
- Commit graph with lazygit-style lanes, rounded and sharp glyph styles, selection, paging, search, and a pending changes row.
- Per-file unified diffs with hunk collapsing, context control, syntax highlighting through bundled tree-sitter grammars, and expand/collapse navigation.
- Working tree actions: stage, unstage, discard, delete untracked, stage all, unstage all, discard all, and their section-scoped and global variants, with confirmations, a status line, and an error overlay.
- Commit composer with message prefill, amend, commit options, identity handling, and no-verify variants.
- Sidebar panels for branches, remotes, tags, stashes, and worktrees, including create, delete, checkout, push, prune, and stash apply, pop, and delete.
- Remote operations for pull, push, force push with safe and overwrite variants, push without hooks, fetch, and fetch and prune, with busy state, progress, and a sync badge.
- Operation console with command, status, duration, and expandable output.
- Command palette, searchable Help, theme picker with Catppuccin flavors, and truecolor, 256-color, and monochrome capability detection.
- Optional `config.json`, `keybindings.json`, and `theme.json`, with environment overrides, per-field validation warnings, live reload, and configurable mouse and graph scope and style.
- Splash screen with package and version display plus a registry update check.
- Mouse support across lists, buttons, checkboxes, section headers, tables, and scrollbars.
- Architecture, boundary, glyph, and structure checks plus unit and integration test suites.
