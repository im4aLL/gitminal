/**
 * Install command definitions for the Hero command deck.
 */
const INSTALL_COMMANDS = Object.freeze({
  bun: {
    command: "bun add -g @im4all/gitminal",
    note: "Install the global `gitminal` binary via Bun (>= 1.3.14).",
  },
  bunx: {
    command: "bunx @im4all/gitminal",
    note: "Run immediately inside any Git repository without global installation.",
  },
  npm: {
    command: "npm install -g @im4all/gitminal",
    note: "Install globally via npm. Requires Bun (>= 1.3.14) installed on PATH.",
  },
});

/**
 * Simulator palettes for every built-in theme, mirrored from
 * `src/domain/theme/themes/` and keyed by the name written into `config.json`.
 *
 * A theme supplies every token the simulated terminal paints with. `mono-dark` is
 * the NO_COLOR outcome rather than a selectable theme, so it is preview-only and
 * never listed in the picker's Dark or Light tab.
 */
// biome-ignore format: one mirrored palette per line keeps the 40-theme table scannable.
const SIM_THEMES = Object.freeze({
  "catppuccin-mocha": Object.freeze({ label: "Catppuccin Mocha", variant: "dark", bg: "#1e1e2e", mantle: "#181825", surface: "#313244", border: "#45475a", selection: "#585b70", focus: "#cba6f7", text: "#cdd6f4", muted: "#a6adc8", dim: "#7f849c", green: "#a6e3a1", red: "#f38ba8", yellow: "#f9e2af", blue: "#89b4fa", peach: "#fab387", teal: "#94e2d5", addBg: "#1f3b2c", delBg: "#3b1f2a", lanes: Object.freeze(["#cba6f7","#89b4fa","#94e2d5","#fab387"]) }),
  "catppuccin-macchiato": Object.freeze({ label: "Catppuccin Macchiato", variant: "dark", bg: "#24273a", mantle: "#1e2030", surface: "#363a4f", border: "#494d64", selection: "#5b6078", focus: "#c6a0f6", text: "#cad3f5", muted: "#a5adcb", dim: "#8087a2", green: "#a6da95", red: "#ed8796", yellow: "#eed49f", blue: "#8aadf4", peach: "#f5a97f", teal: "#8bd5ca", addBg: "#343c45", delBg: "#3c3245", lanes: Object.freeze(["#c6a0f6","#8aadf4","#8bd5ca","#f5a97f"]) }),
  "catppuccin-frappe": Object.freeze({ label: "Catppuccin Frappe", variant: "dark", bg: "#303446", mantle: "#292c3c", surface: "#414559", border: "#51576d", selection: "#626880", focus: "#ca9ee6", text: "#c6d0f5", muted: "#a5adce", dim: "#838ba7", green: "#a6d189", red: "#e78284", yellow: "#e5c890", blue: "#8caaee", peach: "#ef9f76", teal: "#81c8be", addBg: "#3e464e", delBg: "#463d4d", lanes: Object.freeze(["#ca9ee6","#8caaee","#81c8be","#ef9f76"]) }),
  "catppuccin-latte": Object.freeze({ label: "Catppuccin Latte", variant: "light", bg: "#eff1f5", mantle: "#e6e9ef", surface: "#ccd0da", border: "#bcc0cc", selection: "#acb0be", focus: "#8839ef", text: "#4c4f69", muted: "#6c6f85", dim: "#8c8fa1", green: "#40a02b", red: "#d20f39", yellow: "#df8e1d", blue: "#1e66f5", peach: "#fe640b", teal: "#179299", addBg: "#eef6f1", delBg: "#ecd6de", lanes: Object.freeze(["#8839ef","#1e66f5","#179299","#fe640b"]) }),
  "tokyo-night-night": Object.freeze({ label: "Tokyo Night", variant: "dark", bg: "#1a1b26", mantle: "#16161e", surface: "#292e42", border: "#414868", selection: "#394b70", focus: "#7aa2f7", text: "#c0caf5", muted: "#a9b1d6", dim: "#565f89", green: "#9ece6a", red: "#f7768e", yellow: "#e0af68", blue: "#7dcfff", peach: "#ff9e64", teal: "#73daca", addBg: "#2c3430", delBg: "#392835", lanes: Object.freeze(["#7aa2f7","#bb9af7","#73daca","#ff9e64"]) }),
  "tokyo-night-storm": Object.freeze({ label: "Tokyo Night Storm", variant: "dark", bg: "#24283b", mantle: "#1f2335", surface: "#292e42", border: "#414868", selection: "#394b70", focus: "#7aa2f7", text: "#c0caf5", muted: "#a9b1d6", dim: "#565f89", green: "#9ece6a", red: "#f7768e", yellow: "#e0af68", blue: "#7dcfff", peach: "#ff9e64", teal: "#73daca", addBg: "#353f42", delBg: "#423347", lanes: Object.freeze(["#7aa2f7","#bb9af7","#73daca","#ff9e64"]) }),
  "tokyo-night-moon": Object.freeze({ label: "Tokyo Night Moon", variant: "dark", bg: "#222436", mantle: "#1e2030", surface: "#2f334d", border: "#444a73", selection: "#394b70", focus: "#82aaff", text: "#c8d3f5", muted: "#828bb8", dim: "#636da6", green: "#c3e88d", red: "#ff757f", yellow: "#ffc777", blue: "#86e1fc", peach: "#ff966c", teal: "#4fd6be", addBg: "#393f42", delBg: "#412f40", lanes: Object.freeze(["#82aaff","#c099ff","#4fd6be","#ff966c"]) }),
  "tokyo-night-day": Object.freeze({ label: "Tokyo Night Day", variant: "light", bg: "#e1e2e7", mantle: "#e1e2e7", surface: "#e1e2e7", border: "#b4b5b9", selection: "#b7c1e3", focus: "#2e7de9", text: "#3760bf", muted: "#6172b0", dim: "#848cb5", green: "#587539", red: "#db0a49", yellow: "#8c6c3e", blue: "#007197", peach: "#b15c00", teal: "#387068", addBg: "#d9dbdd", delBg: "#e1d5de", lanes: Object.freeze(["#2e7de9","#9854f1","#387068","#b15c00"]) }),
  "gruvbox-dark": Object.freeze({ label: "Gruvbox Dark", variant: "dark", bg: "#282828", mantle: "#32302f", surface: "#3c3836", border: "#504945", selection: "#504945", focus: "#fe8019", text: "#ebdbb2", muted: "#bdae93", dim: "#928374", green: "#b8bb26", red: "#fb4934", yellow: "#fabd2f", blue: "#83a598", peach: "#fe8019", teal: "#fabd2f", addBg: "#3c3d28", delBg: "#462d2a", lanes: Object.freeze(["#fb4934","#b8bb26","#fabd2f","#83a598"]) }),
  "gruvbox-light": Object.freeze({ label: "Gruvbox Light", variant: "light", bg: "#fbf1c7", mantle: "#f2e5bc", surface: "#ebdbb2", border: "#d5c4a1", selection: "#d5c4a1", focus: "#af3a03", text: "#282828", muted: "#504945", dim: "#7c6f64", green: "#79740e", red: "#9d0006", yellow: "#b57614", blue: "#076678", peach: "#af3a03", teal: "#b57614", addBg: "#e9e0ad", delBg: "#eecfac", lanes: Object.freeze(["#9d0006","#79740e","#b57614","#076678"]) }),
  "nord": Object.freeze({ label: "Nord", variant: "dark", bg: "#2e3440", mantle: "#3b4252", surface: "#3b4252", border: "#4c566a", selection: "#434c5e", focus: "#88c0d0", text: "#d8dee9", muted: "#81a1c1", dim: "#5e81ac", green: "#a3be8c", red: "#bf616a", yellow: "#ebcb8b", blue: "#88c0d0", peach: "#d08770", teal: "#ebcb8b", addBg: "#3e474b", delBg: "#292f3a", lanes: Object.freeze(["#88c0d0","#a3be8c","#ebcb8b","#b48ead"]) }),
  "rose-pine-main": Object.freeze({ label: "Rose Pine", variant: "dark", bg: "#191724", mantle: "#1f1d2e", surface: "#26233a", border: "#403d52", selection: "#403d52", focus: "#c4a7e7", text: "#e0def4", muted: "#908caa", dim: "#6e6a86", green: "#31748f", red: "#eb6f92", yellow: "#f6c177", blue: "#9ccfd8", peach: "#ebbcba", teal: "#ebbcba", addBg: "#171520", delBg: "#362333", lanes: Object.freeze(["#c4a7e7","#9ccfd8","#ebbcba","#f6c177"]) }),
  "rose-pine-moon": Object.freeze({ label: "Rose Pine Moon", variant: "dark", bg: "#232136", mantle: "#2a273f", surface: "#393552", border: "#44415a", selection: "#44415a", focus: "#c4a7e7", text: "#e0def4", muted: "#908caa", dim: "#6e6a86", green: "#3e8fb0", red: "#eb6f92", yellow: "#f6c177", blue: "#9ccfd8", peach: "#ea9a97", teal: "#ea9a97", addBg: "#273047", delBg: "#3f2c43", lanes: Object.freeze(["#c4a7e7","#9ccfd8","#ea9a97","#f6c177"]) }),
  "rose-pine-dawn": Object.freeze({ label: "Rose Pine Dawn", variant: "light", bg: "#faf4ed", mantle: "#fffaf3", surface: "#f2e9e1", border: "#dfdad9", selection: "#dfdad9", focus: "#907aa9", text: "#464261", muted: "#797593", dim: "#9893a5", green: "#286983", red: "#b4637a", yellow: "#ea9d34", blue: "#56949f", peach: "#d7827e", teal: "#d7827e", addBg: "#dde1de", delBg: "#f0e0dd", lanes: Object.freeze(["#907aa9","#56949f","#d7827e","#ea9d34"]) }),
  "flexoki-ink": Object.freeze({ label: "Flexoki Ink", variant: "dark", bg: "#100f0f", mantle: "#1c1b1a", surface: "#282726", border: "#343331", selection: "#403e3c", focus: "#4385be", text: "#cecdc3", muted: "#878580", dim: "#6f6e69", green: "#879a39", red: "#d14d41", yellow: "#d0a215", blue: "#4385be", peach: "#da702c", teal: "#3aa99f", addBg: "#212215", delBg: "#2b1816", lanes: Object.freeze(["#4385be","#8b7ec8","#3aa99f","#da702c"]) }),
  "flexoki-paper": Object.freeze({ label: "Flexoki Paper", variant: "light", bg: "#fffcf0", mantle: "#f2f0e5", surface: "#e6e4d9", border: "#dad8ce", selection: "#cecdc3", focus: "#205ea6", text: "#100f0f", muted: "#6f6e69", dim: "#878580", green: "#66800b", red: "#af3029", yellow: "#ad8301", blue: "#205ea6", peach: "#bc5215", teal: "#24837b", addBg: "#eaebd0", delBg: "#f4dfd4", lanes: Object.freeze(["#205ea6","#5e409d","#24837b","#bc5215"]) }),
  "dracula": Object.freeze({ label: "Dracula", variant: "dark", bg: "#282a36", mantle: "#21222c", surface: "#21222c", border: "#44475a", selection: "#44475a", focus: "#bd93f9", text: "#f8f8f2", muted: "#6272a4", dim: "#6272a4", green: "#50fa7b", red: "#ff5555", yellow: "#f1fa8c", blue: "#8be9fd", peach: "#ffb86c", teal: "#50fa7b", addBg: "#2a363a", delBg: "#352d38", lanes: Object.freeze(["#bd93f9","#8be9fd","#50fa7b","#ffb86c"]) }),
  "dracula-alucard": Object.freeze({ label: "Dracula Alucard", variant: "light", bg: "#fffbeb", mantle: "#f7f0dc", surface: "#f7f0dc", border: "#cfcfde", selection: "#cfcfde", focus: "#644ac9", text: "#1f1f1f", muted: "#6c664b", dim: "#6c664b", green: "#14710a", red: "#cb3a2a", yellow: "#846e15", blue: "#036a96", peach: "#a34d14", teal: "#14710a", addBg: "#f1f3dd", delBg: "#fcefdf", lanes: Object.freeze(["#644ac9","#036a96","#14710a","#a34d14"]) }),
  "one-dark": Object.freeze({ label: "One Dark", variant: "dark", bg: "#282c34", mantle: "#21252b", surface: "#2c323c", border: "#3e4451", selection: "#3e4451", focus: "#528bff", text: "#abb2bf", muted: "#828997", dim: "#5c6370", green: "#98c379", red: "#e06c75", yellow: "#e5c07b", blue: "#56b6c2", peach: "#d19a66", teal: "#56b6c2", addBg: "#2f3538", delBg: "#333038", lanes: Object.freeze(["#528bff","#c678dd","#56b6c2","#98c379"]) }),
  "one-light": Object.freeze({ label: "One Light", variant: "light", bg: "#fafafa", mantle: "#f0f0f0", surface: "#eaeaeb", border: "#e5e5e6", selection: "#e5e5e6", focus: "#526eff", text: "#383a42", muted: "#696c77", dim: "#a0a1a7", green: "#50a14f", red: "#e45649", yellow: "#c18401", blue: "#0184bc", peach: "#986801", teal: "#0184bc", addBg: "#eff2ef", delBg: "#f8eeed", lanes: Object.freeze(["#526eff","#a626a4","#0184bc","#50a14f"]) }),
  "solarized-dark": Object.freeze({ label: "Solarized Dark", variant: "dark", bg: "#002b36", mantle: "#002b36", surface: "#073642", border: "#586e75", selection: "#073642", focus: "#268bd2", text: "#93a1a1", muted: "#839496", dim: "#586e75", green: "#859900", red: "#dc322f", yellow: "#b58900", blue: "#268bd2", peach: "#cb4b16", teal: "#2aa198", addBg: "#083233", delBg: "#0d2b36", lanes: Object.freeze(["#268bd2","#6c71c4","#2aa198","#859900"]) }),
  "solarized-light": Object.freeze({ label: "Solarized Light", variant: "light", bg: "#fdf6e3", mantle: "#fdf6e3", surface: "#fdf6e3", border: "#93a1a1", selection: "#eee8d5", focus: "#268bd2", text: "#586e75", muted: "#657b83", dim: "#93a1a1", green: "#859900", red: "#dc322f", yellow: "#b58900", blue: "#268bd2", peach: "#cb4b16", teal: "#2aa198", addBg: "#f5efd5", delBg: "#fbead8", lanes: Object.freeze(["#268bd2","#6c71c4","#2aa198","#859900"]) }),
  "zenburn": Object.freeze({ label: "Zenburn", variant: "dark", bg: "#3f3f3f", mantle: "#333333", surface: "#4f4f4f", border: "#545a4f", selection: "#2f2f2f", focus: "#f0dfaf", text: "#dcdccc", muted: "#9fafaf", dim: "#8f8f8f", green: "#9ece9e", red: "#cc9393", yellow: "#e3ceab", blue: "#8cd0d3", peach: "#dfaf8f", teal: "#efef8f", addBg: "#454845", delBg: "#474444", lanes: Object.freeze(["#8cd0d3","#dca3a3","#efef8f","#cc9393"]) }),
  "high-contrast-dark": Object.freeze({ label: "High Contrast Dark", variant: "dark", bg: "#000000", mantle: "#0a0a0a", surface: "#1a1a1a", border: "#6b6b6b", selection: "#262626", focus: "#ffd400", text: "#ffffff", muted: "#d0d0d0", dim: "#a0a0a0", green: "#4ade80", red: "#ff6b6b", yellow: "#fbbf24", blue: "#60a5fa", peach: "#ff9f43", teal: "#60a5fa", addBg: "#040d08", delBg: "#0f0606", lanes: Object.freeze(["#ffd400","#4ade80","#60a5fa","#ff9f43"]) }),
  "high-contrast-light": Object.freeze({ label: "High Contrast Light", variant: "light", bg: "#ffffff", mantle: "#f4f4f4", surface: "#e8e8e8", border: "#767676", selection: "#dcdcdc", focus: "#0033cc", text: "#000000", muted: "#333333", dim: "#555555", green: "#0b4a1f", red: "#990019", yellow: "#6b4500", blue: "#0043a3", peach: "#a33d00", teal: "#0043a3", addBg: "#f0f4f2", delBg: "#f9f0f1", lanes: Object.freeze(["#0033cc","#0b4a1f","#0043a3","#a33d00"]) }),
  "kanagawa": Object.freeze({ label: "Kanagawa", variant: "dark", bg: "#1f1f28", mantle: "#16161d", surface: "#2a2a37", border: "#363646", selection: "#2d4f67", focus: "#7e9cd8", text: "#dcd7ba", muted: "#c8c093", dim: "#727169", green: "#98bb6c", red: "#e46876", yellow: "#e6c384", blue: "#7fb4ca", peach: "#ffa066", teal: "#7aa89f", addBg: "#2b3328", delBg: "#43242b", lanes: Object.freeze(["#7e9cd8","#957fb8","#7aa89f","#e6c384"]) }),
  "everforest": Object.freeze({ label: "Everforest", variant: "dark", bg: "#2d353b", mantle: "#232a2e", surface: "#343f44", border: "#3d484d", selection: "#475258", focus: "#a7c080", text: "#d3c6aa", muted: "#859289", dim: "#7a8478", green: "#a7c080", red: "#e67e80", yellow: "#dbbc7f", blue: "#7fbbb3", peach: "#e69875", teal: "#d699b6", addBg: "#425047", delBg: "#514045", lanes: Object.freeze(["#a7c080","#7fbbb3","#d699b6","#dbbc7f"]) }),
  "ayu": Object.freeze({ label: "Ayu", variant: "dark", bg: "#0d1017", mantle: "#0d1017", surface: "#141821", border: "#1b1f29", selection: "#212733", focus: "#e6b450", text: "#bfbdb6", muted: "#667381", dim: "#5a6673", green: "#70bf56", red: "#f26d78", yellow: "#ffb454", blue: "#59c2ff", peach: "#ff8f40", teal: "#39bae6", addBg: "#131b1b", delBg: "#1b161d", lanes: Object.freeze(["#59c2ff","#d2a6ff","#39bae6","#aad94c"]) }),
  "nightfox": Object.freeze({ label: "Nightfox", variant: "dark", bg: "#192330", mantle: "#131a24", surface: "#212e3f", border: "#29394f", selection: "#2b3b51", focus: "#719cd6", text: "#cdcecf", muted: "#aeafb0", dim: "#738091", green: "#81b29a", red: "#c94f6d", yellow: "#dbc074", blue: "#63cdcf", peach: "#f4a261", teal: "#63cdcf", addBg: "#1f2c36", delBg: "#242634", lanes: Object.freeze(["#719cd6","#9d79d6","#63cdcf","#81b29a"]) }),
  "github-light": Object.freeze({ label: "GitHub Light", variant: "light", bg: "#f6f8fa", mantle: "#ffffff", surface: "#eaeef2", border: "#d0d7de", selection: "#d0d7de", focus: "#0969da", text: "#1f2328", muted: "#656d76", dim: "#6e7781", green: "#1a7f37", red: "#cf222e", yellow: "#9a6700", blue: "#0969da", peach: "#bc4c00", teal: "#1b7c83", addBg: "#e6ffec", delBg: "#ffebe9", lanes: Object.freeze(["#0969da","#8250df","#1b7c83","#bc4c00"]) }),
  "noctis": Object.freeze({ label: "Noctis", variant: "dark", bg: "#052529", mantle: "#041d20", surface: "#073940", border: "#0f1415", selection: "#0e6671", focus: "#40d4e7", text: "#b2cacd", muted: "#929ea0", dim: "#5b858b", green: "#49e9a6", red: "#e3541c", yellow: "#d5971a", blue: "#49ace9", peach: "#e66533", teal: "#49d6e9", addBg: "#093131", delBg: "#122828", lanes: Object.freeze(["#16a3b6","#df769b","#49d6e9","#49e9a6"]) }),
  "sonokai": Object.freeze({ label: "Sonokai", variant: "dark", bg: "#2c2e34", mantle: "#222327", surface: "#33353f", border: "#3b3e48", selection: "#414550", focus: "#76cce0", text: "#e2e2e3", muted: "#7f8490", dim: "#595f6f", green: "#9ed072", red: "#fc5d7c", yellow: "#e7c664", blue: "#76cce0", peach: "#f39660", teal: "#9ed072", addBg: "#394634", delBg: "#55393d", lanes: Object.freeze(["#76cce0","#b39df3","#9ed072","#e7c664"]) }),
  "zenbones": Object.freeze({ label: "Zenbones", variant: "dark", bg: "#191919", mantle: "#191919", surface: "#2c2c2c", border: "#555555", selection: "#444444", focus: "#819b69", text: "#bbbbbb", muted: "#8e8e8e", dim: "#686868", green: "#819b69", red: "#de6e7c", yellow: "#b77e64", blue: "#6099c0", peach: "#b77e64", teal: "#66a5ad", addBg: "#1f211e", delBg: "#251e1f", lanes: Object.freeze(["#6099c0","#b279a7","#66a5ad","#b77e64"]) }),
  "tomorrow": Object.freeze({ label: "Tomorrow", variant: "light", bg: "#ffffff", mantle: "#efefef", surface: "#efefef", border: "#d6d6d6", selection: "#d6d6d6", focus: "#4271ae", text: "#4d4d4c", muted: "#4d4d4c", dim: "#8e908c", green: "#718c00", red: "#c82829", yellow: "#f5871f", blue: "#3e999f", peach: "#f5871f", teal: "#3e999f", addBg: "#f6f8f0", delBg: "#fcf2f2", lanes: Object.freeze(["#4271ae","#8959a8","#3e999f","#718c00"]) }),
  "seoul256": Object.freeze({ label: "Seoul256", variant: "dark", bg: "#3a3a3a", mantle: "#262626", surface: "#262626", border: "#4e4e4e", selection: "#005f5f", focus: "#87afd7", text: "#d0d0d0", muted: "#87875f", dim: "#5f875f", green: "#87af87", red: "#d75f87", yellow: "#d7af5f", blue: "#87afd7", peach: "#d7875f", teal: "#87af87", addBg: "#005f00", delBg: "#875f5f", lanes: Object.freeze(["#87afd7","#d75f87","#87af87","#d7af5f"]) }),
  "srcery": Object.freeze({ label: "Srcery", variant: "dark", bg: "#1c1b19", mantle: "#121212", surface: "#262522", border: "#312f2c", selection: "#3b3935", focus: "#fbb829", text: "#fce8c3", muted: "#c5b088", dim: "#917e6b", green: "#519f50", red: "#ef2f27", yellow: "#fed06e", blue: "#68a8e4", peach: "#ff5f00", teal: "#2be4d0", addBg: "#294229", delBg: "#4f2321", lanes: Object.freeze(["#68a8e4","#ff5c8f","#2be4d0","#98bc37"]) }),
  "iceberg": Object.freeze({ label: "Iceberg", variant: "dark", bg: "#161821", mantle: "#17171b", surface: "#1e2132", border: "#3e445e", selection: "#272c42", focus: "#84a0c6", text: "#c6c8d1", muted: "#818596", dim: "#6b7089", green: "#b4be82", red: "#e27878", yellow: "#e2a478", blue: "#89b8c2", peach: "#e2a478", teal: "#89b8c2", addBg: "#1f2227", delBg: "#221e26", lanes: Object.freeze(["#84a0c6","#a093c7","#89b8c2","#b4be82"]) }),
  "night-owl": Object.freeze({ label: "Night Owl", variant: "dark", bg: "#011627", mantle: "#01111d", surface: "#0b2942", border: "#1d3b53", selection: "#14344f", focus: "#82aaff", text: "#d6deeb", muted: "#89a4bb", dim: "#637777", green: "#22da6e", red: "#ff5874", yellow: "#c5e478", blue: "#7fdbca", peach: "#c792ea", teal: "#7fdbca", addBg: "#03222b", delBg: "#101a2c", lanes: Object.freeze(["#82aaff","#c792ea","#7fdbca","#22da6e"]) }),
  "jellybeans": Object.freeze({ label: "Jellybeans", variant: "dark", bg: "#151515", mantle: "#1c1c1c", surface: "#333333", border: "#403c41", selection: "#404040", focus: "#8fbfdc", text: "#e8e8d3", muted: "#a0a8b0", dim: "#888888", green: "#99ad6a", red: "#cf6a4c", yellow: "#ffb964", blue: "#8fbfdc", peach: "#dad085", teal: "#99ad6a", addBg: "#437019", delBg: "#201a18", lanes: Object.freeze(["#8fbfdc","#c6b6ee","#99ad6a","#ffb964"]) }),
  "tender": Object.freeze({ label: "Tender", variant: "dark", bg: "#282828", mantle: "#202020", surface: "#202020", border: "#444444", selection: "#293b44", focus: "#73cef4", text: "#eeeeee", muted: "#999999", dim: "#666666", green: "#c9d05c", red: "#f43753", yellow: "#ffc24b", blue: "#73cef4", peach: "#ffc24b", teal: "#ffc24b", addBg: "#32322b", delBg: "#34292b", lanes: Object.freeze(["#73cef4","#c9d05c","#ffc24b","#f43753"]) }),
  "mono-dark": Object.freeze({ label: "NO_COLOR (mono)", variant: "dark", previewOnly: true, bg: "#000000", mantle: "#0c0c0c", surface: "#1f1f1f", border: "#6a6a6a", selection: "#2f2f2f", focus: "#ffffff", text: "#ffffff", muted: "#b0b0b0", dim: "#8a8a8a", green: "#ffffff", red: "#ffffff", yellow: "#d0d0d0", blue: "#d0d0d0", peach: "#d0d0d0", teal: "#ffffff", addBg: "#1a1a1a", delBg: "#1a1a1a", lanes: Object.freeze(["#ffffff", "#d0d0d0", "#b0b0b0", "#8a8a8a"]) }),
});

