import React, { useCallback } from "react";

interface LabelRendererProps {
  keyPath: readonly (string | number)[];
  nodeType: string;
  expanded?: boolean;
  expandable?: boolean;
  onLabelClick?: (jsonPath: (string | number)[]) => void;
}

export const LabelRenderer: React.FC<LabelRendererProps> = ({
  keyPath,
  nodeType,
  onLabelClick,
}) => {
  const key = keyPath[0];
  const isArrayIndex = typeof key === "number";

  const style: React.CSSProperties = {
    fontWeight: nodeType === "Object" || nodeType === "Array" ? 600 : 400,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onLabelClick) {
        // keyPath is reversed (leaf first), so reverse it for a proper JSON path
        const jsonPath = [...keyPath].reverse();
        onLabelClick(jsonPath);
      }
    },
    [keyPath, onLabelClick],
  );

  return (
    <span className="jsonhydrate-label" style={style} onClick={handleClick}>
      {isArrayIndex ? key : String(key)}:
    </span>
  );
};
