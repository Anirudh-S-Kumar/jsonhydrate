import type { DetectionResult, IValueDetector } from "./types";

/**
 * Detects if a string value is likely Markdown content.
 * Uses a combination of:
 * 1. Content patterns (headers, newlines, lists, links, bold/italic)
 * 2. Key name hints (markdown, description, notes, etc.)
 */
export class MarkdownDetector implements IValueDetector {
  name = "markdown";
  enabled = true;
  private keyHints: string[] = [];

  configure(config: Record<string, unknown>, _currentTheme?: "light" | "dark"): void {
    const mdConfig = config.markdown as Record<string, unknown> | undefined;
    if (!mdConfig) return;

    if (Array.isArray(mdConfig.keyHints)) {
      this.keyHints = mdConfig.keyHints.filter((k): k is string => typeof k === "string");
    }
    if (typeof mdConfig.enabled === "boolean") {
      this.enabled = mdConfig.enabled;
    }
  }

  detect(value: unknown, keyPath: readonly (string | number)[]): DetectionResult | null {
    if (!this.enabled) return null;
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    if (trimmed.length === 0) return null;

    const hasNewline = value.includes("\n");
    const hasHeader = /^#+\s/m.test(trimmed);
    const hasList = /^(\*|-|\d+\.)\s/m.test(trimmed);
    const hasLink = /\[.+\]\(.+\)/.test(trimmed);
    const hasCodeBlock = /```/.test(trimmed);

    const isMarkdownCandidate = hasNewline || hasHeader || hasList || hasLink || hasCodeBlock;

    // 3. Check for key hints
    const key = keyPath.length > 0 ? String(keyPath[0]).toLowerCase() : "";
    const keyMatches = this.keyHints.some((hint) => key.includes(hint.toLowerCase()));

    if (isMarkdownCandidate || keyMatches) {
      return {
        type: isMarkdownCandidate ? "markdown" : "multiline_hint",
        raw: value,
        color: "",
        className: isMarkdownCandidate ? "jsonhydrate-markdown-candidate" : "",
        tooltip: isMarkdownCandidate ? "Click to render as Markdown" : "Click to show multiline",
      };
    }

    return null;
  }
}