/** Theme the simulator starts on. */
const DEFAULT_SIM_THEME = "catppuccin-mocha";

/** Maps one simulator palette field onto the CSS custom property it paints with. */
const SIM_THEME_CSS_VARS = Object.freeze({
  bg: "--sim-bg",
  mantle: "--sim-mantle",
  surface: "--sim-surface",
  border: "--sim-border",
  selection: "--sim-selection",
  focus: "--sim-focus",
  text: "--sim-text",
  muted: "--sim-muted",
  dim: "--sim-dim",
  green: "--sim-green",
  red: "--sim-red",
  yellow: "--sim-yellow",
  blue: "--sim-blue",
  peach: "--sim-peach",
  teal: "--sim-teal",
  addBg: "--sim-add-bg",
  delBg: "--sim-del-bg",
});

/** CSS custom properties the commit graph lanes paint with, in lane order. */
const SIM_LANE_CSS_VARS = Object.freeze([
  "--color-lane-0",
  "--color-lane-1",
  "--color-lane-2",
  "--color-lane-3",
]);

/**
 * Simulated sidebar data for regions 1 through 5.
 */
const SIDEBAR_DATA = Object.freeze({
  branches: [
    { name: "main", current: true, meta: "origin/main" },
    { name: "feat/tree-sitter-wasm", current: false, meta: "ahead 2" },
    { name: "fix/redact-credentials", current: false, meta: "up to date" },
    { name: "feat/graph-lanes", current: false, meta: "no upstream" },
    { name: "chore/parsers-vendor", current: false, meta: "no upstream" },
    { name: "release/v1.3.0", current: false, meta: "origin/release" },
  ],
  remotes: [
    { name: "origin/main", badge: "", meta: "tracked" },
    { name: "origin/feat/tree-sitter-wasm", badge: "", meta: "tracked" },
    { name: "origin/develop", badge: "[?]", meta: "stale" },
    { name: "origin/feature/legacy-ui", badge: "[?]", meta: "stale" },
    { name: "upstream/main", badge: "", meta: "remote" },
  ],
  tags: [
    { name: "v1.3.0", badge: "[LR]", meta: "1f901cb" },
    { name: "v1.3.0-rc.1", badge: "[L\u2191]", meta: "a84d21e" },
    { name: "v1.2.0", badge: "[LR]", meta: "7c3b902" },
    { name: "v1.0.0", badge: "[L?]", meta: "c0291ab" },
  ],
  stashes: [
    { name: "stash@{0}: WIP on main: diff collapse", badge: "2m", meta: "3 files" },
    { name: "stash@{1}: untracked theme tokens", badge: "4h", meta: "1 file" },
  ],
  worktrees: [
    { name: "main *", badge: "current", meta: "~/repos/gitminal" },
    { name: "release-check +", badge: "linked", meta: "../gitminal-wt" },
  ],
});

