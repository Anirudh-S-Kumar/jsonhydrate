import * as path from "path";
import * as vscode from "vscode";
import { createWebviewPanel } from "./webview.js";

function getPanelTitle(document?: vscode.TextDocument) {
  if (!document) return "JSON Tree";
  const fileName = path.basename(document.fileName);
  return fileName ? `🌳 ${fileName}` : "JSON Tree";
}

function getSettings(): Record<string, unknown> {
  const config = vscode.workspace.getConfiguration("jsontree");
  return {
    uuid: {
      enabled: config.get<boolean>("uuid.enabled", true),
      color: config.get<string>("uuid.color", "#c792ea"),
      additionalPatterns: config.get<string[]>("uuid.additionalPatterns", []),
    },
    datetime: {
      enabled: config.get<boolean>("datetime.enabled", true),
      color: config.get<string>("datetime.color", "#ffcb6b"),
      keyHints: config.get<string[]>("datetime.keyHints", [
        "time",
        "date",
        "created",
        "updated",
        "timestamp",
        "_at",
        "_on",
        "epoch",
        "expires",
        "modified",
      ]),
      unixRangeMin: config.get<number>("datetime.unixRangeMin", 0),
      unixRangeMax: config.get<number>("datetime.unixRangeMax", 4102444800),
    },
    markdown: {
      keyHints: config.get<string[]>("markdown.keyHints", [
        "markdown",
        "description",
        "notes",
        "summary",
        "comment",
        "readme",
        "md",
      ]),
      autoRender: config.get<boolean>("markdown.autoRender", true),
    },
    customRules: config.get<unknown[]>("customRules", []),
  };
}

/**
 * Given a JSON path like ["user", "name"], find the position of that key
 * in the document text and reveal it in the editor.
 */
function navigateToJsonPath(editor: vscode.TextEditor | undefined, jsonPath: (string | number)[]) {
  if (!editor || !jsonPath || jsonPath.length === 0) return;

  const document = editor.document;
  const text = document.getText();

  // Strategy: walk through the path segments and find each key in order.
  // We search for `"keyName"` patterns sequentially.
  let searchFrom = 0;

  for (let i = 0; i < jsonPath.length; i++) {
    const segment = jsonPath[i];

    if (typeof segment === "string") {
      // Search for "key": pattern
      const pattern = `"${segment}"`;
      let idx = text.indexOf(pattern, searchFrom);

      // If we didn't find it from searchFrom, it might be because
      // the path has repeated keys at different levels.
      // Search more specifically by scanning only within the right nesting level.
      if (idx === -1) {
        idx = text.indexOf(pattern);
      }

      if (idx === -1) continue;

      searchFrom = idx + pattern.length;

      // On the last segment, reveal this position
      if (i === jsonPath.length - 1) {
        const pos = document.positionAt(idx);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
      }
    } else if (typeof segment === "number") {
      // Array index — we need to find the Nth element after the current position.
      // Find the opening [ then skip `segment` commas at the same nesting level.
      const bracketIdx = text.indexOf("[", searchFrom);
      if (bracketIdx === -1) continue;

      let pos = bracketIdx + 1;
      let depth = 0;
      let count = 0;
      let targetStart = pos;

      while (pos < text.length && count <= segment) {
        const ch = text[pos];
        if (ch === "{" || ch === "[") depth++;
        if (ch === "}" || ch === "]") {
          if (depth === 0) break;
          depth--;
        }
        if (ch === "," && depth === 0) {
          count++;
          if (count === segment) {
            targetStart = pos + 1;
          }
        }
        if (count === 0 && segment === 0) {
          targetStart = bracketIdx + 1;
        }
        pos++;
      }

      searchFrom = targetStart;

      if (i === jsonPath.length - 1) {
        const docPos = document.positionAt(targetStart);
        editor.selection = new vscode.Selection(docPos, docPos);
        editor.revealRange(new vscode.Range(docPos, docPos), vscode.TextEditorRevealType.InCenter);
      }
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("jsontree.open", () => createWebviewForActiveEditor(context)),
    vscode.commands.registerCommand("jsontree.openSelected", () =>
      createWebviewForSelectedText(context),
    ),
  );
}

function createWebviewForSelectedText(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.selection.isEmpty) {
    vscode.window.showInformationMessage("Please select some text first!");
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  const panel = createWebviewPanel(context, getPanelTitle(editor.document));

  const onReceiveMessage = panel.webview.onDidReceiveMessage((e) => {
    if (e === "ready") {
      panel.webview.postMessage({ type: "json", json: selectedText });
      panel.webview.postMessage({ type: "settings", settings: getSettings() });
    }
    if (e?.type === "navigateToKey" && e.path) {
      navigateToJsonPath(editor, e.path);
    }
    if (e?.type === "openUrl" && typeof e.url === "string") {
      vscode.env.openExternal(vscode.Uri.parse(e.url));
    }
  });

  const onTextChange = vscode.workspace.onDidChangeTextDocument((changeEvent) => {
    if (changeEvent.document === editor.document) {
      const newText = editor.document.getText(editor.selection);
      if (newText) {
        panel.webview.postMessage({ type: "json", json: newText });
      }
    }
  });

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("jsontree")) {
      panel.webview.postMessage({ type: "settings", settings: getSettings() });
    }
  });

  panel.onDidDispose(
    () => {
      onTextChange.dispose();
      onReceiveMessage.dispose();
      onConfigChange.dispose();
    },
    null,
    context.subscriptions,
  );
}

function createWebviewForActiveEditor(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  const panel = createWebviewPanel(context, getPanelTitle(editor?.document));

  const onReceiveMessage = panel.webview.onDidReceiveMessage((e) => {
    if (e === "ready") {
      panel.webview.postMessage({ type: "json", json: editor?.document.getText() ?? "{}" });
      panel.webview.postMessage({ type: "settings", settings: getSettings() });
    }
    if (e?.type === "navigateToKey" && e.path) {
      navigateToJsonPath(editor, e.path);
    }
    if (e?.type === "openUrl" && typeof e.url === "string") {
      vscode.env.openExternal(vscode.Uri.parse(e.url));
    }
  });

  const onTextChange = vscode.workspace.onDidChangeTextDocument((changeEvent) => {
    if (changeEvent.document === editor?.document) {
      panel.webview.postMessage({ type: "json", json: changeEvent.document.getText() });
    }
  });

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("jsontree")) {
      panel.webview.postMessage({ type: "settings", settings: getSettings() });
    }
  });

  panel.onDidDispose(
    () => {
      onTextChange.dispose();
      onReceiveMessage.dispose();
      onConfigChange.dispose();
    },
    null,
    context.subscriptions,
  );
}

export function deactivate() {}
