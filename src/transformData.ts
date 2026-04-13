import * as fflate from "fflate";
import { MarkdownDetector } from "./detectors/markdownDetector";
import type { SettingsPayload } from "./detectors";

/**
 * Pre-processes JSON data to decode special values (stringified JSON, base64, JWT, gzip)
 * into actual objects/values so react-json-tree renders them natively.
 */

const JWT_RE = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const BASE64_RE = /^[A-Za-z0-9+/]{20,}={0,2}$/;

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return atob(base64);
}

function isGzip(data: Uint8Array): boolean {
  return data.length > 2 && data[0] === 0x1f && data[1] === 0x8b;
}

function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function uint8ArrayToString(arr: Uint8Array): string {
  try {
    return new TextDecoder().decode(arr);
  } catch {
    // Fallback for non-utf8
    let str = "";
    for (let i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }
    return str;
  }
}

export interface DecodableEntry {
  path: string;
  type: "jwt" | "base64" | "stringified-json" | "gzip" | "multiline";
  raw: string;
  autoRender?: boolean;
}

export interface TransformResult {
  data: unknown;
  decodables: DecodableEntry[];
}

export function transformData(
  data: unknown,
  decodedPaths: Set<string>,
  currentPath = "",
  settings?: SettingsPayload,
): TransformResult {
  const decodables: DecodableEntry[] = [];

  if (Array.isArray(data)) {
    const items: unknown[] = [];
    for (let i = 0; i < data.length; i++) {
      const childPath = currentPath ? `${currentPath}.${i}` : String(i);
      const result = transformValue(data[i], childPath, decodedPaths, settings);
      items.push(result.value);
      decodables.push(...result.decodables);
    }
    return { data: items, decodables };
  }

  if (data !== null && typeof data === "object") {
    const obj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      const result = transformValue(val, childPath, decodedPaths, settings);
      obj[key] = result.value;
      decodables.push(...result.decodables);
    }
    return { data: obj, decodables };
  }

  return { data, decodables };
}

/**
 * Attempts to decode a string value, possibly multiple times (e.g. Gzip -> Base64 -> JSON).
 * Caps recursion at 5 levels for safety.
 */
function recursiveDecode(
  value: string,
  path: string,
  decodedPaths: Set<string>,
  depth = 0,
  settings?: SettingsPayload,
): { value: unknown; type?: DecodableEntry["type"]; decodables: DecodableEntry[] } {
  const decodables: DecodableEntry[] = [];
  if (depth >= 5) return { value, decodables };

  const trimmed = value.trim();

  // 1. JWT
  if (JWT_RE.test(trimmed)) {
    if (depth === 0) decodables.push({ path, type: "jwt", raw: trimmed });
    if (decodedPaths.has(path)) {
      try {
        const parts = trimmed.split(".");
        const header = JSON.parse(decodeBase64Url(parts[0]));
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        const decoded = { "🔐 header": header, "🔐 payload": payload };
        // Recurse into the decoded object
        const inner = transformData(decoded, decodedPaths, path, settings);
        decodables.push(...inner.decodables);
        return { value: inner.data, type: "jwt", decodables };
      } catch {
        /* fail */
      }
    }
    return { value, type: "jwt", decodables };
  }

  // 2. Stringified JSON
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        if (depth === 0) decodables.push({ path, type: "stringified-json", raw: trimmed });
        if (decodedPaths.has(path)) {
          const inner = transformData(parsed, decodedPaths, path, settings);
          decodables.push(...inner.decodables);
          return { value: inner.data, type: "stringified-json", decodables };
        }
        return { value, type: "stringified-json", decodables };
      }
    } catch {
      /* not JSON */
    }
  }

  // 3. Base64 / Gzip
  if (BASE64_RE.test(trimmed) && !JWT_RE.test(trimmed)) {
    try {
      const binaryString = atob(trimmed);
      const bytes = stringToUint8Array(binaryString);

      // Check if it's Gzip
      if (isGzip(bytes)) {
        if (depth === 0) decodables.push({ path, type: "gzip", raw: trimmed });
        if (decodedPaths.has(path)) {
          try {
            const decompressed = fflate.gunzipSync(bytes);
            const decodedStr = uint8ArrayToString(decompressed);
            // Recursive decode the result of decompression
            const inner = recursiveDecode(decodedStr, path, decodedPaths, depth + 1, settings);
            decodables.push(...inner.decodables);
            return { value: inner.value, type: "gzip", decodables };
          } catch {
            /* Decompression failed */
          }
        }
        return { value, type: "gzip", decodables };
      }

      // Check if it's printable plain Base64
      const isPrintable = /^[\x20-\x7E\t\n\r]+$/.test(binaryString);
      if (isPrintable && binaryString.length > 0) {
        if (depth === 0) decodables.push({ path, type: "base64", raw: trimmed });
        if (decodedPaths.has(path)) {
          // Recursive decode the result of base64 decode
          const inner = recursiveDecode(binaryString, path, decodedPaths, depth + 1, settings);
          decodables.push(...inner.decodables);
          return { value: inner.value, type: "base64", decodables };
        }
        return { value, type: "base64", decodables };
      }
    } catch {
      /* not valid base64 */
    }
  }

  const mdDetector = new MarkdownDetector();
  let autoRenderConfig = false;
  if (settings) {
    autoRenderConfig = settings.markdown?.autoRender ?? false;
    mdDetector.configure(settings as unknown as Record<string, unknown>);
  }

  // We need to pass the leaf key name to match the detector's logic
  const keyName = path.split(".").pop() || "";
  const mdResult = mdDetector.detect(value, [keyName]);

  if (mdResult) {
    if (depth === 0) {
      decodables.push({
        path,
        type: "multiline",
        raw: value,
        autoRender: autoRenderConfig && mdResult.type === "markdown",
      });
    }
  }

  return { value, decodables };
}

function transformValue(
  value: unknown,
  path: string,
  decodedPaths: Set<string>,
  settings?: SettingsPayload,
): { value: unknown; decodables: DecodableEntry[] } {
  if (typeof value === "string") {
    return recursiveDecode(value, path, decodedPaths, 0, settings);
  }

  if (value !== null && typeof value === "object") {
    const inner = transformData(value, decodedPaths, path, settings);
    return { value: inner.data, decodables: inner.decodables };
  }

  return { value, decodables: [] };
}
