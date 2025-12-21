"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function JobMatchResult({ match }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    alignment: false,
    suggestions: false,
    keywords: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{match.jobTitle}</CardTitle>
              <p className="text-muted-foreground">{match.companyName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzed{" "}
                {format(new Date(match.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-end gap-2 mb-2">
                  <span
                    className={`text-5xl font-bold ${getScoreColor(
                      match.atsScore
                    )}`}
                  >
                    {Math.round(match.atsScore)}
                  </span>
                  <span className="text-muted-foreground mb-2">/100</span>
                </div>
                <Badge variant="outline">{getScoreLabel(match.atsScore)}</Badge>
              </div>
              <Progress value={match.atsScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Your resume scores{" "}
                <strong className={getScoreColor(match.atsScore)}>
                  {getScoreLabel(match.atsScore).toLowerCase()}
                </strong>{" "}
                in Applicant Tracking Systems
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Match Percentage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-end gap-2 mb-2">
                  <span
                    className={`text-5xl font-bold ${getScoreColor(
                      match.matchPercentage
                    )}`}
                  >
                    {Math.round(match.matchPercentage)}%
                  </span>
                </div>
                <Badge variant="outline">
                  {getScoreLabel(match.matchPercentage)}
                </Badge>
              </div>
              <Progress value={match.matchPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Your resume matches{" "}
                <strong className={getScoreColor(match.matchPercentage)}>
                  {match.matchPercentage}%
                </strong>{" "}
                of the job requirements
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto"
            onClick={() => toggleSection("keywords")}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Keywords Analysis
            </CardTitle>
            {expandedSections.keywords ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </CardHeader>
        {expandedSections.keywords && (
          <CardContent className="space-y-4">
            {/* Matched Keywords */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold">
                  Matched Keywords ({match.matchedKeywords.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.matchedKeywords.map((keyword, idx) => (
                  <Badge
                    key={idx}
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            {match.missingKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold">
                    Missing Keywords ({match.missingKeywords.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.missingKeywords.map((keyword, idx) => (
                    <Badge
                      key={idx}
                      variant="destructive"
                      className="bg-red-100 text-red-800"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Consider adding these keywords to your resume if you have
                  relevant experience
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Improvement Tips */}
      {match.improvementTips && match.improvementTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5" />
              Quick Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {match.improvementTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Suggestions */}
      {match.suggestions && match.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 h-auto"
              onClick={() => toggleSection("suggestions")}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5" />
                Detailed Suggestions ({match.suggestions.length})
              </CardTitle>
              {expandedSections.suggestions ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </CardHeader>
          {expandedSections.suggestions && (
            <CardContent>
              <div className="space-y-3">
                {match.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <AlertCircle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        suggestion.priority === "high"
                          ? "text-red-500"
                          : suggestion.priority === "medium"
                          ? "text-yellow-500"
                          : "text-blue-500"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(suggestion.priority)}>
                          {getPriorityLabel(suggestion.priority)}
                        </Badge>
                        <Badge variant="outline">{suggestion.type}</Badge>
                      </div>
                      <p className="text-sm">{suggestion.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Alignment Notes */}
      {match.alignmentNotes && (
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 h-auto"
              onClick={() => toggleSection("alignment")}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Detailed Analysis
              </CardTitle>
              {expandedSections.alignment ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </CardHeader>
          {expandedSections.alignment && (
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm">
                  {match.alignmentNotes}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Job Description (Collapsible) */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            <CardTitle className="text-lg">Original Job Description</CardTitle>
            {showFullDescription ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </CardHeader>
        {showFullDescription && (
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm">
                {match.jobDescription}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