/**
 * Simulated commits in region 6 (including working tree row at index 0).
 */
const GRAPH_COMMITS = Object.freeze([
  {
    id: "working-tree",
    isWorkingTree: true,
    isMerge: false,
    roundedLanes: "\u25cb   ",
    sharpLanes: "\u25cb   ",
    laneClass: "tui-commit__lane--0",
    roundedCont: "\u2502   ",
    sharpCont: "\u2502   ",
    subject: "Working tree (2 modified, 1 staged)",
    author: "Local Workspace",
    date: "uncommitted",
    filesCount: 3,
    refBadge: "INDEX",
    refType: "branch",
    parents: "1f901cb",
    stats: "3 files changed +42 -5",
    diffFile: "M src/domain/git/git.client.ts",
    diffAdd: "+28",
    diffDel: "-4",
    diffHunk: "@@ -44,8 +44,14 @@ export async function spawnGitCommand(argv: readonly string[])",
    diffLines: [
      { no: "44", sign: " ", type: "ctx", code: "  const child = spawn(gitBinary, argv, {" },
      { no: "45", sign: "-", type: "del", code: "    shell: false," },
      {
        no: "45",
        sign: "+",
        type: "add",
        code: "    shell: false, // Enforced: argv[] only, zero shell interpolation",
      },
      {
        no: "46",
        sign: "+",
        type: "add",
        code: "    env: buildSanitizedGitEnv(process.env),",
      },
      { no: "47", sign: " ", type: "ctx", code: '    stdio: ["ignore", "pipe", "pipe"],' },
      { no: "48", sign: " ", type: "ctx", code: "  });" },
      {
        no: "49",
        sign: "+",
        type: "add",
        code: "  const redactedStderr = redactCredentials(rawStderr);",
      },
    ],
  },
  {
    id: "1f901cb",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u25cb   ",
    sharpLanes: "\u25cb   ",
    laneClass: "tui-commit__lane--0",
    roundedCont: "\u2502   ",
    sharpCont: "\u2502   ",
    subject: "feat(config): load settings from the environment",
    author: "Ada Lovelace <ada@example.com>",
    date: "14 Sep 16:26",
    filesCount: 1,
    refBadge: "main",
    refType: "branch",
    parents: "a84d21e",
    stats: "1 file changed +32 -1",
    diffFile: "M src/config.py",
    diffAdd: "+32",
    diffDel: "-1",
    diffHunk: "@@ -1,4 +1,18 @@",
    diffLines: [
      { no: "1", sign: "-", type: "del", code: "# feat: config loader" },
      {
        no: "1",
        sign: "+",
        type: "add",
        code: '"""Application settings loaded from environment variables."""',
      },
      { no: "2", sign: "+", type: "add", code: "from __future__ import annotations" },
      { no: "3", sign: "+", type: "add", code: "import os" },
      { no: "4", sign: "+", type: "add", code: "from dataclasses import dataclass, replace" },
      { no: "5", sign: " ", type: "ctx", code: "" },
      { no: "6", sign: "+", type: "add", code: "@dataclass(frozen=True)" },
      { no: "7", sign: "+", type: "add", code: "class Config:" },
      {
        no: "8",
        sign: "+",
        type: "add",
        code: '    api_base_url: str = "https://api.example.com"',
      },
      { no: "9", sign: "+", type: "add", code: "    api_timeout: float = 10.0" },
    ],
  },
  {
    id: "a84d21e",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u25cb   ",
    sharpLanes: "\u25cb   ",
    laneClass: "tui-commit__lane--0",
    roundedCont: "\u2502   ",
    sharpCont: "\u2502   ",
    subject: "feat(diff): vendor tree-sitter wasm highlight queries",
    author: "Alan Turing <alan@example.com>",
    date: "14 Sep 14:10",
    filesCount: 4,
    refBadge: "v1.3.0",
    refType: "tag",
    parents: "7c3b902",
    stats: "4 files changed +118 -12",
    diffFile: "M src/app/syntax.parsers.ts",
    diffAdd: "+64",
    diffDel: "-6",
    diffHunk: "@@ -12,7 +12,15 @@ export const VENDORED_PARSERS = Object.freeze([",
    diffLines: [
      { no: "12", sign: " ", type: "ctx", code: '  "typescript",' },
      { no: "13", sign: " ", type: "ctx", code: '  "python",' },
      { no: "14", sign: "+", type: "add", code: '  "rust",' },
      { no: "15", sign: "+", type: "add", code: '  "go",' },
      { no: "16", sign: "+", type: "add", code: '  "yaml",' },
      { no: "17", sign: "-", type: "del", code: "  // runtime fetch fallback removed" },
      { no: "18", sign: " ", type: "ctx", code: "]);" },
    ],
  },
  {
    id: "7c3b902",
    isWorkingTree: false,
    isMerge: true,
    roundedLanes: "\u25ce\u2500\u256e ",
    sharpLanes: "+\u2500\u2510 ",
    laneClass: "tui-commit__lane--1",
    roundedCont: "\u2502 \u2502 ",
    sharpCont: "\u2502 \u2502 ",
    subject: "Merge branch 'feat/graph-lanes' into main",
    author: "Grace Hopper <grace@example.com>",
    date: "14 Sep 13:26",
    filesCount: 2,
    refBadge: "v1.2.0",
    refType: "tag",
    parents: "9b02c41, 4e119fa",
    stats: "2 files changed +85 -9",
    diffFile: "M src/features/graph/GraphLanes.tsx",
    diffAdd: "+54",
    diffDel: "-5",
    diffHunk: "@@ -22,6 +22,13 @@ export function selectLaneGlyphSet(style: GraphStyle)",
    diffLines: [
      {
        no: "22",
        sign: " ",
        type: "ctx",
        code: "export function selectLaneGlyphSet(style: GraphStyle) {",
      },
      { no: "23", sign: "-", type: "del", code: "  return ROUNDED_GLYPHS;" },
      {
        no: "23",
        sign: "+",
        type: "add",
        code: '  return style === "sharp" ? SHARP_GLYPHS : ROUNDED_GLYPHS;',
      },
      { no: "24", sign: " ", type: "ctx", code: "}" },
    ],
  },
  {
    id: "4e119fa",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u2502 \u25cb ",
    sharpLanes: "\u2502 \u25cb ",
    laneClass: "tui-commit__lane--2",
    roundedCont: "\u251c\u2500\u256f ",
    sharpCont: "\u251c\u2500\u2518 ",
    subject: "feat(graph): add rounded and sharp lazygit lane set",
    author: "Ada Lovelace <ada@example.com>",
    date: "14 Sep 12:26",
    filesCount: 3,
    refBadge: "",
    refType: "",
    parents: "9b02c41",
    stats: "3 files changed +140 -18",
    diffFile: "M src/theme/icons.ts",
    diffAdd: "+19",
    diffDel: "-2",
    diffHunk: "@@ -70,6 +70,12 @@ export const ICONS = Object.freeze({",
    diffLines: [
      { no: "70", sign: " ", type: "ctx", code: '  graphCommit: "\\u25cb",' },
      { no: "71", sign: "+", type: "add", code: '  graphMerge: "\\u25ce",' },
      { no: "72", sign: "+", type: "add", code: '  graphMergeSharp: "+",' },
      { no: "73", sign: "+", type: "add", code: '  graphUpLeft: "\\u256f",' },
      { no: "74", sign: "+", type: "add", code: '  graphSharpUpLeft: "\\u2518",' },
    ],
  },
  {
    id: "9b02c41",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u25cb   ",
    sharpLanes: "\u25cb   ",
    laneClass: "tui-commit__lane--0",
    roundedCont: "\u2502   ",
    sharpCont: "\u2502   ",
    subject: "fix(git): redact credentials from stderr and remote urls",
    author: "Alan Turing <alan@example.com>",
    date: "14 Sep 11:26",
    filesCount: 2,
    refBadge: "",
    refType: "",
    parents: "3d88e10",
    stats: "2 files changed +47 -3",
    diffFile: "M src/domain/git/git.redact.ts",
    diffAdd: "+47",
    diffDel: "-3",
    diffHunk: "@@ -8,4 +8,11 @@ export function redactGitText(input: string): string",
    diffLines: [
      { no: "8", sign: "-", type: "del", code: "  return input;" },
      {
        no: "8",
        sign: "+",
        type: "add",
        code: '  return input.replace(/(https?:\\/\\/[^:\\/\\s]+:)[^@\\s]+(@)/gi, "$1<redacted>$2");',
      },
      { no: "9", sign: " ", type: "ctx", code: "}" },
    ],
  },
  {
    id: "3d88e10",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u25cb   ",
    sharpLanes: "\u25cb   ",
    laneClass: "tui-commit__lane--3",
    roundedCont: "\u2502   ",
    sharpCont: "\u2502   ",
    subject: "feat(branches): inspect unmerged risk before branch delete",
    author: "Grace Hopper <grace@example.com>",
    date: "13 Sep 22:15",
    filesCount: 3,
    refBadge: "",
    refType: "",
    parents: "c0291ab",
    stats: "3 files changed +92 -7",
    diffFile: "M src/features/branches/deleteBranch.risk.ts",
    diffAdd: "+68",
    diffDel: "-4",
    diffHunk: "@@ -15,5 +15,12 @@ export function evaluateBranchDeleteRisk(branch: BranchInfo)",
    diffLines: [
      { no: "15", sign: " ", type: "ctx", code: "  if (branch.unmergedCommitCount > 0) {" },
      {
        no: "16",
        sign: "+",
        type: "add",
        code: '    return { severity: "high", reason: "unmerged commits will be unreachable" };',
      },
      { no: "17", sign: " ", type: "ctx", code: "  }" },
    ],
  },
  {
    id: "c0291ab",
    isWorkingTree: false,
    isMerge: false,
    roundedLanes: "\u2575   ",
    sharpLanes: "\u2502   ",
    laneClass: "tui-commit__lane--0",
    roundedCont: "    ",
    sharpCont: "    ",
    subject: "chore(release): bootstrap @im4all/gitminal v1.0.0",
    author: "Md Habibullah Al Hadi",
    date: "12 Sep 09:00",
    filesCount: 12,
    refBadge: "v1.0.0",
    refType: "tag",
    parents: "root",
    stats: "12 files changed +640 -0",
    diffFile: "A package.json",
    diffAdd: "+86",
    diffDel: "-0",
    diffHunk: "@@ -0,0 +1,10 @@",
    diffLines: [
      { no: "1", sign: "+", type: "add", code: "{" },
      { no: "2", sign: "+", type: "add", code: '  "name": "@im4all/gitminal",' },
      { no: "3", sign: "+", type: "add", code: '  "version": "1.3.0",' },
      {
        no: "4",
        sign: "+",
        type: "add",
        code: '  "description": "A keyboard-first terminal git client."',
      },
      { no: "5", sign: "+", type: "add", code: "}" },
    ],
  },
]);

/**
 * Complete default keybinding catalogue mirrored from
 * `src/domain/keymap/keymap.defaults.ts`, in catalogue order.
 */
