import React, { useCallback, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type IValueDetector, runDetectors } from "../detectors";
import { DatetimeTooltip } from "./DatetimeTooltip";
import { UuidBadge } from "./UuidBadge";

interface ValueRendererProps {
  value: unknown;
  valueAsString: unknown;
  keyPath: (string | number)[];
  detectors: IValueDetector[];
  theme: "light" | "dark";
  forceMarkdown?: boolean;
}

// ======================== Helpers ========================

const HEX_COLOR_RE = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const RGB_RE = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
const RGBA_RE = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/;

function isColorValue(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (HEX_COLOR_RE.test(t) || RGB_RE.test(t) || RGBA_RE.test(t)) return t;
  return null;
}

const IMAGE_URL_RE = /\.(png|jpe?g|gif|svg|webp|bmp|ico|avif)(\?[^\s]*)?$/i;
const DATA_IMAGE_RE = /^data:image\//;

function isImageUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (IMAGE_URL_RE.test(t) || DATA_IMAGE_RE.test(t)) return t;
  try {
    const url = new URL(t);
    if (IMAGE_URL_RE.test(url.pathname)) return t;
  } catch {
    /* not a URL */
  }
  return null;
}

// ======================== Copy icon ========================

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 4h8v8H4V4zm-2-2v12h12V2H2zm1 1h10v10H3V3z" />
    <path d="M6 0H0v6h1V1h5V0z" opacity={0.5} />
  </svg>
);

const CopyableValue: React.FC<{
  copyText: string;
  children: React.ReactNode;
}> = ({ copyText, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(copyText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    },
    [copyText],
  );

  return (
    <span className="jsontree-value-wrapper">
      {children}
      <button
        className="jsontree-copy-btn"
        onClick={handleCopy}
        title="Copy value"
      >
        <CopyIcon />
      </button>
      {copied && <span className="jsontree-copied-toast">Copied!</span>}
    </span>
  );
};

// ======================== Color swatch ========================

const ColorPreview: React.FC<{
  color: string;
  valueAsString: string;
}> = ({ color, valueAsString }) => (
  <CopyableValue copyText={color}>
    <span className="jsontree-color-preview">
      <span
        className="jsontree-color-swatch"
        style={{ backgroundColor: color }}
      />
      {valueAsString}
    </span>
  </CopyableValue>
);

// ======================== Image hover preview ========================

const ImagePreview: React.FC<{
  url: string;
  valueAsString: string;
}> = ({ url, valueAsString }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [imgError, setImgError] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const showPreview = useCallback(() => {
    if (imgError) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - 320),
      });
    }
    setVisible(true);
  }, [imgError]);

  const hidePreview = useCallback(() => setVisible(false), []);

  const fullUrl =
    url.startsWith("http") || url.startsWith("data:") ? url : `https://${url}`;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        window.postMessage({ type: "openUrl", url: fullUrl }, "*");
      }
    },
    [fullUrl],
  );

  return (
    <CopyableValue copyText={url}>
      <span
        ref={triggerRef}
        className="jsontree-image-trigger"
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        onClick={handleClick}
        title="Hover to preview · Cmd+click to open in browser"
      >
        {valueAsString}
      </span>
      {!imgError && (
        <div
          className={`jsontree-image-popup ${visible ? "visible" : ""}`}
          style={{ top: position.top, left: position.left }}
        >
          <img src={fullUrl} alt="Preview" onError={() => setImgError(true)} />
        </div>
      )}
    </CopyableValue>
  );
};

// ======================== Markdown block ========================

const MarkdownBlock: React.FC<{ raw: string; normalized: string }> = ({
  raw,
  normalized,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(raw).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    },
    [raw],
  );

  return (
    <div className="jsontree-markdown-wrapper">
      <button
        className="jsontree-markdown-copy"
        onClick={handleCopy}
        title="Copy raw value"
      >
        {copied ? (
          <span style={{ color: "#4ec9b0", fontSize: "10px" }}>✓</span>
        ) : (
          <CopyIcon />
        )}
      </button>
      <div className="jsontree-markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalized}</ReactMarkdown>
      </div>
    </div>
  );
};

function normalizeMarkdown(value: string): string {
  return value
    .split("\n")
    .map((line, i, arr) => {
      const next = arr[i + 1];
      if (line.trim() === "" || next === undefined || next.trim() === "")
        return line;
      if (/^(\*|#|-|>|\d+\.)/.test(next.trim())) return line;
      return line + "  ";
    })
    .join("\n");
}

// ======================== Main ValueRenderer ========================

export const ValueRenderer: React.FC<ValueRendererProps> = ({
  value,
  valueAsString,
  keyPath,
  detectors,
  theme,
  forceMarkdown = false,
}) => {
  const detection = useMemo(() => {
    return runDetectors(value, keyPath, detectors);
  }, [value, keyPath, detectors]);

  const displayString = String(valueAsString);

  const copyValue = useMemo(() => {
    if (typeof value === "string") return value;
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    return String(value);
  }, [value]);

  // 1. Forced Markdown (highest priority, controlled by TreeViewer toggle)
  if (forceMarkdown && typeof value === "string") {
    const rawVal = detection?.raw ?? value;
    const normalized = normalizeMarkdown(rawVal);
    return <MarkdownBlock raw={rawVal} normalized={normalized} />;
  }

  // 2. Detected types (UUID, datetime, custom)
  if (detection) {
    if (detection.type === "uuid") {
      return (
        <CopyableValue copyText={detection.raw}>
          <UuidBadge
            value={detection.raw}
            color={detection.color}
            tooltip={detection.tooltip}
          />
        </CopyableValue>
      );
    }

    if (detection.type === "datetime") {
      return (
        <CopyableValue copyText={copyValue}>
          <DatetimeTooltip
            value={displayString}
            color={detection.color}
            tooltip={detection.tooltip ?? ""}
            date={detection.parsed as Date}
            theme={theme}
          />
        </CopyableValue>
      );
    }

    // Skip markdown or multiline hints if forceMarkdown is false,
    // let them fall through to default string rendering so the user can easily view raw text.
    if (detection.type !== "markdown" && detection.type !== "multiline_hint") {
      // Custom rules
      return (
        <CopyableValue copyText={copyValue}>
          <span
            className={detection.className}
            style={{ color: detection.color }}
            title={detection.tooltip}
          >
            {displayString}
          </span>
        </CopyableValue>
      );
    }
  }

  // 3. Color preview
  const colorValue = isColorValue(value);
  if (colorValue) {
    return <ColorPreview color={colorValue} valueAsString={displayString} />;
  }

  // 3. Image URL hover preview
  const imgUrl = isImageUrl(value);
  if (imgUrl) {
    return <ImagePreview url={imgUrl} valueAsString={displayString} />;
  }

  // 5. Default
  return (
    <CopyableValue copyText={copyValue}>
      <span>{displayString}</span>
    </CopyableValue>
  );
};
