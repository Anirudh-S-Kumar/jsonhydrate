import { describe, it, expect } from "vitest";
import { transformData } from "../src/transformData";

describe("transformData", () => {
  it("does nothing to normal objects if no paths are decoded", () => {
    const data = { hello: "world", count: 42 };
    const result = transformData(data, new Set());

    expect(result.data).toEqual(data);
    expect(result.decodables).toHaveLength(0);
  });

  it("identifies base64 encoded strings as decodables", () => {
    // Valid JSON base64: eyJrZXkiOiAidmFsdWUifQ== ({"key": "value"})
    const data = { token: "eyJrZXkiOiAidmFsdWUifQ==" };
    const result = transformData(data, new Set());

    expect(result.decodables).toHaveLength(1);
    expect(result.decodables[0]).toEqual({
      path: "token",
      type: "base64",
      raw: "eyJrZXkiOiAidmFsdWUifQ==",
    });
    // Data should remain unchanged if path is not in decodedPaths
    expect(result.data).toEqual(data);
  });

  it("decodes identified paths", () => {
    const data = { token: "eyJrZXkiOiAidmFsdWUifQ==" };
    const result = transformData(data, new Set(["token"]));

    expect(result.decodables).toHaveLength(1);
    // When decoded, the transformed data should contain the decoded payload
    expect(result.data).toEqual({ token: { key: "value" } });
  });

  it("identifies and can decode multiline formatted text (markdown)", () => {
    const data = { text: "Line 1\nLine 2\nLine 3" };

    // 1. Should identify it
    const identifyResult = transformData(data, new Set());
    expect(identifyResult.decodables).toHaveLength(1);
    expect(identifyResult.decodables[0].type).toBe("multiline");

    // 2. Multiline decoding generally leaves the string intact so the ValueRenderer can do Markdown parsing.
    const decodeResult = transformData(data, new Set(["text"]));
    expect(decodeResult.data).toEqual({ text: "Line 1\nLine 2\nLine 3" });
  });
  it("identifies and decodes nested Gzip data", async () => {
    // Generate valid gzip of JSON
    const dataObj = { msg: "Hello from Gzip!" };
    const bytes = new TextEncoder().encode(JSON.stringify(dataObj));
    const { gzipSync } = await import("fflate");
    const compressed = gzipSync(bytes);

    // Polyfill buffer to base64 encoding for browsers/jsdom
    let binary = "";
    for (let i = 0; i < compressed.byteLength; i++) {
      binary += String.fromCharCode(compressed[i]);
    }
    const base64 = btoa(binary);

    const rootData = { my_gzip: base64 };

    // 1. Identification
    const identifyResult = transformData(rootData, new Set());
    expect(identifyResult.decodables).toHaveLength(1);
    expect(identifyResult.decodables[0]).toEqual({
      path: "my_gzip",
      type: "gzip",
      raw: base64,
    });

    // 2. Decoding
    const decodeResult = transformData(rootData, new Set(["my_gzip"]));
    expect(decodeResult.data).toEqual({ my_gzip: { msg: "Hello from Gzip!" } });
  });

  it("identifies markdown by keyword even if it's on a single line", () => {
    const data = { notes: "This is some **important** content." };
    const settings = {
      markdown: { keyHints: ["notes"] },
      uuid: { enabled: true, color: "", additionalPatterns: [] },
      datetime: {
        enabled: true,
        color: "",
        keyHints: [],
        unixRangeMin: 0,
        unixRangeMax: 4102444800,
      },
      customRules: [],
    } as any;

    const result = transformData(data, new Set(), "", settings);

    expect(result.decodables).toHaveLength(1);
    expect(result.decodables[0]).toEqual({
      path: "notes",
      type: "multiline",
      raw: "This is some **important** content.",
      autoRender: false,
    });
  });

  it("identifies markdown by header (#) even on a single line", () => {
    const data = { content: "# Quick Header" };
    const result = transformData(data, new Set());

    expect(result.decodables).toHaveLength(1);
    expect(result.decodables[0]).toEqual({
      path: "content",
      type: "multiline",
      raw: "# Quick Header",
      autoRender: true,
    });
  });
});
