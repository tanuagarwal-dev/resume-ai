"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiText } from "@/lib/ai";
import { revalidatePath } from "next/cache";

const model = null; // centralized in lib/ai

export async function saveResume(content, title = "My Resume") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Create a new resume entry from the builder
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        content,
        title,
        sourceType: "builder",
        isActive: true,
      },
    });

    // Deactivate other resumes
    await db.resume.updateMany({
      where: {
        userId: user.id,
        id: { not: resume.id },
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Get the active resume, or the most recently created
  return await db.resume.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAllResumes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      sourceType: true,
      fileName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function setActiveResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Deactivate all resumes
    await db.resume.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isActive: false,
      },
    });

    // Activate the selected resume
    const resume = await db.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        isActive: true,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error setting active resume:", error);
    throw new Error("Failed to set active resume");
  }
}

export async function deleteResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (resume?.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    await db.resume.delete({
      where: { id: resumeId },
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw new Error("Failed to delete resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const improvedContent = await aiText(prompt, { retries: 1 });
    return improvedContent.trim();
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
