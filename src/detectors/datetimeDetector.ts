import type { DetectionResult, IValueDetector } from "./types";

// String datetime patterns
const ISO_8601_FULL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
const ISO_8601_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_SPACE = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?(\.\d+)?$/;
const RFC_2822 = /^[A-Z][a-z]{2},?\s\d{1,2}\s[A-Z][a-z]{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\s[+-]\d{4}$/;
const US_DATE = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$/;
const EU_DATE = /^(0?[1-9]|[12]\d|3[01])[.\-](0?[1-9]|1[0-2])[.\-]\d{4}$/;

function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;
  const suffix = isFuture ? "from now" : "ago";

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s ${suffix}`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${suffix}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${suffix}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ${suffix}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ${suffix}`;

  const years = Math.floor(days / 365);
  return `${years}y ${suffix}`;
}

function buildTooltip(date: Date): string {
  const local = date.toLocaleString();
  const utc = date.toISOString();
  const relative = relativeTime(date);
  const unix = Math.floor(date.getTime() / 1000);
  return `Local: ${local}\nUTC: ${utc}\nRelative: ${relative}\nUnix: ${unix}`;
}

export class DatetimeDetector implements IValueDetector {
  name = "datetime";
  enabled = true;
  private color = "#ffcb6b";
  private keyHints: string[] = [];
  private unixRangeMin = 0; // 1970-01-01
  private unixRangeMax = 4102444800; // 2100-01-01

  configure(config: Record<string, unknown>, currentTheme?: "light" | "dark"): void {
    const dtConfig = config.datetime as Record<string, unknown> | undefined;
    if (!dtConfig) return;

    if (typeof dtConfig.enabled === "boolean") {
      this.enabled = dtConfig.enabled;
    }

    // Pick color priority: 1. Theme-specific override, 2. Global setting, 3. Default
    const themeConfig = config.theme as Record<string, any> | undefined;
    const themeSpecific = currentTheme ? themeConfig?.[currentTheme] : undefined;

    if (themeSpecific?.datetime) {
      this.color = themeSpecific.datetime;
    } else if (typeof dtConfig.color === "string") {
      this.color = dtConfig.color;
    }

    if (Array.isArray(dtConfig.keyHints)) {
      this.keyHints = dtConfig.keyHints.filter((k): k is string => typeof k === "string");
    }
    if (typeof dtConfig.unixRangeMin === "number") {
      this.unixRangeMin = dtConfig.unixRangeMin;
    }
    if (typeof dtConfig.unixRangeMax === "number") {
      this.unixRangeMax = dtConfig.unixRangeMax;
    }
  }

  private keyMatchesHint(keyPath: readonly (string | number)[]): boolean {
    if (keyPath.length === 0) return false;
    const key = String(keyPath[0]).toLowerCase();
    return this.keyHints.some((hint) => key.includes(hint.toLowerCase()));
  }

  private tryParseString(value: string): Date | null {
    const trimmed = value.trim();

    // ISO 8601 full datetime
    if (ISO_8601_FULL.test(trimmed)) {
      const d = new Date(trimmed);
      return isValidDate(d) ? d : null;
    }

    // Datetime with space separator (2024-01-15 10:30:00)
    if (DATETIME_SPACE.test(trimmed)) {
      const d = new Date(trimmed.replace(" ", "T"));
      return isValidDate(d) ? d : null;
    }

    // ISO 8601 date only
    if (ISO_8601_DATE.test(trimmed)) {
      const d = new Date(trimmed + "T00:00:00");
      return isValidDate(d) ? d : null;
    }

    // RFC 2822
    if (RFC_2822.test(trimmed)) {
      const d = new Date(trimmed);
      return isValidDate(d) ? d : null;
    }

    // US date: MM/DD/YYYY
    if (US_DATE.test(trimmed)) {
      const parts = trimmed.split("/");
      const d = new Date(
        `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}T00:00:00`,
      );
      return isValidDate(d) ? d : null;
    }

    // EU date: DD-MM-YYYY or DD.MM.YYYY
    if (EU_DATE.test(trimmed)) {
      const parts = trimmed.split(/[.\-]/);
      const d = new Date(
        `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}T00:00:00`,
      );
      return isValidDate(d) ? d : null;
    }

    return null;
  }

  private tryParseNumber(value: number, keyPath: readonly (string | number)[]): Date | null {
    if (!Number.isFinite(value) || value < 0) return null;

    // Check if key name hints at this being a timestamp
    const keyMatches = this.keyMatchesHint(keyPath);

    // Unix seconds (10 digits)
    if (value >= this.unixRangeMin && value <= this.unixRangeMax) {
      if (keyMatches) {
        const d = new Date(value * 1000);
        return isValidDate(d) ? d : null;
      }
    }

    // Unix milliseconds (13 digits)
    const asSeconds = value / 1000;
    if (asSeconds >= this.unixRangeMin && asSeconds <= this.unixRangeMax) {
      if (keyMatches || value > 1e12) {
        // 13-digit numbers are almost certainly ms timestamps
        const d = new Date(value);
        return isValidDate(d) ? d : null;
      }
    }

    return null;
  }

  detect(value: unknown, keyPath: readonly (string | number)[]): DetectionResult | null {
    if (!this.enabled) return null;

    let date: Date | null = null;

    if (typeof value === "string") {
      date = this.tryParseString(value);
    } else if (typeof value === "number") {
      date = this.tryParseNumber(value, keyPath);
    }

    if (!date) return null;

    return {
      type: "datetime",
      raw: String(value),
      color: this.color,
      className: "jsontree-datetime",
      tooltip: buildTooltip(date),
      parsed: date,
    };
  }
}
