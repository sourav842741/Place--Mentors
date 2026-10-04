import React, { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  uploadResumeAndAnalyze,
  clearAnalysis,
  setFileName,
  selectResume,
} from "@/redux/resumeSlice";
import Navbar from "@/components/Navbar";
import UploadArea from "@/components/ui/UploadArea";
import Footer from "@/components/Footer";
import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
} from "../observability/openreplay/events";

export default function ResumeAnalyzer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { loading, analysis, fileName, error } = useSelector(selectResume);
  const [showResult, setShowResult] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!error) return;

    safeTrack("resume_analyzer_upload_failed", {
      error: typeof error === "string" ? error.slice(0, 120) : "resume_analysis_failed",
    });

    startCriticalReplay("resume_analyzer_failed", {
      error: typeof error === "string" ? error.slice(0, 120) : "resume_analysis_failed",
    });
  }, [error]);

  const handleFileSelect = useCallback(
    (file) => {
      setSelectedFile(file);
      dispatch(setFileName(file.name));
      toast.success("Resume uploaded successfully!");
      safeTrack("resume_file_selected", {
        fileName: file?.name,
      });
    },
    [dispatch]
  );

  const handleAnalyze = useCallback(() => {
    safeTrack("resume_analyzer_started", {
      hasFile: !!selectedFile,
    });

    startCriticalReplay("resume_analyzer", {
      hasFile: !!selectedFile,
    });
    if (!selectedFile) {
      toast.error("Please select a PDF resume first");
      return;
    }

    if (user?.credits < 20) {
      toast.error("Need 20 credits. Check dashboard.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    dispatch(uploadResumeAndAnalyze(formData));
    setShowResult(true);
    safeTrack("resume_analysis_requested", {
      hasFile: !!selectedFile,
    });
  }, [selectedFile, user, dispatch]);

  const handleCloseResult = useCallback(() => {
    dispatch(clearAnalysis());
    setSelectedFile(null);
    setShowResult(false);
  }, [dispatch]);

  useEffect(() => {
    if (!analysis) return;

    safeTrack("resume_analyzer_success", {
      interviewReady: analysis?.interviewReady,
      score: analysis?.score,
    });

    stopReplaySuccess("resume_analyzer");
  }, [analysis]);

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        <main className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                ATS & Recruiter Review
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                AI Resume Analyzer
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Upload your resume PDF for comprehensive scoring, keyword matching & feedback.
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="bg-surface border-border text-text hover:bg-surface-2 text-xs rounded-lg cursor-pointer h-9"
            >
              Dashboard
            </Button>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Upload Resume Document
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Drag & drop or browse your local file. Maximum size 5MB in PDF format.
              </p>
            </div>

            <div data-private>
              <UploadArea onFileSelect={handleFileSelect} fileName={fileName} />
            </div>

            {user && (
              <div className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border text-xs">
                <span className="font-medium text-text">Available Credits: {user.credits}</span>
                <span className="text-text-muted">Cost: 20 credits per analysis</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile || !user?.credits || user.credits < 20}
              className="w-full bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Resume with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Resume (20 credits)</span>
                </>
              )}
            </button>
          </div>

          <Dialog open={showResult && !!analysis} onOpenChange={setShowResult}>
            <DialogContent data-private className="max-w-3xl max-h-[90vh] overflow-y-auto bg-surface border-border text-text">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-text">
                  Resume Evaluation Report
                </DialogTitle>
              </DialogHeader>

              {analysis && (
                <div className="space-y-6 pt-2">
                  <div className="text-center p-6 bg-surface-2 rounded-xl border border-border">
                    <span className="text-4xl sm:text-5xl font-extrabold text-primary block mb-2">
                      {analysis.score} / 100
                    </span>
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                        analysis.interviewReady
                          ? "bg-success-soft text-success border border-success/20"
                          : "bg-accent-soft text-accent border border-accent/20"
                      }`}
                    >
                      {analysis.interviewReady ? "Interview Ready" : "Revisions Recommended"}
                    </span>
                    <p className="text-xs text-text-muted mt-2">
                      Recommended Role Alignment: <strong className="text-text">{analysis.recommendedRole || "Software Engineering"}</strong>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-surface-2/60 border border-border p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-success flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle className="w-4 h-4" />
                        Identified Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths?.map((strength, i) => (
                          <li key={i} className="text-xs text-text flex items-start gap-2">
                            <span className="text-success font-bold">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-surface-2/60 border border-border p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-danger flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {analysis.weaknesses?.map((weakness, i) => (
                          <li key={i} className="text-xs text-text flex items-start gap-2">
                            <span className="text-danger font-bold">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {analysis.suggestions?.length > 0 && (
                    <div className="bg-surface-2/60 border border-border p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                        Actionable Recommendations
                      </h4>
                      <ul className="space-y-1.5">
                        {analysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-xs text-text-muted">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-surface-2 hover:bg-surface border border-border text-text text-xs rounded-lg cursor-pointer"
                      onClick={() => setShowResult(false)}
                    >
                      Analyze Another Resume
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover text-on-primary text-xs rounded-lg cursor-pointer"
                      onClick={() => navigate("/ai-planner")}
                    >
                      Create Study Roadmap
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
      <Footer />
    </>
  );
}
