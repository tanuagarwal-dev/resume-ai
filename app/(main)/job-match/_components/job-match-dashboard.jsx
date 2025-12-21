"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getJobMatches,
  deleteJobMatch,
  getJobMatchStats,
} from "@/actions/job-match";
import JobMatchForm from "./job-match-form";
import JobMatchResult from "./job-match-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Trash2, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function JobMatchDashboard() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [matchesData, statsData] = await Promise.all([
        getJobMatches(),
        getJobMatchStats(),
      ]);
      setMatches(matchesData);
      setStats(statsData);

      // Auto-select the most recent match if none selected
      setSelectedMatch((prev) => (prev ? prev : matchesData[0] || null));
    } catch (error) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNewMatch = async (newMatch) => {
    await loadData();
    setSelectedMatch(newMatch);
  };

  const handleDelete = async () => {
    if (!matchToDelete) return;

    try {
      await deleteJobMatch(matchToDelete.id);
      toast.success("Job match deleted");

      // Remove from local state
      const updatedMatches = matches.filter((m) => m.id !== matchToDelete.id);
      setMatches(updatedMatches);

      // Update selected if needed
      if (selectedMatch?.id === matchToDelete.id) {
        setSelectedMatch(updatedMatches[0] || null);
      }

      // Reload stats
      const statsData = await getJobMatchStats();
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || "Failed to delete job match");
    } finally {
      setDeleteDialogOpen(false);
      setMatchToDelete(null);
    }
  };

  const openDeleteDialog = (match) => {
    setMatchToDelete(match);
    setDeleteDialogOpen(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Overview */}
        {stats && stats.totalMatches > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalMatches}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    stats.averageAtsScore
                  )}`}
                >
                  {stats.averageAtsScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Match %
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    stats.averageMatchPercentage
                  )}`}
                >
                  {stats.averageMatchPercentage}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    stats.highestAtsScore
                  )}`}
                >
                  {Math.round(stats.highestAtsScore)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="new" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new">New Analysis</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History ({matches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <JobMatchForm onSuccess={handleNewMatch} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {matches.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by analyzing a job description to see how well your
                    resume matches
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Match List */}
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Your Analyses</h3>
                  {matches.map((match) => (
                    <Card
                      key={match.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedMatch?.id === match.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {match.jobTitle}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {match.companyName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(match);
                            }}
                            className="flex-shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={getScoreColor(match.atsScore)}
                          >
                            ATS: {Math.round(match.atsScore)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getScoreColor(match.matchPercentage)}
                          >
                            Match: {Math.round(match.matchPercentage)}%
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {format(new Date(match.createdAt), "MMM d, yyyy")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Match Details */}
                <div className="lg:col-span-2">
                  {selectedMatch ? (
                    <JobMatchResult match={selectedMatch} />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Select a job match to view details
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the analysis for{" "}
              <strong>{matchToDelete?.jobTitle}</strong> at{" "}
              <strong>{matchToDelete?.companyName}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
