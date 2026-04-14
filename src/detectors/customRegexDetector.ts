import type { CustomRuleConfig, DetectionResult, IValueDetector } from "./types";

export class CustomRegexDetector implements IValueDetector {
  name: string;
  enabled = true;
  private pattern: RegExp;
  private color: string;
  private tooltipTemplate?: string;
  private keyFilter?: RegExp;

  constructor(rule: CustomRuleConfig) {
    this.name = `custom:${rule.name}`;
    this.color = rule.color;
    this.tooltipTemplate = rule.tooltip;

    try {
      this.pattern = new RegExp(rule.pattern);
    } catch {
      this.pattern = /(?!)/; // never-match regex
    }

    if (rule.keyFilter) {
      try {
        this.keyFilter = new RegExp(rule.keyFilter, "i");
      } catch {
        // invalid key filter, ignore
      }
    }
  }

  configure(_config: Record<string, unknown>, _currentTheme?: "light" | "dark"): void {
    // Config is set via constructor; no-op for custom rules
  }

  detect(value: unknown, keyPath: readonly (string | number)[]): DetectionResult | null {
    if (!this.enabled) return null;
    if (typeof value !== "string" && typeof value !== "number") return null;

    // Check key filter if specified
    if (this.keyFilter && keyPath.length > 0) {
      const key = String(keyPath[0]);
      if (!this.keyFilter.test(key)) return null;
    }

    const strValue = String(value);
    const match = strValue.match(this.pattern);
    if (!match) return null;

    // Build tooltip from template with group substitution
    let tooltip: string | undefined;
    if (this.tooltipTemplate) {
      tooltip = this.tooltipTemplate.replace(/\$(\d)/g, (_, idx) => {
        const i = parseInt(idx, 10);
        return match[i] ?? "";
      });
    }

    return {
      type: this.name,
      raw: strValue,
      color: this.color,
      className: "jsonhydrate-custom",
      tooltip,
    };
  }
}
