"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Badge */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary Chart Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart placeholder */}
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* In-Demand Skills */}
      <Card>
        <CardHeader>
          <CardTitle>In-Demand Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emerging Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Emerging Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
