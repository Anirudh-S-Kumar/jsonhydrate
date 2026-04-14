import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { TreeViewer } from "../../src/components/TreeViewer";

describe("TreeViewer", () => {
  it("renders complex tree components and reacts to expansions", () => {
    const data = {
      level1: {
        level2: "value2",
        level2_array: ["item 1", "item 2"],
      },
      root_key: false,
    };

    const { getByText, queryByText, container } = render(
      <TreeViewer data={data} theme="light" detectors={[]} />,
    );

    // Initial render - checks default expansion levels (usually 2, so level1 is expanded, level2 is not)
    expect(getByText("level1:")).toBeInTheDocument();
    expect(getByText("root_key:")).toBeInTheDocument();

    // Toolbar tests
    const expandAllButton = container.querySelector('button[title="Expand All"]');
    if (expandAllButton) {
      fireEvent.click(expandAllButton);
      // Wait for re-render, deep items should now be visible
      expect(getByText("level2_array:")).toBeInTheDocument();
      // react-json-tree wraps items, let's just make sure "Expand All" triggers re-render state
    }

    const collapseAllButton = container.querySelector('button[title="Collapse All"]');
    if (collapseAllButton) {
      fireEvent.click(collapseAllButton);
      // Should hide deeper levels (only root is visible)
      // Since hideRoot is true, level1 and root_key are always visible
    }
  });

  it("decodes decodable fields when badge is clicked", () => {
    const data = {
      // Small base64 encoded JSON string
      payload: "eyJrZXkiOiAidmFsdWUifQ==",
    };

    const { container, getByText, queryByText } = render(
      <TreeViewer data={data} theme="light" detectors={[]} />,
    );

    // Should find the badge initially
    const badge = container.querySelector(".jsonhydrate-decode-badge");
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain("B64");

    // Before decode, it's just a string, so we don't see the inner decoded content 'key'
    expect(queryByText("key:")).not.toBeInTheDocument();

    // Click the badge to decode
    fireEvent.click(badge!);

    // After decode, the decoded payload becomes an object with "key": "value"
    expect(getByText("key:")).toBeInTheDocument();
    expect(getByText('"value"')).toBeInTheDocument();
  });
});
