# JSON Tree Viewer

A lightning-fast, interactive visualizer for JSON files right inside VS Code. Stop squinting at raw brackets and start navigating your data with a collapsible tree UI, smart value detection, and custom coloring.

![Hero Demo](assets/hero-demo.gif)

## Why use this?

Raw JSON gets unreadable quickly. We built this extension to fix that by automatically detecting, highlighting, and visualizing common data patterns directly in your editor:

- **Interactive Trees**: Expand and collapse huge JSON structures instantly without lag.
- **Smart Datetime Parsing**: Hover over any timestamp (Unix epochs, ISO strings) to see Local, UTC, and Relative time conversions instantly. No more copy-pasting into epoch converters.
- **UUID Spotting**: Hard-to-read UUIDs are visually isolated and highlighted. Click to copy them directly.
- **Markdown Previews**: JSON containing markdown blocks? They are automatically rendered inline so you can read them properly.
- **Custom Rules Engine**: Define your own Regex patterns in settings to highlight unique data (like JWTs, AWS ARNs, or custom internal IDs).

![Feature Highlight: Datetime and UUID](assets/feature-detection.gif)

## Quick Start

1. Open any `.json` file in VS Code.
2. Click the tiny **Tree Icon** in the top-right editor action bar.
3. *Alternatively*: Highlight a snippet of JSON text, right-click, and select **"Open Selection in JSON Tree"**.

## Customization

The viewer is highly customizable. Adjust the settings via your VS Code `settings.json` (under `jsontree.*`):

| Setting | What it does | Default |
|---------|-------------|---------|
| `jsontree.uuid.enabled` | Turns on UUID tracking. | `true` |
| `jsontree.uuid.color` | Highlight color for UUIDs. | `#c792ea` |
| `jsontree.datetime.enabled` | Turns on Datetime detection / hover tooltips. | `true` |
| `jsontree.datetime.color` | Highlight color for timestamps. | `#ffcb6b` |
| `jsontree.customRules` | Supply your own Regex pattern matching arrays! | `[]` |

### Adding Custom Regex Rules

Want to highlight JWTs in red? Add this to your settings:
```json
{
  "jsontree.customRules": [
    {
      "name": "JWT Token",
      "pattern": "^eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$",
      "color": "#ff6b6b",
      "tooltip": "JWT Token Match"
    }
  ]
}
```

![Feature Highlight: Custom Rules](assets/feature-custom-rules.gif)

## License

Apache-2.0
