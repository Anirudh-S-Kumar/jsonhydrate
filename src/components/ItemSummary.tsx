import React, { useCallback, useState } from "react";

// --- Inline CopyIcon used in item summary ---
const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 11, height: 11 }}>
    <path d="M4 4h8v8H4V4zm-2-2v12h12V2H2zm1 1h10v10H3V3z" />
    <path d="M6 0H0v6h1V1h5V0z" opacity={0.5} />
  </svg>
);

export const ItemSummary: React.FC<{
  type: string;
  data: unknown;
}> = ({ type, data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    },
    [data],
  );

  let label: string;
  if (type === "Object" && data && typeof data === "object" && !Array.isArray(data)) {
    const count = Object.keys(data as Record<string, unknown>).length;
    label = `{} ${count} key${count !== 1 ? "s" : ""}`;
  } else if (type === "Array" && Array.isArray(data)) {
    label = `[] ${data.length} item${data.length !== 1 ? "s" : ""}`;
  } else {
    label = type;
  }

  return (
    <span className="jsontree-item-summary jsontree-value-wrapper">
      {label}
      <button className="jsontree-copy-btn" onClick={handleCopy} title="Copy as JSON">
        <CopyIcon />
      </button>
      {copied && <span className="jsontree-copied-toast">Copied!</span>}
    </span>
  );
};
