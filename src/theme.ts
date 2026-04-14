// Base16 themes for react-json-tree that match VS Code dark/light

export const darkTheme = {
  scheme: "jsonhydrate-dark",
  author: "jsontree",
  base00: "transparent", // default to transparent for VS Code integration
  base01: "#1a1a1c",
  base02: "#2d2d30",
  base03: "#6a6a6a",
  base04: "#858585",
  base05: "#d4d4d4",
  base06: "#e0e0e0",
  base07: "#ffffff",
  base08: "#f85c50", // null/bool
  base09: "#e8c479", // numbers
  base0A: "#dcdcaa",
  base0B: "#98c379", // strings
  base0C: "#4ec9b0",
  base0D: "#59b8ff", // keys
  base0E: "#c792ea",
  base0F: "#d16969",
};

export const lightTheme = {
  scheme: "jsonhydrate-light",
  author: "jsontree",
  base00: "transparent",
  base01: "#f3f3f3",
  base02: "#e5e5e5",
  base03: "#a0a0a0",
  base04: "#6a6a6a",
  base05: "#333333",
  base06: "#1a1a1a",
  base07: "#000000",
  base08: "#d73a49", // null/bool
  base09: "#d73a49", // numbers
  base0A: "#795548",
  base0B: "#22863a", // strings
  base0C: "#00796b",
  base0D: "#005cc5", // keys
  base0E: "#7b1fa2",
  base0F: "#c62828",
};

export interface ThemeOverrides {
  background?: string;
  keys?: string;
  strings?: string;
  numbers?: string;
  booleans?: string;
  uuid?: string;
  datetime?: string;
}

export function getTreeTheme(mode: "light" | "dark", overrides?: ThemeOverrides) {
  const base = mode === "dark" ? { ...darkTheme } : { ...lightTheme };

  if (overrides) {
    // Only apply custom background if it's explicitly set to something OTHER than our default hexes
    // This allows vs-code-specific transparency to work by default.
    if (overrides.background && overrides.background !== (mode === "dark" ? "#0a0a0c" : "#ffffff")) {
      base.base00 = overrides.background;
    }
    if (overrides.keys) base.base0D = overrides.keys;
    if (overrides.strings) base.base0B = overrides.strings;
    if (overrides.numbers) base.base09 = overrides.numbers;
    if (overrides.booleans) {
      base.base0E = overrides.booleans;
      base.base08 = overrides.booleans;
    }
  }

  return {
    extend: base,
  };
}
