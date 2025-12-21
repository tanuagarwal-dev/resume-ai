"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Precompute insights outside the transaction to avoid long-running work
    let precomputedInsights = null;
    const existingIndustry = await db.industryInsight.findUnique({
      where: { industry: data.industry },
      select: { industry: true },
    });

    if (!existingIndustry) {
      precomputedInsights = await generateAIInsights(
        data.industry,
        Array.isArray(data.skills) ? data.skills : []
      );
    }

    // Start a transaction to handle DB mutations atomically
    const result = await db.$transaction(
      async (tx) => {
        // Create the industry insight only if it still doesn't exist
        let industryInsight = await tx.industryInsight.findUnique({
          where: { industry: data.industry },
        });

        if (!industryInsight && precomputedInsights) {
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...precomputedInsights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Update the user record
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10000 }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    return { isOnboarded: !!user?.industry };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function getIndustryList() {
  const industries = await db.industryInsight.findMany({
    select: { industry: true },
    orderBy: { industry: "asc" },
  });
  return industries.map((i) => i.industry);
}

export async function updateUserProfile(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const nextIndustry = data.industry?.trim() || user.industry;
  const skillsArray = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === "string"
    ? data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : user.skills;

  // Precompute insights if industry changed and the insight doesn't exist
  let precomputedInsights = null;
  if (nextIndustry && nextIndustry !== user.industry) {
    const exists = await db.industryInsight.findUnique({
      where: { industry: nextIndustry },
      select: { industry: true },
    });
    if (!exists) {
      precomputedInsights = await generateAIInsights(
        nextIndustry,
        skillsArray || []
      );
    }
  }

  const result = await db.$transaction(async (tx) => {
    if (precomputedInsights) {
      await tx.industryInsight.create({
        data: {
          industry: nextIndustry,
          ...precomputedInsights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        bio: data.bio ?? user.bio,
        experience:
          typeof data.experience === "number"
            ? data.experience
            : user.experience,
        skills: skillsArray ?? user.skills,
        industry: nextIndustry,
      },
    });

    return updatedUser;
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return result;
}
