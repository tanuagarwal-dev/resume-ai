import { aiText } from "./ai";
import { cacheGet, cacheSet } from "./cache";
import crypto from "crypto";

/**
 * Generate a hash for the job description to use as cache key
 */
function hashJobDescription(jd) {
  return crypto
    .createHash("md5")
    .update(jd.trim().toLowerCase())
    .digest("hex")
    .substring(0, 16);
}

/**
 * Extract keywords from text using AI
 */
async function extractKeywords(text, type = "job description") {
  const prompt = `Extract the most important keywords, skills, and technical terms from this ${type}. 
Return ONLY a JSON array of strings. No explanations.

${type}:
${text}

Return format: ["keyword1", "keyword2", "keyword3"]`;

  const response = await aiText(prompt);
  try {
    return JSON.parse(response);
  } catch {
    // Fallback: extract words that look like skills/keywords
    const words = text.match(/\b[A-Z][a-zA-Z]+\b|\b[a-z]{2,}\b/g) || [];
    return [...new Set(words.slice(0, 20))];
  }
}

/**
 * Calculate ATS score based on various factors
 */
function calculateATSScore(
  resumeContent,
  jobDescription,
  matchedKeywords,
  missingKeywords
) {
  let score = 0;

  // Keyword match ratio (40 points)
  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  if (totalKeywords > 0) {
    score += (matchedKeywords.length / totalKeywords) * 40;
  }

  // Resume structure (20 points)
  const hasContact = /email|phone|linkedin/i.test(resumeContent);
  const hasExperience = /experience|work history|employment/i.test(
    resumeContent
  );
  const hasEducation = /education|degree|university/i.test(resumeContent);
  const hasSkills = /skills|technologies|tools/i.test(resumeContent);

  if (hasContact) score += 5;
  if (hasExperience) score += 5;
  if (hasEducation) score += 5;
  if (hasSkills) score += 5;

  // Content length appropriateness (15 points)
  const wordCount = resumeContent.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 1000) {
    score += 15;
  } else if (wordCount >= 100) {
    score += 8;
  }

  // Quantifiable achievements (15 points)
  const numbersInResume = (
    resumeContent.match(/\d+%|\d+\+|\$\d+|\d+ (years|months)/gi) || []
  ).length;
  score += Math.min(numbersInResume * 3, 15);

  // Formatting (10 points)
  const wellFormatted = /#{1,3}\s/.test(resumeContent); // Has markdown headers
  if (wellFormatted) score += 10;

  return Math.min(Math.round(score), 100);
}

/**
 * Analyze job match between resume and job description
 */
export async function analyzeJobMatch(
  resumeContent,
  jobDescription,
  jobTitle,
  companyName,
  userId
) {
  // Check cache first
  const cacheKey = `jobmatch:${userId}:${hashJobDescription(jobDescription)}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log("Returning cached job match analysis");
    return cached;
  }

  // Extract keywords from job description
  const jdKeywords = await extractKeywords(jobDescription, "job description");
  const resumeKeywords = await extractKeywords(resumeContent, "resume");

  // Find matched and missing keywords
  const jdKeywordsLower = jdKeywords.map((k) => k.toLowerCase());
  const resumeKeywordsLower = resumeKeywords.map((k) => k.toLowerCase());

  const matchedKeywords = jdKeywords.filter((k) =>
    resumeKeywordsLower.includes(k.toLowerCase())
  );

  const missingKeywords = jdKeywords
    .filter((k) => !resumeKeywordsLower.includes(k.toLowerCase()))
    .slice(0, 15); // Limit to top 15 missing

  // Calculate scores
  const atsScore = calculateATSScore(
    resumeContent,
    jobDescription,
    matchedKeywords,
    missingKeywords
  );
  const matchPercentage = Math.round(
    (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 100
  );

  // Generate detailed alignment analysis
  const alignmentPrompt = `Analyze how well this resume aligns with the job description. Provide specific, actionable feedback.

Job Title: ${jobTitle}
Company: ${companyName}

Job Description:
${jobDescription.substring(0, 2000)}

Resume:
${resumeContent.substring(0, 2000)}

Provide a detailed analysis covering:
1. Overall fit and alignment
2. Strengths that match the role
3. Gaps or areas of concern
4. Specific recommendations

Keep it concise but actionable (200-300 words).`;

  const alignmentNotes = await aiText(alignmentPrompt);

  // Generate prioritized suggestions
  const suggestionsPrompt = `Based on this job match analysis, provide 5-7 specific suggestions to improve the resume for this role.

Job: ${jobTitle} at ${companyName}
Matched Keywords: ${matchedKeywords.join(", ")}
Missing Keywords: ${missingKeywords.join(", ")}
Current Match: ${matchPercentage}%

Return ONLY a JSON array with this format:
[
  {
    "type": "keyword" | "format" | "content" | "achievement",
    "message": "specific actionable suggestion",
    "priority": "high" | "medium" | "low"
  }
]`;

  const suggestionsText = await aiText(suggestionsPrompt);
  let suggestions = [];
  try {
    suggestions = JSON.parse(suggestionsText);
  } catch {
    // Fallback suggestions
    suggestions = [
      {
        type: "keyword",
        message: `Add these missing keywords: ${missingKeywords
          .slice(0, 5)
          .join(", ")}`,
        priority: "high",
      },
      {
        type: "content",
        message:
          "Tailor your experience section to highlight relevant achievements",
        priority: "high",
      },
      {
        type: "format",
        message: "Use quantifiable metrics to demonstrate impact",
        priority: "medium",
      },
    ];
  }

  // Generate improvement tips
  const improvementTips = [];

  if (matchPercentage < 50) {
    improvementTips.push(
      "Consider significantly revising your resume to better match the job requirements"
    );
  }

  if (missingKeywords.length > 10) {
    improvementTips.push(
      `Add key skills: ${missingKeywords.slice(0, 5).join(", ")}`
    );
  }

  if (atsScore < 60) {
    improvementTips.push(
      "Improve ATS compatibility by using standard section headings (Experience, Education, Skills)"
    );
  }

  if (!/\d+%|\d+ (years|months)/.test(resumeContent)) {
    improvementTips.push(
      "Add quantifiable achievements (e.g., 'Increased sales by 25%', 'Led team of 5 developers')"
    );
  }

  improvementTips.push(
    `Focus on highlighting: ${matchedKeywords.slice(0, 3).join(", ")}`
  );

  if (improvementTips.length < 3) {
    improvementTips.push(
      "Review the alignment notes for specific areas to improve"
    );
  }

  const result = {
    atsScore,
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    suggestions,
    alignmentNotes,
    improvementTips,
  };

  // Cache for 24 hours
  cacheSet(cacheKey, result, 24 * 60 * 60 * 1000);

  return result;
}

/**
 * Get skill gap analysis from a job description
 */
export async function analyzeSkillGap(userSkills, jobDescription) {
  const prompt = `Analyze the skill gap between the user's current skills and job requirements.

User's Current Skills:
${userSkills.join(", ")}

Job Description:
${jobDescription.substring(0, 2000)}

Return a JSON object with this format:
{
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "skillsToImprove": ["skill5", "skill6"],
  "learningPriority": {
    "high": ["most critical skills to learn"],
    "medium": ["important but not urgent"],
    "low": ["nice to have"]
  }
}`;

  const response = await aiText(prompt);
  try {
    return JSON.parse(response);
  } catch {
    return {
      requiredSkills: [],
      missingSkills: [],
      skillsToImprove: [],
      learningPriority: { high: [], medium: [], low: [] },
    };
  }
}
