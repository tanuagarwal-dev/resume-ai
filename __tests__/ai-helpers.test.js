import { describe, it, expect } from "vitest";

// Simulating lib/ai helper functions for testing
function stripCodeFences(text) {
  return text
    .replace(/```(?:json)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();
}

describe("AI Helper Utilities", () => {
  describe("stripCodeFences", () => {
    it("removes json code fence", () => {
      const input = "```json\n{}\n```";
      expect(stripCodeFences(input)).toBe("{}");
    });

    it("removes generic code fence", () => {
      const input = "```\n{}\n```";
      expect(stripCodeFences(input)).toBe("{}");
    });

    it("removes multiple fences", () => {
      const input = "```json\n{}\n```\nmore text";
      expect(stripCodeFences(input)).toBe("{}\nmore text");
    });

    it("handles no fences", () => {
      const input = "{}";
      expect(stripCodeFences(input)).toBe("{}");
    });

    it("trims whitespace", () => {
      const input = "  ```json\n{}\n```  ";
      expect(stripCodeFences(input)).toBe("{}");
    });
  });
});
