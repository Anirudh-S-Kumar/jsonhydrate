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
    <div className="jsontree-toolbar">
      <button className="jsontree-toolbar-btn" onClick={onExpandAll} title="Expand all nodes">
        Expand All
      </button>
      <button className="jsontree-toolbar-btn" onClick={onCollapseAll} title="Collapse all nodes">
        Collapse All
      </button>
      <button
        className="jsontree-toolbar-btn"
        onClick={onExpandDefault}
        title="Reset to default depth"
      >
        Reset
      </button>
      {(onDecodeAll || onUndecodeAll) && (
        <>
          <div className="jsontree-toolbar-separator" />
          {onDecodeAll && (
            <button
              className="jsontree-toolbar-btn jsontree-toolbar-btn-decode"
              onClick={onDecodeAll}
              title="Decode all JWT, Base64, and stringified JSON values"
            >
              🔓 Decode All
            </button>
          )}
          {onUndecodeAll && (
            <button
              className="jsontree-toolbar-btn"
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
