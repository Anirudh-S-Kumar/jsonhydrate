# JSON Tree Viewer Extension - Agent Context

This repository contains the source code for the "JSON Tree Viewer" VS Code extension. This document provides technical context for AI coding assistants (Agents) to understand the architecture, tech stack, and conventions.

## 🛠️ Tech Stack
- **Core**: VS Code Extension API
- **Webview Frontend**: React 19 (using `createRoot`)
- **Frontend State Management**: React Hooks
- **Bundling**: 
  - **Frontend**: Vite 6 (builds to `build/webview`)
  - **Extension Host**: esbuild (builds to `build/extension.js`)
- **Testing**: Vitest + React Testing Library + jsdom
- **Styling**: Vanilla CSS with modern features (Gradients, Glassmorphism, CSS Variables)
- **Notable Libraries**:
  - `react-json-tree`: Base for the tree visualization.
  - `react-markdown` & `remark-gfm`: For rendering markdown within JSON values.
  - `fflate`: For potential compression/decompression tasks.

## 📂 Project Structure
- `ext-src/`: VS Code extension host code (TypeScript).
  - `extension.ts`: Main activation logic, command registration, and configuration handling.
  - `webview.ts`: Webview panel creation, HTML generation, and message passing.
- `src/`: React frontend for the webview (TypeScript/JSX).
  - `index.tsx`: Entry point for the React app.
  - `App.tsx`: Main application component, handles message receiving from host.
  - `components/`: UI components (TreeViewer, Custom Item renderers).
  - `detectors/`: Logic for identifying special values (UUIDs, Datetime strings, ARNs).
  - `styles/`: CSS modules or standard CSS.
- `tests/`: Vitest test suites corresponding to the source structure.
- `assets/`: Icons and static images.
- `build/`: Computed artifacts (excluded from version control).

## 🧩 Key Concepts & Message Protocol
- **Navigation**: The extension supports "Navigate to Key" (JSON Path -> Document Position).
- **Communication**: Uses `vscode.postMessage` from webview to host, and `panel.webview.postMessage` from host to webview.
  - **Host -> Webview**: `json` (data), `settings` (config updates).
  - **Webview -> Host**: `ready`, `navigateToKey`, `openUrl`.

## 🎨 Design Principles
- **Aesthetics**: Premium, modern look with dark/light mode support matching VS Code themes.
- **Interactivity**: Dynamic hover effects, smooth transitions, and high-performance rendering for large JSON files.
- **Micro-animations**: Subtle visual feedback for user actions.

## 🤝 Contribution Guidelines for Agents
- **Indentation**: 2 spaces (Standard `.editorconfig` enforced).
- **TypeScript**: Strict mode enabled. Use explicit interfaces for message payloads.
- **React**: Prefer functional components and hooks. Use React 19 features where appropriate.
- **CSS**: Use semantic CSS variables for consistency with VS Code branding.
- **Tests**: Add unit/component tests for new business logic or UI components in `tests/`.
- **Imports**: Use standard relative imports. Note that `tsconfig.json` uses `moduleResolution: "bundler"`.

## 🚀 Common Commands
- `npm run build`: Full build (Vite + esbuild).
- `npm run watch`: Incremental build for extension host.
- `npm run watch:webview`: Incremental build for webview.
- `npm test`: Run all Vitest tests.
- `npm run dev`: Start Vite dev server for webview testing (outside VS Code).