const KEYBINDINGS = Object.freeze([
  { action: "Quit", id: "app.quit", scope: "global", keys: ["q"] },
  { action: "Help", id: "app.help", scope: "global", keys: ["?", "f1"] },
  {
    action: "Command palette",
    id: "app.palette",
    scope: "global",
    keys: ["ctrl+p", "mod+p", "f2"],
  },
  { action: "Toggle console", id: "app.console", scope: "global", keys: ["ctrl+`", "mod+`"] },
  { action: "Refresh", id: "app.refresh", scope: "global", keys: ["r"] },
  { action: "Reload configuration", id: "app.reloadConfig", scope: "global", keys: [] },
  { action: "Theme picker", id: "app.themePicker", scope: "global", keys: ["t"] },
  { action: "Pull", id: "remote.pull", scope: "global", keys: ["p"] },
  { action: "Push", id: "remote.push", scope: "global", keys: ["P"] },
  { action: "Force push safely", id: "remote.pushForceSafe", scope: "global", keys: [] },
  {
    action: "Force push and overwrite",
    id: "remote.pushForceOverwrite",
    scope: "global",
    keys: [],
  },
  { action: "Push without hooks", id: "remote.pushNoVerify", scope: "global", keys: [] },
  { action: "Fetch", id: "remote.fetch", scope: "global", keys: ["f"] },
  { action: "Fetch and prune", id: "remote.fetchPrune", scope: "global", keys: ["F"] },
  { action: "More remote actions", id: "remote.more", scope: "global", keys: ["."] },
  { action: "Focus commit composer", id: "commit.focus", scope: "global", keys: ["c"] },
  { action: "Next region", id: "focus.next", scope: "global", keys: ["tab"] },
  { action: "Previous region", id: "focus.previous", scope: "global", keys: ["shift+tab"] },
  { action: "Close or cancel", id: "overlay.close", scope: "global", keys: ["esc"] },
  { action: "Focus top bar", id: "focus.region.topBar", scope: "global", keys: [] },
  { action: "Focus branches", id: "focus.region.branches", scope: "global", keys: ["1"] },
  { action: "Focus remotes", id: "focus.region.remotes", scope: "global", keys: ["2"] },
  { action: "Focus tags", id: "focus.region.tags", scope: "global", keys: ["3"] },
  { action: "Focus stashes", id: "focus.region.stashes", scope: "global", keys: ["4"] },
  { action: "Focus worktrees", id: "focus.region.worktrees", scope: "global", keys: ["5"] },
  { action: "Focus commit graph", id: "focus.region.graph", scope: "global", keys: ["6"] },
  { action: "Focus right pane", id: "focus.region.rightPane", scope: "global", keys: ["7"] },
  { action: "Focus diffs", id: "focus.region.diff", scope: "global", keys: ["8"] },
  { action: "Focus console", id: "focus.region.console", scope: "global", keys: ["9"] },
  { action: "Move up", id: "nav.up", scope: "navigation", keys: ["up", "k"] },
  { action: "Move down", id: "nav.down", scope: "navigation", keys: ["down", "j"] },
  { action: "Page up", id: "nav.pageUp", scope: "navigation", keys: ["pageup"] },
  { action: "Page down", id: "nav.pageDown", scope: "navigation", keys: ["pagedown"] },
  { action: "Move to first", id: "nav.first", scope: "navigation", keys: ["g"] },
  { action: "Move to last", id: "nav.last", scope: "navigation", keys: ["G"] },
  { action: "Activate", id: "nav.activate", scope: "navigation", keys: ["enter"] },
  { action: "Move left", id: "nav.left", scope: "navigation", keys: ["left", "h"] },
  { action: "Move right", id: "nav.right", scope: "navigation", keys: ["right", "l"] },
  { action: "Expand", id: "nav.expand", scope: "navigation", keys: ["right", "l"] },
  { action: "Collapse", id: "nav.collapse", scope: "navigation", keys: ["left", "h"] },
  { action: "Search list", id: "list.filter", scope: "navigation", keys: ["/"] },
  {
    action: "Search commits",
    id: "graph.search",
    scope: "navigation",
    keys: ["/", "ctrl+f", "mod+f"],
  },
  { action: "Load older commits", id: "graph.loadOlder", scope: "navigation", keys: ["L"] },
  { action: "Search", id: "overlay.search", scope: "overlay", keys: ["/"] },
  { action: "Previous tab", id: "theme.tabLeft", scope: "overlay", keys: ["["] },
  { action: "Next tab", id: "theme.tabRight", scope: "overlay", keys: ["]"] },
  { action: "Export theme", id: "theme.export", scope: "overlay", keys: ["e"] },
  { action: "New branch", id: "branch.create", scope: "panels", keys: ["n"] },
  { action: "Delete branch", id: "branch.delete", scope: "panels", keys: ["d"] },
  { action: "Create local branch", id: "remote.createLocal", scope: "panels", keys: ["space"] },
  { action: "New tag", id: "tag.create", scope: "panels", keys: ["n"] },
  { action: "Push tag", id: "tag.push", scope: "panels", keys: ["P"] },
  { action: "Delete tag", id: "tag.delete", scope: "panels", keys: ["d"] },
  { action: "Stash changes", id: "stash.create", scope: "panels", keys: ["s"] },
  { action: "Apply stash", id: "stash.apply", scope: "panels", keys: ["a"] },
  { action: "Pop stash", id: "stash.pop", scope: "panels", keys: ["p"] },
  { action: "Delete stash", id: "stash.delete", scope: "panels", keys: ["d"] },
  { action: "New worktree", id: "worktree.create", scope: "panels", keys: ["n"] },
  { action: "Delete worktree", id: "worktree.delete", scope: "panels", keys: ["d"] },
  { action: "Commit", id: "commit.submit", scope: "composer", keys: ["ctrl+s", "mod+s"] },
  { action: "Commit without hooks", id: "commit.submitNoVerify", scope: "composer", keys: [] },
  { action: "Amend commit", id: "commit.amend", scope: "composer", keys: [] },
  { action: "Amend without hooks", id: "commit.amendNoVerify", scope: "composer", keys: [] },
  { action: "Commit options", id: "commit.options", scope: "composer", keys: [".", "alt+."] },
  {
    action: "Submit form",
    id: "form.submit",
    scope: "composer",
    keys: ["ctrl+enter", "mod+enter"],
  },
  { action: "Toggle", id: "diff.toggle", scope: "diff", keys: ["enter"] },
  { action: "Stage", id: "diff.stage", scope: "diff", keys: ["s"] },
  { action: "Unstage", id: "diff.unstage", scope: "diff", keys: ["u"] },
  { action: "Discard", id: "diff.discard", scope: "diff", keys: ["d"] },
  { action: "Delete untracked file", id: "diff.deleteUntracked", scope: "diff", keys: [] },
  { action: "Stage all", id: "diff.stageAll", scope: "diff", keys: ["S"] },
  { action: "Stage all unstaged", id: "diff.stageAllUnstaged", scope: "global", keys: ["A"] },
  { action: "Unstage all", id: "diff.unstageAll", scope: "diff", keys: ["U"] },
  { action: "Discard all", id: "diff.discardAll", scope: "diff", keys: ["D"] },
  { action: "Delete all untracked files", id: "diff.deleteAllUntracked", scope: "diff", keys: [] },
  { action: "Scroll down", id: "diff.scrollDown", scope: "diff", keys: ["J"] },
  { action: "Scroll up", id: "diff.scrollUp", scope: "diff", keys: ["K"] },
  { action: "Scroll down 5 lines", id: "diff.scrollFastDown", scope: "diff", keys: ["shift+down"] },
  { action: "Scroll up 5 lines", id: "diff.scrollFastUp", scope: "diff", keys: ["shift+up"] },
  { action: "Scroll left", id: "diff.scrollLeft", scope: "diff", keys: ["H", "shift+left"] },
  { action: "Scroll right", id: "diff.scrollRight", scope: "diff", keys: ["L", "shift+right"] },
  { action: "Clear console", id: "console.clear", scope: "diff", keys: ["c"] },
]);

/**
 * Configuration & environment snippets for the Reference section.
 */
const CONFIG_SNIPPETS = Object.freeze({
  config: {
    path: "$GITMINAL_CONFIG -> $XDG_CONFIG_HOME/gitminal/config.json -> ~/.config/gitminal/config.json",
    code: `{
  "version": 1,
  "git": { "path": "git" },
  "theme": "catppuccin-mocha",
  "ui": { "mouse": true },
  "graph": {
    "scope": "all",
    "initialPageSize": 500,
    "style": "rounded"
  },
  "diff": {
    "contextLines": 3,
    "expandFirstWorkingFile": true
  },
  "stash": { "includeUntrackedByDefault": true },
  "remote": { "fetchScope": "local" }
}`,
    notes:
      "Every key is optional. Invalid fields keep their previous effective value and emit a non-fatal warning. theme accepts a built-in name, the name of one of your own theme files, or 'terminal' for Native Terminal. Set graph.style to 'sharp' if your terminal font lacks rounded arc glyphs.",
  },
  keybindings: {
    path: "$GITMINAL_KEYBINDINGS -> ~/.config/gitminal/keybindings.json",
    code: `{
  "app.palette": ["f2", "ctrl+space"],
  "nav.up": ["up", "k", "ctrl+k"],
  "diff.discard": null,
  "remote.pushForceOverwrite": []
}`,
    notes:
      "A string or array replaces the built-in binding, null restores the default, and [] unbinds the action. Theme picker actions (theme.tabLeft, theme.tabRight, theme.export) are overlay-scoped and rebindable like any other action. Reload config from the Command Palette (Ctrl+P) without restarting.",
  },
  "theme-file": {
    path: "<config dir>/themes/hadi-ink.json (or $GITMINAL_THEMES_DIR)",
    code: `{
  "version": 1,
  "name": "hadi-ink",
  "label": "Hadi Ink",
  "variant": "dark",
  "extends": "flexoki-ink",
  "colors": {
    "accent": "#7fb3d5",
    "background": "#101216",
    "graph": ["#7fb3d5", "#a6e3a1", "#f9e2af", "#f38ba8"]
  }
}`,
    notes:
      "Every *.json file in this directory becomes a theme you can select by name. A theme that extends a built-in inherits every token it omits; a standalone theme must define all 24 tokens plus a graph list. Use Export in the theme picker to write a complete file to start from. A broken file degrades to one warning and never blocks launch.",
  },
  "truecolor-unix": {
    path: "~/.zshrc or ~/.bashrc (macOS, Linux, and WSL)",
    code: `# Launch once with 24-bit truecolor enabled:
env -u NO_COLOR COLORTERM=truecolor gitminal

# Or persist in ~/.zshrc or ~/.bashrc:
unset NO_COLOR
export COLORTERM=truecolor`,
    notes:
      "A non-empty NO_COLOR disables colors. Setting COLORTERM=truecolor enables full 24-bit palettes in WSL and Unix shells.",
  },
  "truecolor-ps": {
    path: "$PROFILE (Windows Terminal PowerShell)",
    code: `Remove-Item Env:NO_COLOR -ErrorAction SilentlyContinue
$env:COLORTERM = 'truecolor'
gitminal`,
    notes:
      "Gitminal inspects NO_COLOR, COLORTERM, and TERM directly. Add the first two lines to your PowerShell $PROFILE to persist across sessions.",
  },
});

/**
 * Simulated remote command specs.
 */
const REMOTE_SPECS = Object.freeze({
  pull: { cmd: "git pull --ff-only --progress", label: "Pulling origin/main..." },
  push: { cmd: "git push --progress origin HEAD", label: "Pushing to origin/main..." },
  fetch: { cmd: "git fetch --prune --progress origin", label: "Fetching origin..." },
});

/**
 * Mutable UI state for the interactive page.
 */
const state = {
  installTab: "bun",
  graphStyle: "rounded",
  simTheme: DEFAULT_SIM_THEME,
  themePickerOpen: false,
  themePickerTab: "dark",
  themePickerQuery: "",
  themePickerCursor: 0,
  themePickerFooterFocus: null,
  themePickerOriginalTheme: DEFAULT_SIM_THEME,
  consoleOpen: true,
  activeRegion: "6",
  selectedCommitIndex: 1,
  graphFilter: "",
  sidebarSelection: {
    branches: 0,
    remotes: 0,
    tags: 0,
    stashes: 0,
    worktrees: 0,
  },
  keymapScope: "all",
  keymapQuery: "",
  configTab: "config",
  paletteOpen: false,
  paletteQuery: "",
  paletteCursor: 0,
  consoleLogs: [
    { cmd: "git status --porcelain=v2 --branch --untracked-files=all", dur: "9ms" },
    { cmd: "git log --graph --max-count=500 --format=<gitminal-log-v1>", dur: "18ms" },
    { cmd: "git for-each-ref refs/heads refs/remotes refs/tags", dur: "7ms" },
    { cmd: "git worktree list --porcelain", dur: "4ms" },
  ],
};

/**
 * Sets textContent on an element looked up by ID.
 *
 * @param {string} id - DOM element ID.
 * @param {string} text - Text value to assign.
 */
function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

/**
 * Sets innerHTML on an element looked up by ID.
 *
 * @param {string} id - DOM element ID.
 * @param {string} html - HTML markup string.
 */
function setHtmlById(id, html) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = html;
  }
}

/**
 * Copies text to the clipboard and runs a completion callback.
 *
 * @param {string} text - Text to copy.
 * @param {() => void} onDone - Callback invoked after copy succeeds.
 */
function copyToClipboard(text, onDone) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onDone).catch(onDone);
    return;
  }
  onDone();
}

/**
 * Escapes HTML special characters for safe DOM insertion.
 *
 * @param {string} value - Raw text string.
 * @returns {string} Escaped HTML string.
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Appends a simulated Git command entry to the Console drawer.
 *
 * @param {string} cmd - The serialized argv command string.
 * @param {string} dur - Execution duration label.
 */
function appendConsoleLog(cmd, dur) {
  state.consoleLogs.unshift({ cmd, dur });
  if (state.consoleLogs.length > 18) {
    state.consoleLogs.pop();
  }
  renderConsoleLogs();
}

/**
 * Renders the simulated Console drawer entries.
 */
function renderConsoleLogs() {
  if (state.consoleLogs.length === 0) {
    setHtmlById(
      "sim-console-list",
      '<div class="tui-console__entry"><span class="tui-console__dur">Console cleared. No commands in buffer.</span></div>',
    );
    return;
  }

  const html = state.consoleLogs
    .map(
      (entry) => `
      <div class="tui-console__entry">
        <span class="tui-console__cmd"><span class="tui-console__status">\u2713 0</span>$ ${escapeHtml(entry.cmd)}</span>
        <span class="tui-console__dur">${escapeHtml(entry.dur)}</span>
      </div>`,
    )
    .join("");
  setHtmlById("sim-console-list", html);
}

