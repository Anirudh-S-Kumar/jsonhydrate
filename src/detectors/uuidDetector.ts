import type { DetectionResult, IValueDetector } from "./types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_NO_DASH_REGEX = /^[0-9a-f]{32}$/i;

function getUuidVersion(uuid: string): string | null {
  const normalized = uuid.replace(/-/g, "");
  if (normalized.length !== 32) return null;
  const versionChar = normalized[12];
  const version = parseInt(versionChar, 10);
  if (version >= 1 && version <= 5) return `v${version}`;
  return null;
}

export class UuidDetector implements IValueDetector {
  name = "uuid";
  enabled = true;
  private color = "#c792ea";
  private additionalPatterns: RegExp[] = [];

  configure(config: Record<string, unknown>, currentTheme?: "light" | "dark"): void {
    const uuidConfig = config.uuid as Record<string, unknown> | undefined;
    if (!uuidConfig) return;

    if (typeof uuidConfig.enabled === "boolean") {
      this.enabled = uuidConfig.enabled;
    }

    // Pick color priority: 1. Theme-specific override, 2. Global setting, 3. Default
    const themeConfig = config.theme as Record<string, any> | undefined;
    const themeSpecific = currentTheme ? themeConfig?.[currentTheme] : undefined;

    if (themeSpecific?.uuid) {
      this.color = themeSpecific.uuid;
    } else if (typeof uuidConfig.color === "string") {
      this.color = uuidConfig.color;
    }

    if (Array.isArray(uuidConfig.additionalPatterns)) {
      this.additionalPatterns = [];
      for (const p of uuidConfig.additionalPatterns) {
        if (typeof p === "string") {
          try {
            this.additionalPatterns.push(new RegExp(p, "i"));
          } catch {
            // invalid regex, skip
          }
        }
      }
    }
  }

  detect(value: unknown, _keyPath: readonly (string | number)[]): DetectionResult | null {
    if (!this.enabled) return null;
    if (typeof value !== "string") return null;

    const trimmed = value.trim();

    const isUuid = UUID_REGEX.test(trimmed) || UUID_NO_DASH_REGEX.test(trimmed);
    const isAdditional = !isUuid && this.additionalPatterns.some((p) => p.test(trimmed));

    if (!isUuid && !isAdditional) return null;

    const version = getUuidVersion(trimmed);
    const tooltip = version ? `UUID ${version}` : "UUID";

    return {
      type: "uuid",
      raw: trimmed,
      color: this.color,
      className: "jsontree-uuid",
      tooltip,
    };
  }
}
