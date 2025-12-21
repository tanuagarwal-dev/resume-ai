import { describe, it, expect } from "vitest";
import { quizSchema, insightsSchema } from "../lib/ai-schemas.js";

describe("quizSchema", () => {
  it("accepts valid quiz JSON", () => {
    const data = {
      questions: Array.from({ length: 10 }).map((_, i) => ({
        question: `Q${i}`,
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Because",
      })),
    };
    const res = quizSchema.safeParse(data);
    expect(res.success).toBe(true);
  });

  it("rejects invalid options length", () => {
    const data = {
      questions: [{ question: "Q", options: ["A"], correctAnswer: "A" }],
    };
    const res = quizSchema.safeParse(data);
    expect(res.success).toBe(false);
  });
});

describe("insightsSchema", () => {
  it("accepts valid insights JSON", () => {
    const data = {
      salaryRanges: Array.from({ length: 5 }).map((_, i) => ({
        role: `Role${i}`,
        min: 1,
        max: 2,
        median: 1.5,
      })),
      growthRate: 5.5,
      demandLevel: "High",
      topSkills: ["a", "b", "c", "d", "e"],
      marketOutlook: "Positive",
      keyTrends: ["t1", "t2", "t3", "t4", "t5"],
      recommendedSkills: ["s1", "s2", "s3", "s4", "s5"],
    };
    const res = insightsSchema.safeParse(data);
    expect(res.success).toBe(true);
  });
});