/**
 * Selects the leading row marker character for a sidebar item.
 *
 * @param {{ current?: boolean }} item - Sidebar item.
 * @param {boolean} isSelected - Whether the row is selected.
 * @returns {string} Marker HTML string.
 */
function getSidebarMarker(item, isSelected) {
  if (item.current) {
    return "*";
  }
  return isSelected ? "&gt;" : " ";
}

/**
 * Formats one sidebar row HTML snippet.
 *
 * @param {{ name: string, current?: boolean, badge?: string, meta: string }} item - Row item.
 * @param {number} idx - Row index.
 * @param {number} selectedIdx - Active cursor index.
 * @param {string} panelKey - Sidebar panel key.
 * @param {string} regionId - Region number string.
 * @returns {string} HTML string for the row.
 */
function formatSidebarRow(item, idx, selectedIdx, panelKey, regionId) {
  const isSelected = idx === selectedIdx;
  const marker = getSidebarMarker(item, isSelected);
  const badgeHtml = item.badge
    ? `<span class="tui-row__badge">${escapeHtml(item.badge)}</span>`
    : "";

  return `
    <div
      class="tui-row"
      data-selected="${isSelected}"
      data-sidebar-panel="${panelKey}"
      data-sidebar-index="${idx}"
      data-sidebar-region="${regionId}"
    >
      <span class="tui-row__left">
        <span class="tui-row__marker">${marker}</span>
        <span>${escapeHtml(item.name)}</span>
        ${badgeHtml}
      </span>
      <span class="tui-row__meta">${escapeHtml(item.meta)}</span>
    </div>`;
}

/**
 * Renders one sidebar list inside the interactive TUI workbench.
 *
 * @param {string} containerId - DOM element ID.
 * @param {readonly { name: string, current?: boolean, badge?: string, meta: string }[]} items - Row items.
 * @param {number} selectedIdx - Currently selected index.
 * @param {string} panelKey - State key for selection.
 * @param {string} regionId - Region number string ("1".."5").
 */
function renderSidebarList(containerId, items, selectedIdx, panelKey, regionId) {
  const html = items
    .map((item, idx) => formatSidebarRow(item, idx, selectedIdx, panelKey, regionId))
    .join("");
  setHtmlById(containerId, html);
}

/**
 * Renders all five sidebar panels in the TUI simulator.
 */
function renderAllSidebarPanels() {
  const sel = state.sidebarSelection;
  renderSidebarList("sim-branches-list", SIDEBAR_DATA.branches, sel.branches, "branches", "1");
  renderSidebarList("sim-remotes-list", SIDEBAR_DATA.remotes, sel.remotes, "remotes", "2");
  renderSidebarList("sim-tags-list", SIDEBAR_DATA.tags, sel.tags, "tags", "3");
  renderSidebarList("sim-stashes-list", SIDEBAR_DATA.stashes, sel.stashes, "stashes", "4");
  renderSidebarList("sim-worktrees-list", SIDEBAR_DATA.worktrees, sel.worktrees, "worktrees", "5");
}

/**
 * Checks whether a commit matches a lowercase search query.
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Commit entry.
 * @param {string} query - Lowercase search string.
 * @returns {boolean} True when the commit matches.
 */
function matchesCommitQuery(commit, query) {
  const haystack =
    `${commit.subject} ${commit.author} ${commit.id} ${commit.refBadge}`.toLowerCase();
  return haystack.includes(query);
}

/**
 * Returns the filtered list of commits for the center Commit Graph.
 *
 * @returns {readonly typeof GRAPH_COMMITS[number][]} Filtered commit list.
 */
function getFilteredCommits() {
  const query = state.graphFilter.trim().toLowerCase();
  return query ? GRAPH_COMMITS.filter((c) => matchesCommitQuery(c, query)) : GRAPH_COMMITS;
}

/**
 * Formats the ref badge HTML for a commit row.
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Commit entry.
 * @returns {string} HTML string for the ref badge.
 */
function formatCommitRefBadge(commit) {
  if (!commit.refBadge) {
    return "";
  }
  const mod = commit.refType === "tag" ? " tui-commit__ref--tag" : "";
  return `<span class="tui-commit__ref${mod}">[${escapeHtml(commit.refBadge)}]</span>`;
}

/**
 * Resolves the top and bottom lane strings for a commit row.
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Commit object.
 * @param {boolean} isSharp - True when sharp graph style is active.
 * @returns {{ top: string, bot: string }} Lane strings.
 */
function getCommitLanes(commit, isSharp) {
  return {
    top: isSharp ? commit.sharpLanes : commit.roundedLanes,
    bot: isSharp ? commit.sharpCont : commit.roundedCont,
  };
}

/**
 * Formats one commit row HTML block for the center Commit Graph.
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Commit object.
 * @param {number} idx - Row index.
 * @param {boolean} isSharp - True when sharp graph style is active.
 * @returns {string} HTML markup for the commit row.
 */
function formatCommitRow(commit, idx, isSharp) {
  const isSelected = idx === state.selectedCommitIndex;
  const lanes = getCommitLanes(commit, isSharp);
  const subjMod = commit.isWorkingTree ? " tui-commit__subject--pending" : "";

  return `
    <div
      class="tui-commit"
      role="option"
      tabindex="-1"
      aria-selected="${isSelected}"
      data-commit-index="${idx}"
    >
      <div class="tui-commit__line">
        <div class="tui-commit__left">
          <span class="tui-commit__lanes ${commit.laneClass}">${escapeHtml(lanes.top)}</span>
          <span class="tui-commit__subject${subjMod}">${escapeHtml(commit.subject)}</span>
        </div>
        <span class="tui-commit__files-count">${commit.filesCount}</span>
      </div>
      <div class="tui-commit__line">
        <div class="tui-commit__left">
          <span class="tui-commit__lanes ${commit.laneClass}">${escapeHtml(lanes.bot)}</span>
          ${formatCommitRefBadge(commit)}
          <span class="tui-commit__author">${escapeHtml(commit.author)}</span>
        </div>
        <span class="tui-commit__date">${escapeHtml(commit.date)}</span>
      </div>
    </div>`;
}

/**
 * Updates the graph style labels across the page.
 *
 * @param {boolean} isSharp - True when sharp style is active.
 */
function updateGraphStyleLabels(isSharp) {
  const footerDesc = isSharp
    ? "sharp (\u250c \u2510 \u2514 \u2518 \u25cb +)"
    : "rounded (\u256d \u256e \u2570 \u256f \u25cb \u25ce)";
  setTextById("tui-graph-footer-style", footerDesc);
  setTextById("graph-style-label", state.graphStyle);
  setTextById("footer-graph-style", state.graphStyle);
}

/**
 * Renders the center Commit Graph list with rounded or sharp box-drawing lanes.
 */
function renderCommitGraph() {
  const isSharp = state.graphStyle === "sharp";
  updateGraphStyleLabels(isSharp);

  const commits = getFilteredCommits();
  if (commits.length === 0) {
    setHtmlById(
      "sim-graph-list",
      '<div class="tui-commit"><span class="tui-commit__author">No commits match search query.</span></div>',
    );
    return;
  }

  state.selectedCommitIndex = Math.min(state.selectedCommitIndex, commits.length - 1);
  const html = commits.map((commit, idx) => formatCommitRow(commit, idx, isSharp)).join("");
  setHtmlById("sim-graph-list", html);
}

/**
 * Renders the top-right Commit Composer or Commit Details pane ([7]).
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Selected commit entry.
 */
function renderDetailsOrComposerPane(commit) {
  if (commit.isWorkingTree) {
    setTextById("sim-details-title", "Commit Composer (Working Tree)");
    setHtmlById(
      "sim-details-body",
      `<div class="tui-composer">
        <div class="tui-composer__identity">Author: Md Habibullah Al Hadi &lt;hadi@gitminal.dev&gt;</div>
        <input
          type="text"
          class="tui-composer__input"
          id="sim-composer-input"
          value="feat(git): enforce sanitized argv execution"
          aria-label="Simulated commit message"
        />
        <div class="tui-composer__actions">
          <span class="tui-details__stats">${escapeHtml(commit.stats)}</span>
          <button type="button" class="tui-composer__btn" id="sim-commit-submit-btn">
            [Ctrl+S] Commit Staged
          </button>
        </div>
      </div>`,
    );
    bindComposerSubmit();
    return;
  }

  setTextById("sim-details-title", `Commit ${commit.id}`);
  setHtmlById(
    "sim-details-body",
    `<div class="tui-details__row">
      <span class="tui-details__label">Commit</span>
      <span class="tui-details__oid">${escapeHtml(commit.id)}</span>
      <span class="tui-details__stats">${escapeHtml(commit.stats)}</span>
    </div>
    <div class="tui-details__row">
      <span class="tui-details__label">Parents</span>
      <span>${escapeHtml(commit.parents)}</span>
    </div>
    <div class="tui-details__row">
      <span class="tui-details__label">Author</span>
      <span>${escapeHtml(commit.author)} (${escapeHtml(commit.date)})</span>
    </div>
    <div class="tui-details__msg">${escapeHtml(commit.subject)}</div>`,
  );
}

/**
 * Maps a diff line type to its BEM modifier class.
 *
 * @param {string} lineType - "add", "del", or "ctx".
 * @returns {string} CSS class name.
 */
function getDiffLineClass(lineType) {
  if (lineType === "add") {
    return "tui-diff__line tui-diff__line--add";
  }
  if (lineType === "del") {
    return "tui-diff__line tui-diff__line--del";
  }
  return "tui-diff__line";
}

/**
 * Renders the bottom-right Unified Diff pane ([8]).
 *
 * @param {typeof GRAPH_COMMITS[number]} commit - Selected commit entry.
 */
function renderDiffPane(commit) {
  const title = commit.isWorkingTree
    ? "Working Tree & Staged Diff"
    : `Commit ${commit.id} Unified Diff`;
  setTextById("sim-diff-title", title);

  const linesHtml = commit.diffLines
    .map(
      (line) => `
      <div class="${getDiffLineClass(line.type)}">
        <span class="tui-diff__lineno">${escapeHtml(line.no)}</span>
        <span class="tui-diff__sign">${escapeHtml(line.sign)}</span>
        <span class="tui-diff__code">${escapeHtml(line.code)}</span>
      </div>`,
    )
    .join("");

  setHtmlById(
    "sim-diff-body",
    `<div class="tui-diff__file-header">
      <span>\u25bc ${escapeHtml(commit.diffFile)}</span>
      <span>
        <span class="tui-diff__file-stat-add">${escapeHtml(commit.diffAdd)}</span>
        <span class="tui-diff__file-stat-del">${escapeHtml(commit.diffDel)}</span>
      </span>
    </div>
    <div class="tui-diff__hunk">${escapeHtml(commit.diffHunk)}</div>
    ${linesHtml}`,
  );
}

/**
 * Renders the right-hand Commit Details / Commit Composer ([7]) and Diff Viewer ([8]).
 */
function renderInspectorPanes() {
  const commits = getFilteredCommits();
  const commit = commits[state.selectedCommitIndex] ?? GRAPH_COMMITS[0];
  if (!commit) {
    return;
  }
  renderDetailsOrComposerPane(commit);
  renderDiffPane(commit);
}

/**
 * Binds the simulated Commit Composer submit button when the Working Tree row is active.
 */
function bindComposerSubmit() {
  const btn = document.getElementById("sim-commit-submit-btn");
  btn?.addEventListener("click", () => {
    const input = document.getElementById("sim-composer-input");
    const raw = input instanceof HTMLInputElement ? input.value.trim() : "";
    const msg = raw || "feat: update repository state";
    appendConsoleLog(`git commit -m "${msg}"`, "24ms");
    setTextById("tui-status-message", "\u2713 committed to main");
  });
}

/**
 * Updates the focused region border and title indicator inside the TUI simulator.
 *
 * @param {string} regionId - Region identifier ("1".."9").
 */
function setFocusedRegion(regionId) {
  state.activeRegion = regionId;
  let activeName = `[${regionId}] Region`;

  for (const panel of document.querySelectorAll("[data-region-id]")) {
    const isMatch = panel.getAttribute("data-region-id") === regionId;
    panel.classList.toggle("tui-panel--focused", isMatch);
    if (isMatch) {
      activeName = panel.getAttribute("data-region-name") || activeName;
    }
  }
  setTextById("tui-active-region-label", activeName);
}

/**
 * Toggles the graph box-drawing style between "rounded" and "sharp".
 */
function toggleGraphStyle() {
  state.graphStyle = state.graphStyle === "rounded" ? "sharp" : "rounded";
  renderCommitGraph();
  appendConsoleLog(`config.set graph.style="${state.graphStyle}"`, "1ms");
}

/**
 * Applies a simulator palette and refreshes every control that shows the active theme.
 *
 * @param {string} themeName - A key in SIM_THEMES; an unknown name falls back to the default.
 */
/**
 * Paints a simulator element with every token of a palette.
 *
 * @param {HTMLElement} simulator - Simulator root element.
 * @param {{ lanes: ReadonlyArray<string> }} spec - Palette supplying the tokens.
 * @param {string} name - Theme name written to `data-sim-theme`.
 */
