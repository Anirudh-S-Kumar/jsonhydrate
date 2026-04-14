# Json Hydrate Extension - Agent Context

Welcome to the Json Hydrate repository. This document serves as the architecture overview and behavioral guidelines for AI coding assistants.

## 🛠️ Tech Stack & Architecture
- **Host Extension**: Runs in VS Code's Node.js environment (`ext-src/`) using TypeScript. Bundled with esbuild to `build/extension.js`. Communicates with the webview using message passing.
- **Webview UI**: React 19 frontend (`src/`) rendering inside a VS Code webview panel. Bundled with Vite 6 to `build/webview/`. Uses `createRoot`, React Hooks, and standard CSS modules/variables for theming.
- **Key Libraries**: `react-json-tree`, `react-markdown`, `remark-gfm`.
- **Testing**: Vitest + React Testing Library + jsdom under `tests/`.

## 🎨 Design Principles
- **Aesthetics**: Premium, modern look with dark/light mode support matching VS Code themes. High performance on large files.
- **Interactivity**: Dynamic hover effects, smooth transitions, click-to-copy, and micro-animations for user feedback.

## 🤝 Strict Contribution Guidelines for Agents
Agents must adhere strictly to the following rules:

1. **Enforce Self-Documenting Code**: You must write code that is inherently understandable based purely on variable names, function signatures, and logic flow. 
2. **Aggressive Zero-Comment Policy**: Avoid comments if at all possible. Code should explain the *what*. If you absolutely have no choice, a comment may solely explain the *why* (e.g., a bug workaround, obscure API limitation). Even then, use them very sparingly. Do not litter the codebase with comments.
3. **Formatting & Linting**: ESLint and Prettier are configured. All changes must align with `npm run format` and `npm run lint`.
4. **TypeScript Strictness**: Strict mode is enabled. Use explicit interfaces. Avoid `type` when `interface` works. Never use `any`.

For detailed coding instructions, reference the agent skill located at `.agents/skills/coding-style.md`.

## 🚀 Common Commands
- `npm run build`: Full build (Vite + esbuild).
- `npm run watch`: Incremental build for extension host.
- `npm run watch:webview`: Incremental build for webview.
- `npm test`: Run all tests via Vitest.
- `npm run lint`: Run ESLint.
- `npm run format`: Auto-format codebase using Prettier.
