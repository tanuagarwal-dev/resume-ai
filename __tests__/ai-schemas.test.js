import { describe, it, expect } from "vitest";
import { quizSchema, insightsSchema } from "@/lib/ai-schemas";

describe("AI Schemas", () => {
  describe("quizSchema", () => {
    it("accepts valid quiz data", () => {
      const validQuiz = {
        questions: [
          {
            question: "What is React?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
            explanation: "React is a JS library",
          },
          {
            question: "What is Node?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "B",
          },
          {
            question: "What is Express?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "C",
          },
          {
            question: "What is Prisma?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "D",
          },
          {
            question: "What is MongoDB?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
        ],
      };
      const result = quizSchema.safeParse(validQuiz);
      expect(result.success).toBe(true);
    });

    it("rejects quiz with less than 5 questions", () => {
      const invalidQuiz = {
        questions: [
          {
            question: "Q1?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
        ],
      };
      const result = quizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it("rejects quiz with invalid option count", () => {
      const invalidQuiz = {
        questions: Array(5).fill({
          question: "Q?",
          options: ["A", "B"],
          correctAnswer: "A",
        }),
      };
      const result = quizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });
  });

  describe("insightsSchema", () => {
    it("accepts valid insights data", () => {
      const validInsights = {
        salaryRanges: Array(5)
          .fill(null)
          .map((_, i) => ({
            role: `Role ${i}`,
            min: 50000,
            max: 150000,
            median: 100000,
            location: "Remote",
          })),
        growthRate: 8.5,
        demandLevel: "High",
        topSkills: ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
        marketOutlook: "Positive",
        keyTrends: ["Trend1", "Trend2", "Trend3", "Trend4", "Trend5"],
        recommendedSkills: [
          "RecommendSkill1",
          "RecommendSkill2",
          "RecommendSkill3",
          "RecommendSkill4",
          "RecommendSkill5",
        ],
      };
      const result = insightsSchema.safeParse(validInsights);
      expect(result.success).toBe(true);
    });

    it("rejects insights with fewer than 5 salary ranges", () => {
      const invalid = {
        salaryRanges: [{ role: "Dev", min: 50000, max: 100000, median: 75000 }],
        growthRate: 5,
        demandLevel: "High",
        topSkills: Array(5).fill("Skill"),
        marketOutlook: "Positive",
        keyTrends: Array(5).fill("Trend"),
        recommendedSkills: Array(5).fill("Skill"),
      };
      const result = insightsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects insights with invalid demandLevel", () => {
      const invalid = {
        salaryRanges: Array(5)
          .fill(null)
          .map((_, i) => ({
            role: `Role${i}`,
            min: 50000,
            max: 100000,
            median: 75000,
          })),
        growthRate: 5,
        demandLevel: "VeryHigh",
        topSkills: Array(5).fill("Skill"),
        marketOutlook: "Positive",
        keyTrends: Array(5).fill("Trend"),
        recommendedSkills: Array(5).fill("Skill"),
      };
      const result = insightsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