function applySimulatorPalette(simulator, spec, name) {
  for (const [field, cssVar] of Object.entries(SIM_THEME_CSS_VARS)) {
    simulator.style.setProperty(cssVar, spec[field]);
  }

  SIM_LANE_CSS_VARS.forEach((cssVar, index) => {
    simulator.style.setProperty(cssVar, spec.lanes[index] || spec.lanes[0]);
  });

  simulator.setAttribute("data-sim-theme", name);
}

/**
 * Marks the swatch pill that matches the active theme.
 *
 * @param {string} name - Active theme name.
 */
function syncThemePills(name) {
  for (const pill of document.querySelectorAll("[data-theme-pick]")) {
    pill.classList.toggle("swatch-pill--active", pill.getAttribute("data-theme-pick") === name);
  }
}

/**
 * Applies a simulator palette and refreshes every control that shows the active theme.
 *
 * @param {string} themeName - A key in SIM_THEMES; an unknown name falls back to the default.
 */
function setSimulatorTheme(themeName) {
  const name = Object.hasOwn(SIM_THEMES, themeName) ? themeName : DEFAULT_SIM_THEME;
  state.simTheme = name;

  const simulator = document.getElementById("tui-simulator");
  if (simulator instanceof HTMLElement) {
    applySimulatorPalette(simulator, SIM_THEMES[name], name);
  }

  setTextById("sim-theme-label", name);
  syncThemePills(name);
  renderThemePicker();
}

/** Footer controls the theme picker cycles through with Left and Right. */
const THEME_PICKER_ACTIONS = Object.freeze(["export", "cancel", "apply"]);

/** Variant tabs in bar order. */
const THEME_PICKER_TABS = Object.freeze(["dark", "light"]);

/** Display labels of the variant tabs. */
const THEME_PICKER_TAB_LABELS = Object.freeze({ dark: "Dark", light: "Light" });

/** Status line the theme picker footer shows when nothing else happened. */
const THEME_PICKER_STATUS = "40 built-in themes, plus Native Terminal and your own theme files";

/**
 * Lists the selectable themes in the active tab, filtered by the current query.
 *
 * Preview-only entries such as the NO_COLOR palette are excluded because they are
 * outcomes of terminal capability, not names accepted by `config.json`.
 *
 * @returns {Array<{ name: string, label: string }>} Theme rows sorted by theme name.
 */
