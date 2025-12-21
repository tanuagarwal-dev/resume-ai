"use client";

import { useState, useEffect } from "react";
import { Trash2, Check, FileText, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAllResumes, setActiveResume, deleteResume } from "@/actions/resume";

export default function ResumeSelector({ onResumeSelect }) {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getAllResumes();
      setResumes(data);
      const active = data.find((r) => r.isActive);
      if (active) {
        setActiveId(active.id);
      }
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActive = async (resumeId) => {
    try {
      await setActiveResume(resumeId);
      setActiveId(resumeId);
      toast.success("Resume activated successfully!");
      if (onResumeSelect) {
        const selected = resumes.find((r) => r.id === resumeId);
        onResumeSelect(selected);
      }
    } catch (error) {
      console.error("Error setting active resume:", error);
      toast.error("Failed to activate resume");
    }
  };

  const handleDelete = async (resumeId) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await deleteResume(resumeId);
      setResumes(resumes.filter((r) => r.id !== resumeId));
      toast.success("Resume deleted successfully!");

      // If deleted resume was active, reload to get another active one
      if (resumeId === activeId) {
        await loadResumes();
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading resumes...
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No resumes yet. Upload or create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Your Resumes</h3>
      <div className="space-y-2">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              resume.isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {resume.title}
                  {resume.fileName && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({resume.sourceType === "uploaded" ? "Uploaded" : "Built"}
                      )
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {resume.isActive && <Check className="h-4 w-4 text-green-600" />}
              {resume.sourceType === "builder" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {!resume.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleSetActive(resume.id)}
                >
                  Use
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(resume.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
