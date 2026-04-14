import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { ValueRenderer } from "../../src/components/ValueRenderer";

describe("ValueRenderer", () => {
  it("renders basic strings directly", () => {
    const { getByText } = render(
      <ValueRenderer
        value="basic string"
        valueAsString="basic string"
        keyPath={["key"]}
        detectors={[]}
        theme="light"
      />,
    );
    expect(getByText("basic string")).toBeInTheDocument();
  });

  it("renders Markdown when multiline string is decoded", () => {
    const markdownStr = "# Heading 1\n\nSome **bold** text and code `const x = 5;`";
    const { container } = render(
      <ValueRenderer
        value={markdownStr}
        valueAsString={markdownStr}
        keyPath={["key"]}
        detectors={[]}
        theme="light"
        forceMarkdown={true}
      />,
    );

    // Assert that markdown wrapper logic is rendering
    expect(container.querySelector(".jsonhydrate-markdown-wrapper")).toBeInTheDocument();

    // Assert that H1 tag was produced
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe("Heading 1");

    // Assert that Strong tag was produced
    const strong = container.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe("bold");

    // Assert that Code tag was produced
    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe("const x = 5;");
  });

  it("handles Markdown without decoded flag incorrectly (acts as raw string)", () => {
    const markdownStr = "# Heading 1\n\nSome **bold** text";
    const { container } = render(
      <ValueRenderer
        value={markdownStr}
        valueAsString={markdownStr}
        keyPath={["key"]}
        detectors={[]}
        theme="light"
        forceMarkdown={false}
      />,
    );

    // Raw strings should not have markdown-wrapper
    expect(container.querySelector(".jsonhydrate-markdown-wrapper")).not.toBeInTheDocument();

    // The entire raw string text should simply be an inline span
    expect(container.querySelector("span")?.textContent).toBe(markdownStr);
  });
});