function getThemePickerThemes() {
  const query = state.themePickerQuery.trim().toLowerCase();

  return Object.entries(SIM_THEMES)
    .filter(([, spec]) => !spec.previewOnly && spec.variant === state.themePickerTab)
    .filter(([name, spec]) => !query || `${name} ${spec.label}`.toLowerCase().includes(query))
    .map(([name, spec]) => ({ name, label: spec.label }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Reads the theme row the picker currently highlights.
 *
 * @returns {string} Highlighted theme name, or the active theme when the tab is empty.
 */
function getHighlightedThemeName() {
  return getThemePickerThemes()[state.themePickerCursor]?.name || state.simTheme;
}

/**
 * Resolves the display label of a variant tab.
 *
 * @param {string} variant - "dark" or "light".
 * @returns {string} Tab label.
 */
function getThemePickerTabLabel(variant) {
  return THEME_PICKER_TAB_LABELS[variant] || "Dark";
}

/**
 * Applies the selected state and label of one variant tab.
 *
 * @param {Element} tab - Tab button.
 * @param {string} variant - "dark" or "light".
 */
function applyThemePickerTabState(tab, variant) {
  const selected = variant === state.themePickerTab;

  tab.textContent = `${selected ? "> " : "  "}${getThemePickerTabLabel(variant)}`;
  tab.classList.toggle("theme-picker__tab--active", selected);
  tab.setAttribute("aria-selected", String(selected));
}

/**
 * Renders the variant tab bar, keeping the selected tab prefixed with `>`.
 */
function renderThemePickerTabs() {
  for (const tab of document.querySelectorAll("[data-theme-tab]")) {
    applyThemePickerTabState(tab, tab.getAttribute("data-theme-tab") || "dark");
  }
}

/**
 * Renders the footer actions and marks the one that owns the keyboard, if any.
 */
function renderThemePickerActions() {
  for (const button of document.querySelectorAll("[data-theme-action]")) {
    const focused = button.getAttribute("data-theme-action") === state.themePickerFooterFocus;

    button.classList.toggle("theme-picker__action--focused", focused);
    button.setAttribute("aria-pressed", String(focused));
  }
}

/**
 * Renders the theme picker tabs, rows, and footer focus.
 */
function renderThemePicker() {
  if (!state.themePickerOpen) {
    return;
  }

  renderThemePickerTabs();
  renderThemePickerActions();

  const themes = getThemePickerThemes();
  state.themePickerCursor =
    themes.length > 0 ? Math.min(state.themePickerCursor, themes.length - 1) : 0;

  if (themes.length === 0) {
    const query = escapeHtml(state.themePickerQuery.trim());
    setHtmlById(
      "theme-picker-list",
      `<div class="theme-picker__empty">No ${state.themePickerTab} themes match "${query}".</div>`,
    );
    return;
  }

  const html = themes
    .map((theme, index) => {
      const spec = SIM_THEMES[theme.name];
      const active = index === state.themePickerCursor;

      return `
        <button type="button" class="palette__item theme-picker__row" data-active="${active}" data-theme-index="${index}">
          <span class="palette__item-left">
            <span class="palette__item-marker">${active ? "&gt;" : " "}</span>
            <span class="theme-picker__swatch" style="background-color: ${spec.bg}; border-color: ${spec.border}">
              <span class="theme-picker__swatch-dot" style="background-color: ${spec.focus}"></span>
            </span>
            <span class="theme-picker__label">${escapeHtml(theme.label)}</span>
            <code class="palette__item-id">(${escapeHtml(theme.name)})</code>
          </span>
        </button>`;
    })
    .join("");

  setHtmlById("theme-picker-list", html);
}

/**
 * Scrolls the highlighted theme row into view inside the picker list.
 */
function scrollThemePickerRowIntoView() {
  document
    .querySelector(`[data-theme-index="${state.themePickerCursor}"]`)
    ?.scrollIntoView({ block: "nearest" });
}

/**
 * Shows a variant tab and highlights its first theme.
 *
 * @param {string} variant - "dark" or "light".
 */
function setThemePickerTab(variant) {
  state.themePickerTab = THEME_PICKER_TABS.includes(variant) ? variant : "dark";
  state.themePickerCursor = 0;
  setSimulatorTheme(getHighlightedThemeName());
  scrollThemePickerRowIntoView();
}

/**
 * Steps the variant tab bar by one position and wraps.
 *
 * @param {number} direction - -1 for the previous tab, 1 for the next.
 */
function stepThemePickerTab(direction) {
  const index = THEME_PICKER_TABS.indexOf(state.themePickerTab);
  const next = (index + direction + THEME_PICKER_TABS.length) % THEME_PICKER_TABS.length;

  setThemePickerTab(THEME_PICKER_TABS[next] || "dark");
}

/**
 * Moves the highlight by delta, wrapping, and previews the newly highlighted theme.
 *
 * @param {number} delta - Step offset (+1 or -1).
 */
function moveThemePickerCursor(delta) {
  const themes = getThemePickerThemes();
  if (themes.length === 0) {
    return;
  }

  state.themePickerCursor = (state.themePickerCursor + delta + themes.length) % themes.length;
  setSimulatorTheme(getHighlightedThemeName());
  scrollThemePickerRowIntoView();
}

/**
 * Moves the keyboard to the footer actions and steps through them with wraparound.
 *
 * @param {number} direction - -1 for left, 1 for right.
 */
function moveThemePickerFooter(direction) {
  const index = THEME_PICKER_ACTIONS.indexOf(state.themePickerFooterFocus);

  if (index < 0) {
    state.themePickerFooterFocus =
      direction > 0
        ? THEME_PICKER_ACTIONS[0]
        : THEME_PICKER_ACTIONS[THEME_PICKER_ACTIONS.length - 1];
  } else {
    const next = (index + direction + THEME_PICKER_ACTIONS.length) % THEME_PICKER_ACTIONS.length;
    state.themePickerFooterFocus = THEME_PICKER_ACTIONS[next];
  }

  renderThemePickerActions();
}

/**
 * Writes the highlighted theme to a user theme file and reports it in the footer.
 */
function exportHighlightedTheme() {
  const name = getHighlightedThemeName();
  const fileBase = name === "terminal" ? "native-terminal" : `${name}-custom`;
  const fileName = `${fileBase}.json`;

  setTextById("theme-picker-status", `Theme exported: ${fileName}`);
  appendConsoleLog(`theme.export "${name}" -> themes/${fileName}`, "3ms");
}

/**
 * Runs one theme picker footer action.
 *
 * @param {string|null} action - "export", "cancel", "apply", or null for the default apply.
 */
function runThemePickerAction(action) {
  if (action === "cancel") {
    setSimulatorTheme(state.themePickerOriginalTheme);
    closeThemePicker();
    return;
  }

  if (action === "export") {
    exportHighlightedTheme();
    return;
  }

  const name = getHighlightedThemeName();
  setSimulatorTheme(name);
  setTextById("tui-status-message", `\u2713 theme applied: ${name}`);
  appendConsoleLog(`theme.resolve "${name}"`, "2ms");
  closeThemePicker();
}

/**
 * Dismisses the theme picker, restoring the theme that was active before it opened.
 */
function cancelThemePicker() {
  runThemePickerAction("cancel");
}

/**
 * Shows or hides the theme picker modal.
 *
 * @param {boolean} hidden - True to hide the modal.
 */
function setThemePickerModalHidden(hidden) {
  const modal = document.getElementById("theme-picker-modal");
  if (modal) {
    modal.hidden = hidden;
  }
}

/**
 * Resets the theme picker state for a fresh open and highlights the active theme.
 */
function resetThemePickerState() {
  state.themePickerOpen = true;
  state.themePickerOriginalTheme = state.simTheme;
  state.themePickerTab = SIM_THEMES[state.simTheme]?.variant === "light" ? "light" : "dark";
  state.themePickerQuery = "";
  state.themePickerFooterFocus = null;

  const input = document.getElementById("theme-picker-search");
  if (input instanceof HTMLInputElement) {
    input.value = "";
  }

  const activeIndex = getThemePickerThemes().findIndex((theme) => theme.name === state.simTheme);
  state.themePickerCursor = Math.max(activeIndex, 0);
}

/**
 * Opens the theme picker on the active theme's tab and highlights the active theme.
 */
function openThemePicker() {
  if (state.paletteOpen) {
    setPaletteOpen(false);
  }

  resetThemePickerState();
  setTextById("theme-picker-status", THEME_PICKER_STATUS);
  setThemePickerModalHidden(false);
  renderThemePicker();
  document.getElementById("theme-picker-list")?.focus();
}

/**
 * Closes the theme picker and clears its keyboard focus.
 */
function closeThemePicker() {
  state.themePickerOpen = false;
  state.themePickerFooterFocus = null;
  setThemePickerModalHidden(true);

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

/**
 * Theme picker key bindings in match order.
 *
 * Bindings marked `always` also fire while the search field has focus; character
 * keys stay out of the way so the visitor can type a query. Rows and the active
 * tab take the arrow keys from any zone, exactly like the terminal picker.
 */
const THEME_PICKER_KEY_BINDINGS = Object.freeze([
  { keys: ["Escape"], always: true, run: cancelThemePicker },
  { keys: ["ArrowDown"], always: true, run: () => moveThemePickerCursor(1) },
  { keys: ["ArrowUp"], always: true, run: () => moveThemePickerCursor(-1) },
  { keys: ["Enter"], always: true, run: applyFocusedThemePickerAction },
  { keys: ["j"], run: () => moveThemePickerCursor(1) },
  { keys: ["k"], run: () => moveThemePickerCursor(-1) },
  { keys: ["["], run: () => stepThemePickerTab(-1) },
  { keys: ["]"], run: () => stepThemePickerTab(1) },
  { keys: ["ArrowLeft"], always: true, run: () => moveThemePickerFooter(-1) },
  { keys: ["ArrowRight"], always: true, run: () => moveThemePickerFooter(1) },
  { keys: ["h"], run: () => moveThemePickerFooter(-1) },
  { keys: ["l"], run: () => moveThemePickerFooter(1) },
  { keys: ["e"], run: exportHighlightedTheme },
  { keys: ["/"], run: focusThemePickerSearch },
]);

/**
 * Runs the theme picker footer action that owns the keyboard, defaulting to apply.
 */
function applyFocusedThemePickerAction() {
  runThemePickerAction(state.themePickerFooterFocus || "apply");
}

/**
 * Moves keyboard focus to the theme picker search field.
 */
function focusThemePickerSearch() {
  document.getElementById("theme-picker-search")?.focus();
}

/**
 * Handles keyboard input inside the open theme picker.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 */
function handleThemePickerKeydown(event) {
  const isTyping = event.target instanceof HTMLInputElement;
  const binding = THEME_PICKER_KEY_BINDINGS.find(
    (candidate) => candidate.keys.includes(event.key) && (candidate.always || !isTyping),
  );

  if (!binding) {
    return;
  }

  event.preventDefault();
  binding.run();
}

/**
 * Toggles the visibility of the simulated Git Console drawer ([9]).
 */
function toggleConsoleDrawer() {
  state.consoleOpen = !state.consoleOpen;
  const drawer = document.getElementById("tui-console-drawer");
  if (drawer) {
    drawer.hidden = !state.consoleOpen;
  }
  setTextById("console-state-label", state.consoleOpen ? "open" : "closed");
}

/**
 * Updates the simulated frame-buffer progress bar width and text.
 *
 * @param {string} label - Progress phase text.
 * @param {number} percent - Clamped percentage (0..100).
 */
function setProgressState(label, percent) {
  const fill = document.getElementById("tui-progress-fill");
  if (fill) {
    fill.style.width = `${percent}%`;
  }
  setTextById("tui-progress-label", `${label} ${percent}%`);
}

/**
 * Simulates a guarded Git remote command with a frame-buffer progress bar animation.
 *
 * @param {string} action - One of "pull", "push", or "fetch".
 */
function runSimulatedGitRemote(action) {
  const wrap = document.getElementById("tui-progress-wrap");
  const spec = REMOTE_SPECS[action] || REMOTE_SPECS.fetch;
  if (!wrap) {
    return;
  }

  wrap.hidden = false;
  setProgressState(spec.label, 35);
  setTimeout(() => setProgressState(spec.label, 82), 180);
  setTimeout(() => {
    setProgressState(spec.label, 100);
    appendConsoleLog(spec.cmd, "142ms");
    setTextById("tui-status-message", `\u2713 ${action} complete`);
  }, 380);
  setTimeout(() => {
    wrap.hidden = true;
  }, 750);
}

/**
 * Updates the active install command tab in the Hero command deck.
 *
 * @param {string} tabKey - Key in INSTALL_COMMANDS ("bun" | "bunx" | "npm").
 */
function setInstallTab(tabKey) {
  const entry = INSTALL_COMMANDS[tabKey];
  if (!entry) {
    return;
  }
  state.installTab = tabKey;
  setTextById("install-command-text", entry.command);
  setTextById("install-command-note", entry.note);

  for (const tab of document.querySelectorAll("[data-install-tab]")) {
    const isMatch = tab.getAttribute("data-install-tab") === tabKey;
    tab.classList.toggle("installer__tab--active", isMatch);
    tab.setAttribute("aria-selected", String(isMatch));
  }
}

/**
 * Copies the currently active install command and displays confirmation feedback.
 */
function copyActiveInstallCommand() {
  const entry = INSTALL_COMMANDS[state.installTab] || INSTALL_COMMANDS.bun;
  const btn = document.getElementById("copy-install-btn");

  copyToClipboard(entry.command, () => {
    btn?.setAttribute("data-copied", "true");
    setTextById("copy-install-label", "Copied!");
    setTextById("topbar-sync-status", `[v] Copied: ${entry.command}`);

    setTimeout(() => {
      btn?.removeAttribute("data-copied");
      setTextById("copy-install-label", "Copy");
      setTextById("topbar-sync-status", "origin/main ahead 0 behind 0 [v] up to date");
    }, 1800);
  });
}

/**
 * Checks whether a keybinding entry matches the active scope and search filter.
 *
 * @param {{ action: string, id: string, scope: string, keys: readonly string[] }} item - Keymap row.
 * @param {string} query - Lowercase query string.
 * @returns {boolean} True when the row matches.
 */
function matchesKeybindingFilter(item, query) {
  const scopeOk = state.keymapScope === "all" || item.scope === state.keymapScope;
  if (!scopeOk || !query) {
    return scopeOk;
  }
  const text = `${item.action} ${item.id} ${item.keys.join(" ")}`.toLowerCase();
  return text.includes(query);
}

/**
 * Formats one row in the Keybindings reference table.
 *
 * @param {{ action: string, id: string, scope: string, keys: readonly string[] }} item - Keymap row.
 * @returns {string} HTML table row string.
 */
function formatKeymapRow(item) {
  const keysHtml =
    item.keys.length > 0
      ? item.keys.map((k) => `<kbd class="keymap-table__kbd">${escapeHtml(k)}</kbd>`).join("")
      : '<span class="keymap-table__none">palette only</span>';

  return `
    <tr class="keymap-table__tr">
      <td class="keymap-table__td keymap-table__action">${escapeHtml(item.action)}</td>
      <td class="keymap-table__td"><code class="keymap-table__id">${escapeHtml(item.id)}</code></td>
      <td class="keymap-table__td"><span class="keymap-table__scope">${escapeHtml(item.scope)}</span></td>
      <td class="keymap-table__td">${keysHtml}</td>
    </tr>`;
}

/**
 * Renders the filterable Keybindings table in the Reference section.
 */
function renderKeymapTable() {
  const query = state.keymapQuery.trim().toLowerCase();
  const filtered = KEYBINDINGS.filter((item) => matchesKeybindingFilter(item, query));
  setTextById("keymap-match-count", `Showing ${filtered.length} of ${KEYBINDINGS.length} actions`);
  setHtmlById("keymap-table-body", filtered.map(formatKeymapRow).join(""));
}

/**
 * Renders the active Configuration or Truecolor snippet tab.
 *
 * @param {string} tabKey - Key in CONFIG_SNIPPETS.
 */
function setConfigTab(tabKey) {
  const spec = CONFIG_SNIPPETS[tabKey];
  if (!spec) {
    return;
  }
  state.configTab = tabKey;
  setTextById("config-path-display", spec.path);
  setTextById("config-code-display", spec.code);
  setTextById("config-notes-display", spec.notes);

  for (const tab of document.querySelectorAll("[data-config-tab]")) {
    const active = tab.getAttribute("data-config-tab") === tabKey;
    tab.classList.toggle("config-box__tab--active", active);
    tab.setAttribute("aria-selected", String(active));
  }
}

/**
 * Scrolls smoothly to a section by DOM ID.
 *
 * @param {string} sectionId - Target element ID.
 */
function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Builds the list of executable commands for the interactive Command Palette modal.
 *
 * @returns {Array<{ label: string, id: string, key: string, run: () => void }>} Palette items.
 */
function getPaletteCommands() {
  return [
    {
      label: "Copy global install (bun add -g @im4all/gitminal)",
      id: "install.copyBunGlobal",
      key: "y",
      run: () => {
        setInstallTab("bun");
        copyActiveInstallCommand();
      },
    },
    {
      label: "Copy install command (bunx @im4all/gitminal)",
      id: "install.copyBunx",
      key: "bunx",
      run: () => {
        setInstallTab("bunx");
        copyActiveInstallCommand();
      },
    },
    {
      label: "Toggle Commit Graph Style (rounded <-> sharp)",
      id: "graph.toggleStyle",
      key: "g",
      run: toggleGraphStyle,
    },
    {
      label: "Open Theme Picker (Dark / Light tabs)",
      id: "app.themePicker",
      key: "t",
      run: openThemePicker,
    },
    {
      label: "Toggle Git Console Drawer",
      id: "app.console",
      key: "9 / ctrl+`",
      run: toggleConsoleDrawer,
    },
    {
      label: "Jump to Interactive TUI Workbench",
      id: "nav.workbench",
      key: "w",
      run: () => scrollToSection("workbench"),
    },
    {
      label: "Jump to System Architecture Matrix",
      id: "nav.matrix",
      key: "m",
      run: () => scrollToSection("matrix"),
    },
    {
      label: "Jump to Keymap & Configuration Explorer",
      id: "nav.reference",
      key: "k",
      run: () => scrollToSection("reference"),
    },
    {
      label: "Switch Workbench to Reference Screenshot",
      id: "workbench.screenshot",
      key: "image",
      run: () => {
        setWorkbenchMode("screenshot");
        scrollToSection("workbench");
      },
    },
    {
      label: "Open GitHub Repository (im4aLL/gitminal)",
      id: "ext.github",
      key: "enter",
      run: () => {
        window.open("https://github.com/im4aLL/gitminal", "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Open npm Package (@im4all/gitminal)",
      id: "ext.npm",
      key: "enter",
      run: () => {
        window.open(
          "https://www.npmjs.com/package/@im4all/gitminal",
          "_blank",
          "noopener,noreferrer",
        );
      },
    },
  ];
}

/**
 * Returns the filtered Command Palette items matching the current query.
 *
 * @returns {Array<{ label: string, id: string, key: string, run: () => void }>} Filtered commands.
 */
function getFilteredPaletteCommands() {
  const q = state.paletteQuery.trim().toLowerCase();
  const all = getPaletteCommands();
  if (!q) {
    return all;
  }
  return all.filter((item) => `${item.label} ${item.id} ${item.key}`.toLowerCase().includes(q));
}

/**
 * Renders the Command Palette modal command list.
 */
function renderPaletteList() {
  const items = getFilteredPaletteCommands();
  state.paletteCursor = items.length > 0 ? Math.min(state.paletteCursor, items.length - 1) : 0;

  const html = items
    .map((item, idx) => {
      const active = idx === state.paletteCursor;
      return `
        <button type="button" class="palette__item" data-active="${active}" data-palette-index="${idx}">
          <span class="palette__item-left">
            <span class="palette__item-marker">${active ? "&gt;" : " "}</span>
            <span>${escapeHtml(item.label)}</span>
            <code class="palette__item-id">(${escapeHtml(item.id)})</code>
          </span>
          <kbd class="palette__item-key">${escapeHtml(item.key)}</kbd>
        </button>`;
    })
    .join("");
  setHtmlById("palette-command-list", html);
}

/**
 * Resets the palette query, highlight, and search field for a fresh open.
 */
function resetPaletteState() {
  state.paletteQuery = "";
  state.paletteCursor = 0;

  const input = document.getElementById("palette-search-input");
  if (input instanceof HTMLInputElement) {
    input.value = "";
    input.focus();
  }

  renderPaletteList();
}

/**
 * Opens or closes the interactive Command Palette modal.
 *
 * @param {boolean} open - True to open, false to close.
 */
function setPaletteOpen(open) {
  state.paletteOpen = open;
  const modal = document.getElementById("palette-modal");
  if (!modal) {
    return;
  }

  modal.hidden = !open;
  if (!open) {
    return;
  }

  if (state.themePickerOpen) {
    closeThemePicker();
  }

  resetPaletteState();
}

/**
 * Updates aria-selected and active class on a button element.
 *
 * @param {string} id - Button element ID.
 * @param {string} activeClass - Active modifier class.
 * @param {boolean} isActive - Active state boolean.
 */
function setTabButtonState(id, activeClass, isActive) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.classList.toggle(activeClass, isActive);
    btn.setAttribute("aria-selected", String(isActive));
  }
}

/**
 * Switches between the interactive TUI simulator and the high-res reference screenshot.
 *
 * @param {string} mode - Either "simulator" or "screenshot".
 */
function setWorkbenchMode(mode) {
  const isSim = mode !== "screenshot";
  const simEl = document.getElementById("tui-simulator");
  const shotEl = document.getElementById("tui-screenshot-view");
  if (simEl) {
    simEl.hidden = !isSim;
  }
  if (shotEl) {
    shotEl.hidden = isSim;
  }
  setTabButtonState("mode-simulator-btn", "workbench__mode-btn--active", isSim);
  setTabButtonState("mode-screenshot-btn", "workbench__mode-btn--active", !isSim);
}

/**
 * Moves the commit graph cursor to a clamped index.
 *
 * @param {number} nextIndex - Target commit index.
 */
function selectCommitByIndex(nextIndex) {
  const commits = getFilteredCommits();
  if (commits.length === 0) {
    return;
  }
  const clamped = Math.max(0, Math.min(commits.length - 1, nextIndex));
  state.selectedCommitIndex = clamped;
  setFocusedRegion("6");
  renderCommitGraph();
  renderInspectorPanes();
  const selected = commits[clamped];
  if (selected && !selected.isWorkingTree) {
    appendConsoleLog(`git show --stat --patch ${selected.id}`, "11ms");
  }
}

/**
 * Focuses the commit graph search input.
 */
function focusGraphSearchInput() {
  const searchInput = document.getElementById("sim-graph-search");
  if (searchInput instanceof HTMLInputElement) {
    searchInput.focus();
  }
}

/**
 * Lookup table for single-key global workbench shortcuts.
 */
const SINGLE_KEY_ACTIONS = Object.freeze({
  "?": () => setPaletteOpen(true),
  F1: () => setPaletteOpen(true),
  F2: () => setPaletteOpen(true),
  1: () => setFocusedRegion("1"),
  2: () => setFocusedRegion("2"),
  3: () => setFocusedRegion("3"),
  4: () => setFocusedRegion("4"),
  5: () => setFocusedRegion("5"),
  6: () => setFocusedRegion("6"),
  7: () => setFocusedRegion("7"),
  8: () => setFocusedRegion("8"),
  9: toggleConsoleDrawer,
  j: () => selectCommitByIndex(state.selectedCommitIndex + 1),
  ArrowDown: () => selectCommitByIndex(state.selectedCommitIndex + 1),
  k: () => selectCommitByIndex(state.selectedCommitIndex - 1),
  ArrowUp: () => selectCommitByIndex(state.selectedCommitIndex - 1),
  g: toggleGraphStyle,
  G: () => selectCommitByIndex(getFilteredCommits().length - 1),
  t: openThemePicker,
  y: copyActiveInstallCommand,
  "/": focusGraphSearchInput,
});

/**
 * Checks whether the event is a Ctrl/Cmd + P or K palette toggle chord.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 * @returns {boolean} True when the chord matches.
 */
function isPaletteChord(event) {
  const lower = event.key.toLowerCase();
  return (event.ctrlKey || event.metaKey) && (lower === "p" || lower === "k");
}

/**
 * Dispatches a single-key workbench shortcut if registered.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 */
function dispatchSingleKeyShortcut(event) {
  if (handleTypingEscape(event)) {
    return;
  }
  const handler = SINGLE_KEY_ACTIONS[event.key];
  if (handler) {
    event.preventDefault();
    handler();
  }
}

/**
 * Handles global keyboard shortcuts when no text input is capturing typing.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 */
function handleGlobalKeydown(event) {
  if (isPaletteChord(event)) {
    event.preventDefault();
    setPaletteOpen(!state.paletteOpen);
    return;
  }
  if (state.themePickerOpen) {
    handleThemePickerKeydown(event);
    return;
  }
  if (state.paletteOpen) {
    handlePaletteKeydown(event);
    return;
  }
  dispatchSingleKeyShortcut(event);
}

/**
 * Checks whether an input is focused and handles Escape to blur it.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 * @returns {boolean} True when a text input is currently focused.
 */
function handleTypingEscape(event) {
  const activeEl = document.activeElement;
  const isTyping = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
  if (isTyping && event.key === "Escape") {
    activeEl.blur();
  }
  return isTyping;
}

/**
 * Moves the Command Palette selection cursor by delta.
 *
 * @param {number} delta - Step offset (+1 or -1).
 */
function movePaletteCursor(delta) {
  const items = getFilteredPaletteCommands();
  if (items.length > 0) {
    state.paletteCursor = (state.paletteCursor + delta + items.length) % items.length;
    renderPaletteList();
  }
}

/**
 * Runs the currently highlighted Command Palette item.
 */
function executeActivePaletteCommand() {
  const chosen = getFilteredPaletteCommands()[state.paletteCursor];
  if (chosen) {
    setPaletteOpen(false);
    chosen.run();
  }
}

/**
 * Lookup table for open Command Palette keyboard navigation.
 */
const PALETTE_KEY_ACTIONS = Object.freeze({
  Escape: () => setPaletteOpen(false),
  ArrowDown: () => movePaletteCursor(1),
  ArrowUp: () => movePaletteCursor(-1),
  Enter: executeActivePaletteCommand,
});

/**
 * Handles keyboard navigation inside the open Command Palette modal.
 *
 * @param {KeyboardEvent} event - DOM keydown event.
 */
function handlePaletteKeydown(event) {
  const fn = PALETTE_KEY_ACTIONS[event.key];
  if (fn) {
    event.preventDefault();
    fn();
  }
}

/**
 * Logs branch switch when a branch row is selected in the sidebar.
 *
 * @param {string} panel - Panel key.
 * @param {number} idx - Row index.
 */
function logSidebarAction(panel, idx) {
  const branch = panel === "branches" ? SIDEBAR_DATA.branches[idx] : undefined;
  if (branch) {
    appendConsoleLog(`git switch ${branch.name}`, "12ms");
  }
}

/**
 * Handles clicks on a sidebar row inside the TUI simulator.
 *
 * @param {Element} sidebarRow - Clicked sidebar row element.
 */
function handleSidebarRowClick(sidebarRow) {
  const panel = sidebarRow.getAttribute("data-sidebar-panel") || "branches";
  const idx = Number(sidebarRow.getAttribute("data-sidebar-index"));
  const region = sidebarRow.getAttribute("data-sidebar-region") || "1";

  setFocusedRegion(region);
  state.sidebarSelection[panel] = idx;
  logSidebarAction(panel, idx);
  renderAllSidebarPanels();
}

/**
 * Focuses the simulator region enclosing the clicked target element.
 *
 * @param {HTMLElement} target - Clicked DOM element.
 */
function focusEnclosingRegion(target) {
  const regionId = target.closest("[data-region-id]")?.getAttribute("data-region-id");
  if (regionId) {
    setFocusedRegion(regionId);
  }
}

/**
 * Handles clicks inside the TUI simulator container.
 *
 * @param {MouseEvent} event - Click event.
 */
function handleSimulatorClick(event) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const commitRow = event.target.closest("[data-commit-index]");
  if (commitRow) {
    selectCommitByIndex(Number(commitRow.getAttribute("data-commit-index")));
    return;
  }
  const sidebarRow = event.target.closest("[data-sidebar-panel]");
  if (sidebarRow) {
    handleSidebarRowClick(sidebarRow);
    return;
  }
  focusEnclosingRegion(event.target);
}

/**
 * Binds Hero installer and Workbench toolbar events.
 */
function bindWorkbenchEvents() {
  document.addEventListener("keydown", handleGlobalKeydown);

  for (const tab of document.querySelectorAll("[data-install-tab]")) {
    tab.addEventListener("click", () => setInstallTab(tab.getAttribute("data-install-tab") || ""));
  }

  document.getElementById("copy-install-btn")?.addEventListener("click", copyActiveInstallCommand);
  document
    .getElementById("footer-copy-trigger")
    ?.addEventListener("click", copyActiveInstallCommand);

  for (const modeBtn of document.querySelectorAll("[data-workbench-mode]")) {
    modeBtn.addEventListener("click", () =>
      setWorkbenchMode(modeBtn.getAttribute("data-workbench-mode") || "simulator"),
    );
  }

  document.getElementById("toggle-graph-style-btn")?.addEventListener("click", toggleGraphStyle);
  document.getElementById("footer-graph-trigger")?.addEventListener("click", toggleGraphStyle);
  document.getElementById("cycle-theme-btn")?.addEventListener("click", openThemePicker);
  document.getElementById("toggle-console-btn")?.addEventListener("click", toggleConsoleDrawer);
  document.getElementById("footer-console-trigger")?.addEventListener("click", toggleConsoleDrawer);
  document.getElementById("clear-console-btn")?.addEventListener("click", () => {
    state.consoleLogs = [];
    renderConsoleLogs();
  });
}

/**
 * Binds simulator internal controls, mobile tabs, and graph search input.
 */
function bindSimulatorInternalEvents() {
  for (const cmdBtn of document.querySelectorAll("[data-sim-git]")) {
    cmdBtn.addEventListener("click", () =>
      runSimulatedGitRemote(cmdBtn.getAttribute("data-sim-git") || "fetch"),
    );
  }

  for (const mobTab of document.querySelectorAll("[data-mobile-pane]")) {
    mobTab.addEventListener("click", () => {
      const pane = mobTab.getAttribute("data-mobile-pane") || "graph";
      document.getElementById("tui-main-grid")?.setAttribute("data-mobile-active", pane);
      for (const btn of document.querySelectorAll("[data-mobile-pane]")) {
        btn.classList.toggle("tui__mobile-tab--active", btn === mobTab);
      }
    });
  }

  document.getElementById("tui-simulator")?.addEventListener("click", handleSimulatorClick);

  const graphSearch = document.getElementById("sim-graph-search");
  if (graphSearch instanceof HTMLInputElement) {
    graphSearch.addEventListener("input", () => {
      state.graphFilter = graphSearch.value;
      state.selectedCommitIndex = 0;
      renderCommitGraph();
      renderInspectorPanes();
    });
  }
}

/**
 * Updates the active keymap scope tab and re-renders the keybindings table.
 *
 * @param {Element} clickedBtn - The clicked scope tab button.
 */
function selectKeymapScopeButton(clickedBtn) {
  state.keymapScope = clickedBtn.getAttribute("data-keymap-scope") || "all";
  for (const b of document.querySelectorAll("[data-keymap-scope]")) {
    const active = b === clickedBtn;
    b.classList.toggle("keymap-box__scope-btn--active", active);
    b.setAttribute("aria-selected", String(active));
  }
  renderKeymapTable();
}

/**
 * Binds events for the Keymap Explorer filter controls.
 */
function bindKeymapEvents() {
  for (const scopeBtn of document.querySelectorAll("[data-keymap-scope]")) {
    scopeBtn.addEventListener("click", () => selectKeymapScopeButton(scopeBtn));
  }

  const keymapInput = document.getElementById("keymap-search-input");
  if (keymapInput instanceof HTMLInputElement) {
    keymapInput.addEventListener("input", () => {
      state.keymapQuery = keymapInput.value;
      renderKeymapTable();
    });
  }
}

/**
 * Binds events for the Config Blueprints tabs and Catppuccin theme pills.
 */
function bindConfigEvents() {
  for (const cfgTab of document.querySelectorAll("[data-config-tab]")) {
    cfgTab.addEventListener("click", () =>
      setConfigTab(cfgTab.getAttribute("data-config-tab") || "config"),
    );
  }

  document.getElementById("copy-config-btn")?.addEventListener("click", copyConfigSnippet);

  for (const pill of document.querySelectorAll("[data-theme-pick]")) {
    pill.addEventListener("click", () => {
      setSimulatorTheme(pill.getAttribute("data-theme-pick") || "catppuccin-mocha");
      scrollToSection("workbench");
    });
  }
}

/**
 * Copies the active configuration snippet to the clipboard.
 */
function copyConfigSnippet() {
  const spec = CONFIG_SNIPPETS[state.configTab] || CONFIG_SNIPPETS.config;
  copyToClipboard(spec.code, () => {
    setTextById("copy-config-label", "[Copied!]");
    setTimeout(() => setTextById("copy-config-label", "[Copy Snippet]"), 1500);
  });
}

/**
 * Binds events for the interactive Command Palette modal.
 */
function bindPaletteEvents() {
  document
    .getElementById("open-palette-btn")
    ?.addEventListener("click", () => setPaletteOpen(true));
  document
    .getElementById("footer-palette-trigger")
    ?.addEventListener("click", () => setPaletteOpen(true));
  document
    .getElementById("close-palette-btn")
    ?.addEventListener("click", () => setPaletteOpen(false));
  document
    .getElementById("palette-backdrop")
    ?.addEventListener("click", () => setPaletteOpen(false));

  const paletteInput = document.getElementById("palette-search-input");
  if (paletteInput instanceof HTMLInputElement) {
    paletteInput.addEventListener("input", () => {
      state.paletteQuery = paletteInput.value;
      state.paletteCursor = 0;
      renderPaletteList();
    });
  }

  document.getElementById("palette-command-list")?.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const itemBtn = target?.closest("[data-palette-index]");
    if (itemBtn) {
      state.paletteCursor = Number(itemBtn.getAttribute("data-palette-index") || "0");
      executeActivePaletteCommand();
    }
  });
}

/**
 * Binds the controls that open the theme picker.
 */
function bindThemePickerOpeners() {
  for (const id of ["cycle-theme-btn", "footer-theme-trigger", "open-theme-picker-btn"]) {
    document.getElementById(id)?.addEventListener("click", openThemePicker);
  }
}

/**
 * Binds the controls that dismiss the theme picker.
 */
function bindThemePickerDismissers() {
  for (const id of ["close-theme-picker-btn", "theme-picker-backdrop"]) {
    document.getElementById(id)?.addEventListener("click", cancelThemePicker);
  }
}

/**
 * Binds the variant tabs so a click switches variant.
 */
function bindThemePickerTabs() {
  for (const tab of document.querySelectorAll("[data-theme-tab]")) {
    tab.addEventListener("click", () =>
      setThemePickerTab(tab.getAttribute("data-theme-tab") || "dark"),
    );
  }
}

/**
 * Binds the search field so typing filters the list and previews the highlight.
 */
function bindThemePickerSearch() {
  const searchInput = document.getElementById("theme-picker-search");
  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener("input", () => {
      state.themePickerQuery = searchInput.value;
      state.themePickerCursor = 0;
      setSimulatorTheme(getHighlightedThemeName());
      scrollThemePickerRowIntoView();
    });
  }
}

