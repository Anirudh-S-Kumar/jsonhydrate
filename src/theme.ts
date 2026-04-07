// Base16 themes for react-json-tree that match VS Code dark/light

export const darkTheme = {
  scheme: "jsontree-dark",
  author: "jsontree",
  base00: "transparent", // background — transparent to inherit VS Code
  base01: "#252526", // lighter bg
  base02: "#3c3c3c", // selection
  base03: "#6a6a6a", // comments
  base04: "#858585", // dark foreground
  base05: "#d4d4d4", // default foreground
  base06: "#e0e0e0", // light foreground
  base07: "#ffffff", // lightest foreground
  base08: "#f85c50", // red (false)
  base09: "#e8c479", // orange/numbers
  base0A: "#dcdcaa", // yellow
  base0B: "#98c379", // green (strings)
  base0C: "#4ec9b0", // cyan
  base0D: "#59b8ff", // blue (keys)
  base0E: "#c792ea", // purple
  base0F: "#d16969", // dark red
};

export const lightTheme = {
  scheme: "jsontree-light",
  author: "jsontree",
  base00: "transparent", // background — transparent to inherit VS Code
  base01: "#f3f3f3", // lighter bg
  base02: "#e5e5e5", // selection
  base03: "#a0a0a0", // comments
  base04: "#6a6a6a", // dark foreground
  base05: "#333333", // default foreground
  base06: "#1a1a1a", // light foreground
  base07: "#000000", // lightest foreground
  base08: "#d32f2f", // red (false)
  base09: "#fd0079", // pink/numbers
  base0A: "#795548", // yellow/brown
  base0B: "#2e7d32", // green (strings)
  base0C: "#00796b", // cyan
  base0D: "#761cea", // blue/purple (keys)
  base0E: "#7b1fa2", // purple
  base0F: "#c62828", // dark red
};

export function getTreeTheme(mode: "light" | "dark") {
  const base = mode === "dark" ? darkTheme : lightTheme;
  return {
    extend: base,
  };
}
