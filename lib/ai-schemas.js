import { z } from "zod";

export const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
      })
    )
    .min(5),
});

export const insightsSchema = z.object({
  salaryRanges: z
    .array(
      z.object({
        role: z.string(),
        min: z.number(),
        max: z.number(),
        median: z.number(),
        location: z.string().optional(),
      })
    )
    .min(5),
  growthRate: z.number(),
  demandLevel: z.enum(["High", "Medium", "Low"]),
  topSkills: z.array(z.string()).min(5),
  marketOutlook: z.enum(["Positive", "Neutral", "Negative"]),
  keyTrends: z.array(z.string()).min(5),
  recommendedSkills: z.array(z.string()).min(5),
  skillGap: z.array(z.string()).default([]),
});
