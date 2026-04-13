import React, { useCallback, useMemo, useRef, useState } from "react";
import { JSONTree } from "react-json-tree";
import type { IValueDetector, SettingsPayload } from "../detectors";
import { getTreeTheme } from "../theme";
import { transformData, type DecodableEntry } from "../transformData";
import { LabelRenderer } from "./LabelRenderer.js";
import { Toolbar } from "./Toolbar.js";
import { ValueRenderer } from "./ValueRenderer.js";
import { runDetectors } from "../detectors/index.js";

interface TreeViewerProps {
  data: unknown;
  theme: "light" | "dark";
  detectors: IValueDetector[];
  settings?: SettingsPayload;
}

import { ItemSummary } from "./ItemSummary.js";
const DECODE_ICONS: Record<string, { icon: string; label: string }> = {
  jwt: { icon: "🔐", label: "JWT" },
  base64: { icon: "📦", label: "B64" },
  gzip: { icon: "🗜️", label: "Gzip" },
  "stringified-json": { icon: "📋", label: "JSON" },
  multiline: { icon: "📝", label: "Text" },
};

export const TreeViewer: React.FC<TreeViewerProps> = ({ data, theme, detectors, settings }) => {
  const overrides = settings?.theme ? settings.theme[theme] : undefined;
  const treeTheme = getTreeTheme(theme, overrides);
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandLevel, setExpandLevel] = useState<number | false>(2);
  const [treeKey, setTreeKey] = useState(0);
  const [decodedPaths, setDecodedPaths] = useState<Set<string>>(new Set());

  // Transform data based on which paths are decoded
  const { transformedData, decodables } = useMemo(() => {
    const result = transformData(data, decodedPaths, "", settings);
    return { transformedData: result.data, decodables: result.decodables };
  }, [data, decodedPaths, settings]);

  // Build a map of path → decodable entry for quick lookup
  const decodableMap = useMemo(() => {
    const map = new Map<string, DecodableEntry>();
    for (const d of decodables) {
      map.set(d.path, d);
    }
    return map;
  }, [decodables]);

  const toggleDecode = useCallback((path: string) => {
    setDecodedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandLevel(Infinity);
    setTreeKey((k) => k + 1);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandLevel(1);
    setTreeKey((k) => k + 1);
  }, []);

  const handleExpandDefault = useCallback(() => {
    setExpandLevel(2);
    setTreeKey((k) => k + 1);
  }, []);

  const decodeAll = useCallback(() => {
    const newPaths = new Set<string>();
    for (const d of decodables) {
      if (!(d.type === "multiline" && d.autoRender === true)) {
        newPaths.add(d.path);
      }
    }
    setDecodedPaths(newPaths);
  }, [decodables]);

  const undecodeAll = useCallback(() => {
    const newPaths = new Set<string>();
    for (const d of decodables) {
      if (d.type === "multiline" && d.autoRender === true) {
        newPaths.add(d.path);
      }
    }
    setDecodedPaths(newPaths);
  }, [decodables]);

  const canDecodeAll = useMemo(
    () =>
      decodables.some((d) => {
        const isAuto = d.type === "multiline" && d.autoRender === true;
        return isAuto ? decodedPaths.has(d.path) : !decodedPaths.has(d.path);
      }),
    [decodables, decodedPaths],
  );

  const canUndecodeAll = useMemo(
    () =>
      decodables.some((d) => {
        const isAuto = d.type === "multiline" && d.autoRender === true;
        return isAuto ? !decodedPaths.has(d.path) : decodedPaths.has(d.path);
      }),
    [decodables, decodedPaths],
  );

  const handleLabelClick = useCallback((jsonPath: (string | number)[]) => {
    window.postMessage({ type: "navigateToKey", path: jsonPath }, "*");
  }, []);

  return (
    <div ref={containerRef}>
      <Toolbar
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onExpandDefault={handleExpandDefault}
        onDecodeAll={canDecodeAll ? decodeAll : undefined}
        onUndecodeAll={canUndecodeAll ? undecodeAll : undefined}
      />
      <JSONTree
        key={treeKey}
        data={transformedData}
        hideRoot
        theme={treeTheme}
        invertTheme={false}
        shouldExpandNodeInitially={(_keyPath, _data, level) => {
          if (expandLevel === false) return false;
          return level < expandLevel;
        }}
        valueRenderer={(valueAsString, value, ...keyPath) => {
          // Build the path string from keyPath (which is reversed)
          const pathParts = [...keyPath].reverse();
          const pathStr = pathParts.join(".");
          const decodable = decodableMap.get(pathStr);
          const isDecoded = decodedPaths.has(pathStr);

          const isAutoMarkdown = decodable?.type === "multiline" && decodable.autoRender === true;

          let isRendered = isDecoded;
          if (isAutoMarkdown) {
            isRendered = !isDecoded;
          }

          const isDecodedMarkdown = isRendered && decodable?.type === "multiline";

          const badgeButton = decodable && (
            <button
              className={`jsontree-decode-badge${isRendered ? " active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleDecode(pathStr);
              }}
              title={
                isRendered
                  ? `Show raw ${DECODE_ICONS[decodable.type]?.label}`
                  : `Render ${DECODE_ICONS[decodable.type]?.label}`
              }
            >
              {DECODE_ICONS[decodable.type]?.icon}{" "}
              {isRendered ? "Raw" : DECODE_ICONS[decodable.type]?.label}
            </button>
          );

          return (
            <span>
              {isDecodedMarkdown && badgeButton}
              {isDecodedMarkdown && badgeButton && <br />}
              <ValueRenderer
                value={value}
                valueAsString={valueAsString}
                keyPath={keyPath}
                detectors={detectors}
                theme={theme}
                forceMarkdown={isDecodedMarkdown}
              />
              {!isDecodedMarkdown && badgeButton}
            </span>
          );
        }}
        labelRenderer={(keyPath, nodeType, expanded, expandable) => {
          // Check if this node is a decoded container
          const pathParts = [...keyPath].reverse();
          const pathStr = pathParts.join(".");
          const decodable = decodableMap.get(pathStr);

          return (
            <span>
              <LabelRenderer
                keyPath={keyPath}
                nodeType={nodeType}
                expanded={expanded}
                expandable={expandable}
                onLabelClick={handleLabelClick}
              />
              {decodable &&
                decodedPaths.has(pathStr) &&
                (nodeType === "Object" || nodeType === "Array") && (
                  <button
                    className="jsontree-decode-badge active"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDecode(pathStr);
                    }}
                    title={`Show raw ${DECODE_ICONS[decodable.type]?.label}`}
                  >
                    {DECODE_ICONS[decodable.type]?.icon} Raw
                  </button>
                )}
            </span>
          );
        }}
        getItemString={(type, data, _itemType, _itemString) => (
          <ItemSummary type={type} data={data} />
        )}
      />
    </div>
  );
};
