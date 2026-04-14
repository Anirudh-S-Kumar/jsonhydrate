import React, { useCallback, useState } from "react";

/**
 * A generic expandable value component.
 * Shows raw value by default, with a toggle to reveal decoded/expanded content.
 */
interface ExpandableValueProps {
  raw: string;
  rawDisplay: string;
  label: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}

export const ExpandableValue: React.FC<ExpandableValueProps> = ({
  raw,
  rawDisplay,
  label,
  icon,
  color,
  children,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  return (
    <span className="jsonhydrate-expandable">
      {expanded ? (
        <span className="jsonhydrate-expandable-content">
          <button
            className="jsonhydrate-expandable-toggle"
            onClick={toggle}
            title={`Hide decoded ${label}`}
          >
            {icon} ▲ Hide {label}
          </button>
          <div className="jsonhydrate-expandable-body">{children}</div>
        </span>
      ) : (
        <span className="jsonhydrate-expandable-collapsed">
          <span style={{ color }}>{rawDisplay}</span>
          <button className="jsonhydrate-expandable-toggle" onClick={toggle} title={`Decode ${label}`}>
            {icon} {label}
          </button>
        </span>
      )}
    </span>
  );
};
