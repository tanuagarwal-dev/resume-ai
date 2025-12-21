import { Suspense } from "react";
import JobMatchDashboard from "./_components/job-match-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Job Match Analysis | AI Career Coach",
  description:
    "Analyze how well your resume matches job descriptions with AI-powered ATS scoring",
};

export default function JobMatchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Job Match Analyzer</h1>
        <p className="text-muted-foreground text-lg">
          See how well your resume matches job descriptions and get actionable
          insights to improve your applications
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <JobMatchDashboard />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
