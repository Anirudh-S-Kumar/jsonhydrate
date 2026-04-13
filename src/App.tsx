import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createDetectors, type IValueDetector, type SettingsPayload } from "./detectors";
import { TreeViewer } from "./components/TreeViewer";

declare global {
  interface Window {
    acquireVsCodeApi?: () => { postMessage: (msg: unknown) => void };
  }
}

function getTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  const body = document.body;
  const kind = body.getAttribute("data-vscode-theme-kind");
  if (kind?.includes("light") || body.classList.contains("vscode-light")) return "light";
  return "dark";
}

// Acquire the VS Code API once at module level
const vscodeApi = typeof window !== "undefined" ? window.acquireVsCodeApi?.() : null;

const App: React.FC = () => {
  const [json, setJson] = useState("{}");
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(getTheme());

  const detectors: IValueDetector[] = useMemo(() => {
    return createDetectors(settings ?? undefined, theme);
  }, [settings, theme]);

  const parsedJson = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      setParseError(null);
      return parsed;
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
      return null;
    }
  }, [json]);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data;
    if (!data) return;

    if (data.type === "json" && typeof data.json === "string") {
      setJson(data.json);
    } else if (data.type === "settings" && data.settings) {
      setSettings(data.settings as SettingsPayload);
    }
    // Legacy format (no type field) — treat as json
    else if (typeof data.json === "string" && !data.type) {
      setJson(data.json);
    }

    // Handle navigateToKey from child components (posted via window.postMessage)
    if (data.type === "navigateToKey" && data.path) {
      vscodeApi?.postMessage({ type: "navigateToKey", path: data.path });
    }
    // Handle openUrl requests
    if (data.type === "openUrl" && typeof data.url === "string") {
      vscodeApi?.postMessage({ type: "openUrl", url: data.url });
    }
  }, []);

  useEffect(() => {
    vscodeApi?.postMessage("ready");

    // Initial sync
    setTheme(getTheme());

    // Watch for VS Code theme changes
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-vscode-theme-kind"] });

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      observer.disconnect();
    };
  }, [handleMessage]);

  if (parseError) {
    return (
      <div className="jsontree-error">
        <div className="jsontree-error-icon">⚠️</div>
        <div className="jsontree-error-title">Invalid JSON</div>
        <div className="jsontree-error-message">{parseError}</div>
      </div>
    );
  }

  if (parsedJson === null) {
    return (
      <div className="jsontree-empty">
        <div className="jsontree-empty-message">No data to display</div>
      </div>
    );
  }

  return (
    <div className={`jsontree-root jsontree-${theme}`}>
      <TreeViewer
        data={parsedJson}
        theme={theme}
        detectors={detectors}
        settings={settings ?? undefined}
      />
    </div>
  );
};

export default App;
