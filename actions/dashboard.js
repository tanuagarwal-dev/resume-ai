"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiJson } from "@/lib/ai";
import { insightsSchema } from "@/lib/ai-schemas";
import { cacheGet, cacheSet } from "@/lib/cache";

export const generateAIInsights = async (industry, userSkills = []) => {
  const skillsContext =
    userSkills && userSkills.length > 0
      ? `User's current skills: ${userSkills.join(
          ", "
        )}. Prioritize recommendations based on complementing these existing skills.`
      : "";

  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          ${skillsContext}
          
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"],
            "skillGap": ["skill to learn 1", "skill to learn 2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills, trends, and learning recommendations.
          skillGap should list high-priority skills the user should learn (empty array if all top skills are already known).
        `;

  const cacheKey =
    userSkills && userSkills.length > 0
      ? `insights:${industry}:${userSkills.sort().join("-")}`
      : `insights:${industry}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const json = await aiJson(prompt, insightsSchema, { retries: 1 });
  // Cache for 6 hours
  cacheSet(cacheKey, json, 6 * 60 * 60 * 1000);
  return json;
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist or expired, generate them with user's skills for personalization
  const now = new Date();
  if (
    !user.industryInsight ||
    (user.industryInsight?.nextUpdate && now > user.industryInsight.nextUpdate)
  ) {
    const insights = await generateAIInsights(user.industry, user.skills);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
