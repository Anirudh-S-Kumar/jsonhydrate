# JSON Tree Viewer

Visualize JSON files as interactive, collapsible trees inside VS Code — with **UUID highlighting**, **datetime detection with hover tooltips**, and **custom detection rules**.

## Features

- 🌳 **Collapsible tree view** — Expand/collapse any object or array node
- 🎨 **Color-coded values** — Strings, numbers, booleans, nulls each have distinct colors
- 🔑 **UUID detection** — UUIDs rendered in purple with click-to-copy
- 📅 **Datetime detection** — ISO 8601, Unix timestamps, and more with hover tooltips showing Local/UTC/Relative/Unix formats
- ⚙️ **Custom rules** — Define your own regex-based detection rules via VS Code settings
- 🌗 **Theme-aware** — Follows your VS Code light/dark theme
- ⚡ **Live updates** — Changes in your JSON file are reflected immediately

## Usage

1. Open a `.json` file
2. Click the tree icon in the editor title bar, or:
   - Command Palette → "Open JSON Tree View"
3. Select JSON text → Right-click → "Open Selection in JSON Tree"

## Configuration

All settings are under `jsontree.*` in VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `jsontree.uuid.enabled` | `true` | Highlight UUID values |
| `jsontree.uuid.color` | `#c792ea` | UUID highlight color |
| `jsontree.datetime.enabled` | `true` | Detect datetime values |
| `jsontree.datetime.color` | `#ffcb6b` | Datetime highlight color |
| `jsontree.datetime.keyHints` | `["time","date",...]` | Key patterns for numeric timestamp detection |
| `jsontree.customRules` | `[]` | Custom regex-based detection rules |

### Custom Rules Example

```json
{
  "jsontree.customRules": [
    {
      "name": "JWT Token",
      "pattern": "^eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$",
      "color": "#ff6b6b",
      "tooltip": "JWT Token"
    }
  ]
}
```

## Attribution

Tree visualization inspired by [JSON Crack](https://jsoncrack.com) (Apache-2.0 licensed).

## License

Apache-2.0
