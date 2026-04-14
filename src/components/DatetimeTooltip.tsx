import React, { useCallback, useEffect, useRef, useState } from "react";

interface DatetimeTooltipProps {
  value: string;
  color: string;
  tooltip: string;
  date: Date;
  theme: "light" | "dark";
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

const CopyRowIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10, flexShrink: 0 }}>
    <path d="M4 4h8v8H4V4zm-2-2v12h12V2H2zm1 1h10v10H3V3z" />
    <path d="M6 0H0v6h1V1h5V0z" opacity={0.5} />
  </svg>
);

const TooltipRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      });
    },
    [value],
  );

  return (
    <div className="jsonhydrate-tooltip-row" onClick={handleCopy} title={`Click to copy: ${value}`}>
      <span className="jsonhydrate-tooltip-label">{label}</span>
      <span className="jsonhydrate-tooltip-value">
        {copied ? (
          <span style={{ color: "#4ec9b0", fontWeight: 600 }}>✓ Copied</span>
        ) : (
          <>
            {value}
            <span className="jsonhydrate-tooltip-copy-icon">
              <CopyRowIcon />
            </span>
          </>
        )}
      </span>
    </div>
  );
};

export const DatetimeTooltip: React.FC<DatetimeTooltipProps> = ({ value, color, date }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 60); // 60ms grace period — fast enough to avoid overlapping tooltips
  }, [cancelHide]);

  const showTooltip = useCallback(() => {
    cancelHide();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setVisible(true);
  }, [cancelHide]);

  // Reposition if it goes off-screen
  useEffect(() => {
    if (visible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      if (rect.right > viewportWidth - 8) {
        left = viewportWidth - rect.width - 8;
      }
      if (rect.bottom > viewportHeight - 8) {
        if (triggerRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          top = triggerRect.top - rect.height - 4;
        }
      }

      if (top !== position.top || left !== position.left) {
        setPosition({ top, left });
      }
    }
  }, [visible, position]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const rows = [
    { label: "Local", value: date.toLocaleString() },
    { label: "UTC", value: date.toISOString() },
    { label: "Relative", value: relativeTime(date) },
    { label: "Unix (s)", value: String(Math.floor(date.getTime() / 1000)) },
    { label: "Unix (ms)", value: String(date.getTime()) },
  ];

  return (
    <>
      <span
        ref={triggerRef}
        className="jsonhydrate-datetime"
        style={{ color }}
        onMouseEnter={showTooltip}
        onMouseLeave={scheduleHide}
      >
        {value}
      </span>
      <div
        ref={tooltipRef}
        className={`jsonhydrate-tooltip ${visible ? "visible" : ""}`}
        style={{ top: position.top, left: position.left }}
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      >
        <div className="jsonhydrate-tooltip-card">
          <div className="jsonhydrate-tooltip-header">📅 Datetime</div>
          {rows.map((row) => (
            <TooltipRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </div>
    </>
  );
};
