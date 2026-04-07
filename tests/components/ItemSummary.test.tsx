import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { ItemSummary } from "../../src/components/ItemSummary";

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("ItemSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for an Object", () => {
    const { getByText } = render(
      <ItemSummary type="Object" data={{ a: 1, b: 2 }} />
    );
    expect(getByText("{} 2 keys")).toBeInTheDocument();
  });

  it("renders correctly for an Array", () => {
    const { getByText } = render(
      <ItemSummary type="Array" data={[1, 2, 3]} />
    );
    expect(getByText("[] 3 items")).toBeInTheDocument();
  });

  it("copies JSON data to clipboard when copy button is clicked", async () => {
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
    
    const data = { hello: "world" };
    const { container, getByText } = render(
      <ItemSummary type="Object" data={data} />
    );

    const button = container.querySelector(".jsontree-copy-btn");
    expect(button).toBeInTheDocument();

    fireEvent.click(button!);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(data, null, 2));

    await waitFor(() => {
      expect(getByText("Copied!")).toBeInTheDocument();
    });
  });
});