/**
 * Binds theme rows so a click highlights and previews that theme.
 */
function bindThemePickerRows() {
  document.getElementById("theme-picker-list")?.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const row = target?.closest("[data-theme-index]");
    if (!row) {
      return;
    }

    state.themePickerCursor = Number(row.getAttribute("data-theme-index") || "0");
    setSimulatorTheme(getHighlightedThemeName());
  });
}

/**
 * Binds the theme picker footer action buttons.
 */
function bindThemePickerFooterActions() {
  for (const button of document.querySelectorAll("[data-theme-action]")) {
    button.addEventListener("click", () => {
      runThemePickerAction(button.getAttribute("data-theme-action") || "apply");
    });
  }
}

/**
 * Binds events for the interactive Theme Picker modal.
 */
function bindThemePickerEvents() {
  bindThemePickerOpeners();
  bindThemePickerDismissers();
  bindThemePickerTabs();
  bindThemePickerSearch();
  bindThemePickerRows();
  bindThemePickerFooterActions();
  setThemePickerModalHidden(true);
}

/**
 * CSS selector for blocks that fade and rise into view on scroll.
 */
const REVEAL_SELECTOR =
  ".workbench__header, .matrix__header, .reference__header, .matrix-card, .keymap-box, .config-box";

/**
 * Sets up the desktop scroll-reveal effect: each matching block fades and rises
 * in once it enters the viewport, then the reveal classes are removed so the
 * element's own hover styles can take over. No-op on narrow viewports and when
 * the visitor prefers reduced motion.
 */
function initScrollReveal() {
  const desktopQuery = window.matchMedia("(min-width: 781px)");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!desktopQuery.matches || motionQuery.matches) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const el = entry.target;
        el.classList.add("is-visible");
        el.addEventListener(
          "animationend",
          () => el.classList.remove("anim-reveal", "is-visible"),
          { once: true },
        );
        observer.unobserve(el);
      }
    },
    { threshold: 0.15 },
  );

  for (const el of document.querySelectorAll(REVEAL_SELECTOR)) {
    el.classList.add("anim-reveal");
    observer.observe(el);
  }
}

/**
 * Bootstraps the Gitminal documentation and interactive workbench page.
 */
function initApp() {
  renderAllSidebarPanels();
  renderCommitGraph();
  renderInspectorPanes();
  renderConsoleLogs();
  renderKeymapTable();
  setConfigTab("config");
  bindWorkbenchEvents();
  bindSimulatorInternalEvents();
  bindKeymapEvents();
  bindConfigEvents();
  bindPaletteEvents();
  bindThemePickerEvents();
  initScrollReveal();
}

initApp();
