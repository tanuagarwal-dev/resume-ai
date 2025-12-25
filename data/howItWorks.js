import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Smart Onboarding",
    description: "Tell us your goals and background to tailor your path",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Build Your Documents",
    description:
      "Generate ATS-friendly resumes and role-specific cover letters",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Ace Interviews",
    description:
      "Practice with AI mock interviews and get instant, actionable feedback",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Track Progress",
    description:
      "See improvements with skill-gap insights and performance trends",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
