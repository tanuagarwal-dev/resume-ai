"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { createJobMatch } from "@/actions/job-match";
import { toast } from "sonner";

export default function JobMatchForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.companyName || !formData.jobDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await createJobMatch(formData);
      toast.success("Job match analysis completed!");
      
      // Reset form
      setFormData({
        jobTitle: "",
        companyName: "",
        jobDescription: "",
      });
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.error(error.message || "Failed to analyze job match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Analyze New Job
        </CardTitle>
        <CardDescription>
          Paste a job description to see how well your resume matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Software Engineer"
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              placeholder="e.g., Google"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              disabled={loading}
              required
              rows={10}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Include requirements, responsibilities, and qualifications for best results
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Match
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Analysis typically takes 5-10 seconds. Limited to 5 analyses per minute.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
