"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { analyzeJobMatch, analyzeSkillGap } from "@/lib/ai-job-match";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

/**
 * Create a new job match analysis
 */
export async function createJobMatch(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Rate limiting: 5 analyses per minute
  const rateLimitResult = rateLimit(userId, "jobMatch", {
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    const waitSeconds = Math.ceil(rateLimitResult.remainingMs / 1000);
    throw new Error(
      `Rate limit exceeded. Please wait ${waitSeconds} seconds before analyzing another job.`
    );
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume) throw new Error("Please create a resume first");

  const { jobTitle, companyName, jobDescription } = data;

  if (!jobTitle || !companyName || !jobDescription) {
    throw new Error(
      "Job title, company name, and job description are required"
    );
  }

  try {
    // Perform AI analysis
    const analysis = await analyzeJobMatch(
      user.resume.content,
      jobDescription,
      jobTitle,
      companyName,
      user.id
    );

    // Save to database
    const jobMatch = await db.jobMatch.create({
      data: {
        userId: user.id,
        jobTitle,
        companyName,
        jobDescription,
        atsScore: analysis.atsScore,
        matchPercentage: analysis.matchPercentage,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
        suggestions: analysis.suggestions,
        alignmentNotes: analysis.alignmentNotes,
        improvementTips: analysis.improvementTips,
        resumeSnapshot: user.resume.content,
      },
    });

    revalidatePath("/job-match");
    return jobMatch;
  } catch (error) {
    console.error("Error creating job match:", error);
    throw new Error(`Failed to analyze job match: ${error.message}`);
  }
}

/**
 * Get all job matches for the current user
 */
export async function getJobMatches() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const matches = await db.jobMatch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent
    });

    return matches;
  } catch (error) {
    console.error("Error fetching job matches:", error);
    throw new Error("Failed to fetch job matches");
  }
}

/**
 * Get a specific job match by ID
 */
export async function getJobMatchById(matchId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const match = await db.jobMatch.findUnique({
      where: {
        id: matchId,
        userId: user.id,
      },
    });

    if (!match) throw new Error("Job match not found");

    return match;
  } catch (error) {
    console.error("Error fetching job match:", error);
    throw new Error("Failed to fetch job match");
  }
}

/**
 * Delete a job match
 */
export async function deleteJobMatch(matchId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    await db.jobMatch.delete({
      where: {
        id: matchId,
        userId: user.id,
      },
    });

    revalidatePath("/job-match");
    return { success: true };
  } catch (error) {
    console.error("Error deleting job match:", error);
    throw new Error("Failed to delete job match");
  }
}

/**
 * Get skill gap analysis for a job description
 */
export async function getSkillGapAnalysis(jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Rate limiting: 10 analyses per minute
  const rateLimitResult = rateLimit(userId, "skillGap", {
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    const waitSeconds = Math.ceil(rateLimitResult.remainingMs / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds.`);
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const analysis = await analyzeSkillGap(user.skills || [], jobDescription);
    return analysis;
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    throw new Error("Failed to analyze skill gap");
  }
}

/**
 * Get statistics for user's job matches
 */
export async function getJobMatchStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const matches = await db.jobMatch.findMany({
      where: { userId: user.id },
      select: {
        atsScore: true,
        matchPercentage: true,
        createdAt: true,
      },
    });

    if (matches.length === 0) {
      return {
        totalMatches: 0,
        averageAtsScore: 0,
        averageMatchPercentage: 0,
        highestAtsScore: 0,
        lowestAtsScore: 0,
      };
    }

    const avgAts =
      matches.reduce((sum, m) => sum + m.atsScore, 0) / matches.length;
    const avgMatch =
      matches.reduce((sum, m) => sum + m.matchPercentage, 0) / matches.length;

    return {
      totalMatches: matches.length,
      averageAtsScore: Math.round(avgAts),
      averageMatchPercentage: Math.round(avgMatch),
      highestAtsScore: Math.max(...matches.map((m) => m.atsScore)),
      lowestAtsScore: Math.min(...matches.map((m) => m.atsScore)),
    };
  } catch (error) {
    console.error("Error fetching job match stats:", error);
    throw new Error("Failed to fetch statistics");
  }
}
