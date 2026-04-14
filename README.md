<div align="center">
  <img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/icon.png" width="96" />
  <h1>Json Hydrate</h1>
  <p>JSON visualizer for VS Code providing recursive decoding and type detection.</p>

  [![Version](https://img.shields.io/visual-studio-marketplace/v/anirudh-kumar.json-hydrate?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=anirudh-kumar.json-hydrate)
  [![License](https://img.shields.io/github/license/Anirudh-S-Kumar/jsonhydrate?style=flat-square)](LICENSE)
</div>

<hr />

Json Hydrate is an interactive JSON visualizer for VS Code providing recursive decoding, type detection, and custom highlighting.

## Features

### Type Detection and Highlighting

- **Datetime Parsing**: Automatically identifies Unix epochs and ISO strings. Hovering over values reveals Local, UTC, and Relative time conversions.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/datetime.gif" width="600" alt="Datetime Parsing" />

- **UUID Highlighting**: Automatically identifies standard UUID formats for distinctive coloring.

### Data Decoding

- **Recursive JSON and Base64**: Identifies and expands nested JSON strings or Base64-encoded content within the tree structure.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/json_decode.gif" width="600" alt="JSON and Base64 Decoding" />

- **Gzip Decompression**: In-place decompression for Gzip and Zlib data.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/gzip.gif" width="600" alt="Gzip Decompression" />

### Content Rendering

- **Markdown Rendering**: Renders Markdown-formatted strings as styled blocks within the viewer.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/markdown.gif" width="600" alt="Markdown Rendering" />

- **Image Previews**: Visualizes images from URLs or Base64 data strings.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/image_preview.gif" width="600" alt="Image Previews" />

- **Token Highlighting**: Define custom regex rules to highlight JWT tokens, AWS ARNs, or internal ID formats.
  <br/><img src="https://raw.githubusercontent.com/Anirudh-S-Kumar/jsonhydrate/main/assets/gifs/jwt.gif" width="600" alt="JWT Highlighting" />

## Usage

1. Open any JSON or JSONC file.
2. Select the **Hydrate** icon in the editor title bar (top right).
3. To visualize specific snippets, right-click a selection and choose **Open Selection in Json Hydrate**. Partial snippets are supported via automatic heuristic wrapping.

## Configuration

Customization is managed via the `jsonhydrate.*` prefix in `settings.json`.

| Key                               | Description                                       | Default |
| :-------------------------------- | :------------------------------------------------ | :------ |
| `jsonhydrate.uuid.enabled`        | Enable UUID highlighting.                         | `true`  |
| `jsonhydrate.datetime.enabled`    | Enable timestamp detection and tooltips.          | `true`  |
| `jsonhydrate.markdown.autoRender` | Automatically render detected Markdown.           | `false` |
| `jsonhydrate.customRules`         | Regex rules for custom highlighting and tooltips. | `[]`    |

## License

Apache-2.0
