import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <div className="flex flex-col  justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title-light dark:gradient-title">Industry Insights</h1>
        <p className="text-sm text-gray-800 dark:text-gray-300">Updates every Sunday at midnight.</p>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
