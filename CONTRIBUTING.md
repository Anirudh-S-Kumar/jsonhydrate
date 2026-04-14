# Contributing to Json Hydrate

First of all, thanks for taking the time to contribute! We appreciate all PRs, whether they are bug fixes, new features, or documentation improvements.

## Local Development Setup

To get the extension running locally for testing and development:

1. Clone the repository and install dependencies with `npm install`.
2. This project uses a strict linting and formatting pipeline using ESLint and Prettier. Make sure your local editor is configured to format on save, or run the scripts manually.
3. To launch the app, hit `F5` in VS Code or run `npm run launch`. It will boot up an Extension Development Host window automatically loaded with our `test-data.json` fixture.
4. To work solely on the frontend Webview without the VS Code extension host overhead, use `npm run dev`.

## Code Standards

We enforce aggressive code-quality rules:

- **Self-Documenting Code**: Readability is paramount. The codebase must be easily understandable by looking at variable names and function signatures. Decompose large functions instead of commenting them.
- **Zero-Comment Rule**: Do not write comments explaining *what* your code is doing. We aggressively reject PRs that litter the codebase with redundant comments. If you absolutely must write a comment, it may only explain *why* an unusual approach was taken (e.g. a workaround for a documented upstream bug), but use "why" comments very sparingly.
- **Testing**: If you add new detection features (like catching a new timestamp format), add a corresponding test in `tests/`.
- **Validation**: Ensure `npm run lint`, `npm run format`, and `npm test` execute cleanly before submitting.

Refer to our canonical style guide at `.agents/skills/coding-style.md` and the extension architecture at `AGENTS.md` for further reference.

## Submitting a Pull Request

1. Branch off `main` with a clear branch name (`feat/my-feature` or `fix/my-bug`).
2. Implement your changes following the rules above.
3. Open a PR with a description of what you changed, why you changed it, and how you tested the result.
