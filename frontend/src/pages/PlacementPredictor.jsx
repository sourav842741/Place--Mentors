import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Award,
  History,
  RotateCcw,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import predictionApi from "../services/predictionApi";
import { trackEvent } from "../hooks/useAnalytics";

export default function PlacementPredictor() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    collegeTier: "",
    cgpa: "",
    skillsLevel: "",
    dsaLevel: "",
    projectsCount: "",
    communicationLevel: "",
    internshipExperience: "",
  });

  const tiers = ["Tier 1", "Tier 2", "Tier 3"];
  const skills = ["Beginner", "Intermediate", "Strong"];
  const dsa = ["Weak", "Average", "Good"];
  const projects = ["0", "1-2", "3+"];
  const comm = ["Weak", "Average", "Good"];
  const internship = ["No", "Yes"];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await predictionApi.getHistory();
      setHistory(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleInput = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.collegeTier || !formData.cgpa || !formData.skillsLevel) {
      toast.error("Please fill in the required fields (College Tier, CGPA, Skills)");
      return;
    }

    try {
      setLoading(true);
      trackEvent("placement_predictor_used");

      const res = await predictionApi.predictPlacement(formData);
      setResult(res.data?.prediction);
      toast.success("Placement prediction generated!");
      fetchHistory();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Prediction calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const useOldPrediction = (item) => {
    if (item.inputs) {
      setFormData(item.inputs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.info("Loaded previous assessment inputs");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200">
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-16 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2 text-xs border border-border bg-surface hover:bg-surface-2 text-text rounded-lg cursor-pointer h-8 px-3"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back
            </Button>

            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                Placement Predictor AI
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
                <Sparkles className="w-3 h-3 animate-pulse" /> ML Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Estimate your placement probability, salary potential & target readiness score
            </p>
          </div>
        </div>

        {/* Top Grid: Form + History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* PROFILE FORM */}
          <Card className="lg:col-span-2 border border-border bg-surface rounded-2xl shadow-subtle overflow-hidden">
            <CardHeader className="border-b border-border/80 pb-4">
              <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary-soft text-primary">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Fill Candidate Profile
              </CardTitle>
              <p className="text-xs text-text-muted">
                Input your academic & technical background for the most accurate ML forecast
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: College Tier & CGPA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      College Tier <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formData.collegeTier}
                      onValueChange={(v) => handleInput("collegeTier", v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select College Tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        {tiers.map((item) => (
                          <SelectItem key={item} value={item} className="cursor-pointer">
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      CGPA (Out of 10) <span className="text-danger">*</span>
                    </label>
                    <Input
                      placeholder="e.g. 8.4"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => handleInput("cgpa", e.target.value)}
                      className="h-11 rounded-xl bg-surface-2/60 border-border text-text placeholder:text-text-subtle focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                </div>

                {/* Row 2: Skills Level & DSA Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      Technical Skills Level <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formData.skillsLevel}
                      onValueChange={(v) => handleInput("skillsLevel", v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select Skills Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        {skills.map((item) => (
                          <SelectItem key={item} value={item} className="cursor-pointer">
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      DSA Proficiency
                    </label>
                    <Select
                      value={formData.dsaLevel}
                      onValueChange={(v) => handleInput("dsaLevel", v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select DSA Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        {dsa.map((item) => (
                          <SelectItem key={item} value={item} className="cursor-pointer">
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Projects & Communication */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      Completed Projects
                    </label>
                    <Select
                      value={formData.projectsCount}
                      onValueChange={(v) => handleInput("projectsCount", v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Projects Count" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        {projects.map((item) => (
                          <SelectItem key={item} value={item} className="cursor-pointer">
                            {item} Projects
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                      Communication Skills
                    </label>
                    <Select
                      value={formData.communicationLevel}
                      onValueChange={(v) => handleInput("communicationLevel", v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Communication Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        {comm.map((item) => (
                          <SelectItem key={item} value={item} className="cursor-pointer">
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Internship */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">
                    Prior Internship Experience
                  </label>
                  <Select
                    value={formData.internshipExperience}
                    onValueChange={(v) => handleInput("internshipExperience", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-surface-2/60 border-border text-text hover:bg-surface-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Have you completed an internship?" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      {internship.map((item) => (
                        <SelectItem key={item} value={item} className="cursor-pointer">
                          {item === "Yes" ? "Yes (Has Internship Experience)" : "No (Fresher)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-soft transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Career Probability...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Prediction Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* RECENT HISTORY SIDEBAR */}
          <Card className="border border-border bg-surface rounded-2xl shadow-subtle overflow-hidden">
            <CardHeader className="border-b border-border/80 pb-4">
              <CardTitle className="flex items-center justify-between text-base font-bold text-text">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Recent History
                </div>
                <Badge className="bg-primary-soft text-primary font-bold border border-primary/20 rounded-lg px-2.5 py-0.5 text-xs">
                  {history.length}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  Loading past predictions...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
                  <FileCheck2 className="w-8 h-8 text-text-subtle opacity-50" />
                  <p className="font-medium text-text">No history found</p>
                  <p className="text-[11px] text-text-subtle">
                    Submit the form to generate your first forecast
                  </p>
                </div>
              ) : (
                history.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-primary/40 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-primary-soft text-primary border border-primary/20">
                        {item.manualScore?.placementChance || 0}% Chance
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer text-text-muted"
                        title="Load this prediction"
                        onClick={() => useOldPrediction(item)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <p className="text-xs font-semibold text-text mb-2">
                      {item.manualScore?.expectedSalaryRange || "₹5-10 LPA"}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface rounded-full h-1.5 border border-border overflow-hidden mb-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(item.manualScore?.placementChance || 0, 100)}%`,
                        }}
                      />
                    </div>

                    <p className="text-[10px] text-text-subtle">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-success-soft text-success">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-text">Prediction Insights Report</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chance Metric */}
              <Card className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Placement Chance
                  </span>
                  <div className="p-2 rounded-xl bg-primary-soft text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-text mb-3">
                  {result.manualScore?.placementChance}%
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2.5 border border-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(result.manualScore?.placementChance || 0, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Based on current hiring statistics across tech companies
                </p>
              </Card>

              {/* Salary Metric */}
              <Card className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Expected Package
                  </span>
                  <div className="p-2 rounded-xl bg-accent-soft text-accent">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-accent mb-2">
                  {result.manualScore?.expectedSalaryRange || "₹6 - 12 LPA"}
                </div>
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent-soft text-accent border border-accent/20">
                  Estimated CTC Range
                </span>
                <p className="text-xs text-text-muted mt-2">
                  Anticipated offer range for freshers with your profile
                </p>
              </Card>

              {/* Readiness Metric */}
              <Card className="rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Readiness Score
                  </span>
                  <div className="p-2 rounded-xl bg-primary-soft text-primary">
                    <Target className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-text mb-3">
                  {result.manualScore?.readinessScore}%
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2.5 border border-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(result.manualScore?.readinessScore || 0, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Overall interview preparedness metric
                </p>
              </Card>

              {/* AI Recommendations */}
              <Card className="md:col-span-3 rounded-2xl border border-border bg-surface p-6 shadow-subtle">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                  <div className="p-2 rounded-xl bg-primary-soft text-primary">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">AI Actionable Recommendations</h3>
                    <p className="text-xs text-text-muted">
                      Personalized next steps to scale into top-tier recruitment brackets
                    </p>
                  </div>
                </div>

                <div className="text-sm text-text leading-relaxed bg-surface-2/60 p-4 rounded-xl border border-border whitespace-pre-wrap font-sans">
                  {result.aiAnalysis?.personalizedSuggestions ||
                    "Keep solving daily DSA problems and build 1 full-stack production project to upgrade your chances to Tier-1 salary brackets."}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
