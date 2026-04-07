---
name: Coding Style
description: Strict guidelines and principles for writing code in this repository.
---

# Typescript & General Style Guidelines

1. **Self-Documenting Code**: Your code must explain itself. Use expressive variable names, clear function signatures, and decompose complex logic into simple, bite-sized utility functions.
2. **Aggressively Minimal Comments**: Do NOT write comments explaining *what* the code does. If you absolutely MUST write a comment, it can ONLY explain the *why* (e.g., a specific upstream bug workaround or an external constraint). Even then, use "why" comments *extremely* sparingly. If your code needs a comment to be understood, rewrite the code to be clearer instead.
3. **No 'Littering'**: Keep the codebase clean. Avoid leaving behind commented-out code, scratchpads, or `console.log` statements.
4. **Immutability & Hooks**: In React, treat all state and props as immutable. Do not mutate arrays or objects directly. Use functional array methods (`.map`, `.filter`, `.reduce`).
5. **Typescript**: Use `interface` by default. Strictly type your function returns and arguments. Absolutely no `any`.
6. **Lint & Format**: Always ensure your changes pass `npm run format` and `npm run lint`.
