import { db } from "../lib/prisma.js";

async function main() {
  // Seed a few industry insights to avoid first-run AI calls
  const industries = [
    "tech-software-development",
    "finance-banking",
    "healthcare-biotech",
  ];

  for (const industry of industries) {
    const exists = await db.industryInsight.findUnique({ where: { industry } });
    if (exists) continue;
    await db.industryInsight.create({
      data: {
        industry,
        salaryRanges: [
          {
            role: "Software Engineer",
            min: 60000,
            max: 140000,
            median: 100000,
            location: "Remote",
          },
          {
            role: "Product Manager",
            min: 70000,
            max: 150000,
            median: 110000,
            location: "Remote",
          },
          {
            role: "Data Scientist",
            min: 65000,
            max: 145000,
            median: 105000,
            location: "Remote",
          },
          {
            role: "DevOps Engineer",
            min: 65000,
            max: 145000,
            median: 105000,
            location: "Remote",
          },
          {
            role: "QA Engineer",
            min: 50000,
            max: 120000,
            median: 85000,
            location: "Remote",
          },
        ],
        growthRate: 8.5,
        demandLevel: "High",
        topSkills: ["JavaScript", "React", "Node.js", "SQL", "Cloud"],
        marketOutlook: "Positive",
        keyTrends: [
          "AI adoption",
          "Cloud-native",
          "DevOps",
          "Data-driven",
          "Security",
        ],
        recommendedSkills: [
          "TypeScript",
          "AWS",
          "Docker",
          "Kubernetes",
          "Python",
        ],
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log("Seed complete");
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
