export interface DetectionResult {
  /** What type of special value was detected */
  type: "uuid" | "datetime" | "url" | "color" | string;
  /** Original raw value */
  raw: string;
  /** Display color override */
  color: string;
  /** Optional CSS class for additional styling */
  className?: string;
  /** Tooltip content (rendered on hover) */
  tooltip?: string;
  /** Extra parsed data (e.g., Date object for datetimes) */
  parsed?: unknown;
}

export interface IValueDetector {
  name: string;
  /** Whether this detector is currently enabled */
  enabled: boolean;
  /** Return a DetectionResult if this value matches, or null */
  detect(value: unknown, keyPath: (string | number)[]): DetectionResult | null;
  /** Update this detector's config from VS Code settings */
  configure(config: Record<string, unknown>): void;
}

export interface CustomRuleConfig {
  name: string;
  pattern: string;
  color: string;
  tooltip?: string;
  keyFilter?: string;
}

export interface SettingsPayload {
  uuid: {
    enabled: boolean;
    color: string;
    additionalPatterns: string[];
  };
  datetime: {
    enabled: boolean;
    color: string;
    keyHints: string[];
    unixRangeMin: number;
    unixRangeMax: number;
  };
  markdown: {
    keyHints: string[];
  };
  customRules: CustomRuleConfig[];
}
