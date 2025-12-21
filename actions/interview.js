"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiJson, aiText } from "@/lib/ai";
import { quizSchema } from "@/lib/ai-schemas";
import { rateLimit } from "@/lib/rateLimit";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check rate limit
  const limitResult = rateLimit(userId, "generateQuiz", {
    limit: 3,
    windowMs: 60000,
  });
  if (!limitResult.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil(
        limitResult.remainingMs / 1000
      )} seconds.`
    );
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return ONLY valid JSON, no markdown or additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string (must match one of options)",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const quiz = await aiJson(prompt, quizSchema, { retries: 2 });
    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions. Please try again.");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers for improvement tips
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Generate improvement tip if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map((q) => `- ${q.question} (You answered: ${q.userAnswer})`)
      .join("\n");

    const improvementPrompt = `A user answered these questions incorrectly in an interview prep quiz:

${wrongQuestionsText}

Based on these mistakes, provide a concise, specific improvement tip.
Focus on the knowledge gaps revealed by these wrong answers.
Keep the response under 2 sentences and make it encouraging.
Don't explicitly mention the mistakes, instead focus on what to learn/practice.`;

    try {
      improvementTip = await aiText(improvementPrompt, { retries: 1 });
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip: improvementTip || undefined,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
