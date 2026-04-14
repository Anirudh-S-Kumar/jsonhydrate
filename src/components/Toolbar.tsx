import React from "react";

interface ToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExpandDefault: () => void;
  onDecodeAll?: () => void;
  onUndecodeAll?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExpandAll,
  onCollapseAll,
  onExpandDefault,
  onDecodeAll,
  onUndecodeAll,
}) => {
  return (
    <div className="jsonhydrate-toolbar">
      <button className="jsonhydrate-toolbar-btn" onClick={onExpandAll} title="Expand all nodes">
        Expand All
      </button>
      <button className="jsonhydrate-toolbar-btn" onClick={onCollapseAll} title="Collapse all nodes">
        Collapse All
      </button>
      <button
        className="jsonhydrate-toolbar-btn"
        onClick={onExpandDefault}
        title="Reset to default depth"
      >
        Reset
      </button>
      {(onDecodeAll || onUndecodeAll) && (
        <>
          <div className="jsonhydrate-toolbar-separator" />
          {onDecodeAll && (
            <button
              className="jsonhydrate-toolbar-btn jsonhydrate-toolbar-btn-decode"
              onClick={onDecodeAll}
              title="Decode all JWT, Base64, and stringified JSON values"
            >
              🔓 Decode All
            </button>
          )}
          {onUndecodeAll && (
            <button
              className="jsonhydrate-toolbar-btn"
              onClick={onUndecodeAll}
              title="Show all raw values"
            >
              Show Raw
            </button>
          )}
        </>
      )}
    </div>
  );
};
