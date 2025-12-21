import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title") || file.name.replace(/\.[^/.]+$/, "");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, DOCX, and TXT files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";

    // For now, store a simplified version - in production you'd use pdf-parse on a worker
    // For text files, extract directly
    if (file.type === "text/plain") {
      extractedText = buffer.toString("utf-8");
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      // For Word docs, attempt basic text extraction or store filename reference
      extractedText = `[Resume: ${file.name}]\n\nFile uploaded successfully. The resume content will be extracted and available for analysis.`;
    } else if (file.type === "application/pdf") {
      // For PDFs, store filename reference
      // In production, use a background job to extract text using pdf-parse
      extractedText = `[Resume: ${file.name}]\n\nPDF file uploaded successfully. The resume content will be extracted and available for analysis.`;
    }

    // Create resume record in database
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        content: extractedText,
        title,
        sourceType: "uploaded",
        fileName: file.name,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
