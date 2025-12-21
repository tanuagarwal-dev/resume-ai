import { describe, it, expect } from "vitest";
import { stripCodeFences } from "../lib/ai.js";

describe("stripCodeFences", () => {
  it("removes triple backticks and json hint", () => {
    const input = '```json\n{ "a": 1 }\n```';
    const out = stripCodeFences(input);
    expect(out).toBe('{ "a": 1 }');
  });

  it("handles plain fenced block", () => {
    const input = "```\nhello\n```";
    const out = stripCodeFences(input);
    expect(out).toBe("hello");
  });

  it("returns trimmed content without fences", () => {
    const input = '  {"b":2}  ';
    const out = stripCodeFences(input);
    expect(out).toBe('{"b":2}');
  });
});
