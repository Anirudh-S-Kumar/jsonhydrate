import { CustomRegexDetector } from "./customRegexDetector";
import { DatetimeDetector } from "./datetimeDetector";
import { MarkdownDetector } from "./markdownDetector";
import type { CustomRuleConfig, DetectionResult, IValueDetector, SettingsPayload } from "./types";
import { UuidDetector } from "./uuidDetector";

export type { DetectionResult, IValueDetector, SettingsPayload, CustomRuleConfig };

export function createDetectors(
  settings?: SettingsPayload,
  theme?: "light" | "dark",
): IValueDetector[] {
  const uuid = new UuidDetector();
  const datetime = new DatetimeDetector();
  const markdown = new MarkdownDetector();

  if (settings) {
    uuid.configure(settings as unknown as Record<string, unknown>, theme);
    datetime.configure(settings as unknown as Record<string, unknown>, theme);
    markdown.configure(settings as unknown as Record<string, unknown>, theme);
  }

  const detectors: IValueDetector[] = [uuid, datetime, markdown];

  // Create custom rule detectors
  if (settings?.customRules && Array.isArray(settings.customRules)) {
    for (const rule of settings.customRules) {
      if (rule.name && rule.pattern && rule.color) {
        detectors.push(new CustomRegexDetector(rule));
      }
    }
  }

  return detectors;
}

export function runDetectors(
  value: unknown,
  keyPath: readonly (string | number)[],
  detectors: IValueDetector[],
): DetectionResult | null {
  for (const detector of detectors) {
    if (!detector.enabled) continue;
    const result = detector.detect(value, keyPath);
    if (result) return result;
  }
  return null;
}
