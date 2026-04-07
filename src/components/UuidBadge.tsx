import React from "react";

interface UuidBadgeProps {
  value: string;
  color: string;
  tooltip?: string;
}

export const UuidBadge: React.FC<UuidBadgeProps> = ({ value, color, tooltip }) => {
  return (
    <span className="jsontree-uuid" style={{ color }} title={tooltip}>
      &quot;{value}&quot;
    </span>
  );
};
