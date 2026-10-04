import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  Upload,
  Mic,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { useSelector } from "react-redux";
import { trackEvent } from "../hooks/useAnalytics";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);
    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await api.post("/api/interview/resume", formdata, {
        withCredentials: true,
      });

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
      toast.success("Resume parsed successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to parse resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);

    try {
      const result = await api.post("/api/interview/generate-questions", {
        role,
        experience,
        mode,
        resumeText,
        projects,
        skills,
      });

      trackEvent("quiz_started");
      trackEvent("ai_interview_used", { mode });

      onStart(result.data);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-bg text-text transition-colors duration-200">
      <div className="w-full max-w-5xl bg-surface border border-border rounded-xl shadow-subtle grid md:grid-cols-2 overflow-hidden">
        {/* LEFT SIDE - Value Proposition */}
        <div className="p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border bg-surface-2/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI Mock Interview
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight mb-3">
              Practice Interviews with Real-Time AI
            </h1>

            <p className="text-sm text-text-muted leading-relaxed mb-8">
              Simulate realistic technical and HR interview rounds tailored to your target role and resume.
            </p>

            <div className="space-y-3">
              {[
                {
                  icon: <User className="w-4 h-4 text-primary" />,
                  title: "Customized Roles & Seniority",
                  desc: "Frontend, Backend, SDE, Full-stack or HR round",
                },
                {
                  icon: <Mic className="w-4 h-4 text-primary" />,
                  title: "Real-time Voice & Audio Feedback",
                  desc: "Practice answering under timed pressure",
                },
                {
                  icon: <BarChart3 className="w-4 h-4 text-primary" />,
                  title: "Detailed ATS & Answer Analytics",
                  desc: "Instant breakdown of clarity, accuracy, and confidence",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3.5 p-3.5 rounded-lg bg-surface border border-border"
                >
                  <div className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text">{item.title}</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 text-xs text-text-subtle flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Over 10,000+ student interviews conducted</span>
          </div>
        </div>

        {/* RIGHT SIDE - Setup Form */}
        <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text mb-1">Configure Your Session</h2>
            <p className="text-xs text-text-muted mb-6">
              Enter target role details or upload your resume for auto-generation.
            </p>

            <div className="space-y-4">
              {/* ROLE */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Target Role <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-subtle absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer, SDE 1"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface border border-border rounded-lg text-text placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* EXPERIENCE */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Experience Level <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-text-subtle absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Fresher, 1-2 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface border border-border rounded-lg text-text placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* MODE */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Interview Track
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="Technical">Technical Round (Coding & Fundamentals)</option>
                  <option value="HR">HR Round (Behavioral & Situational)</option>
                </select>
              </div>

              {/* RESUME UPLOAD */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Resume Analysis <span className="text-text-subtle font-normal">(Optional)</span>
                </label>
                {!analysisDone ? (
                  <div
                    onClick={() => document.getElementById("resumeUpload").click()}
                    className="border border-dashed border-border hover:border-primary/50 bg-surface-2/50 rounded-lg p-5 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto text-primary mb-2" />
                    <input
                      type="file"
                      accept="application/pdf"
                      id="resumeUpload"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <p className="text-xs font-medium text-text">
                      {resumeFile ? resumeFile.name : "Click to select resume PDF"}
                    </p>
                    <p className="text-[11px] text-text-subtle mt-1">
                      AI will automatically extract skills & projects
                    </p>

                    {resumeFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadResume();
                        }}
                        disabled={analyzing}
                        className="mt-3 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {analyzing ? "Analyzing Resume..." : "Extract Data"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-surface-2 border border-border rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Parsed Successfully
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAnalysisDone(false);
                          setResumeFile(null);
                        }}
                        className="text-[11px] text-text-muted hover:text-text cursor-pointer underline"
                      >
                        Change
                      </button>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 6).map((s, i) => (
                          <span
                            key={i}
                            className="bg-primary-soft text-primary text-[11px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {skills.length > 6 && (
                          <span className="text-[11px] text-text-subtle py-0.5">
                            +{skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* START BUTTON */}
          <button
            onClick={handleStart}
            disabled={!role || !experience || loading}
            className="w-full bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              "Preparing Questions..."
            ) : (
              <>
                <span>Start AI Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step1SetUp;
