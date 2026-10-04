import React from "react";
import { ArrowLeft, Download, Award, TrendingUp, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Step3Report({ result }) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-bg text-text">
        <p className="text-text-muted text-sm font-medium">Loading Interview Report...</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = result;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for Job Opportunities";
    shortTagline = "Excellent clarity and structured technical responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs Minor Improvements";
    shortTagline = "Good foundation, focus on sharper articulation.";
  } else {
    performanceText = "Targeted Practice Required";
    shortTagline = "Work on foundational clarity, depth, and pacing.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("AI Interview Performance Report", pageWidth / 2, 20, { align: "center" });

    autoTable(doc, {
      startY: 35,
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [i + 1, q.question, `${q.score}/10`, q.feedback]),
    });

    doc.save("AI_Interview_Report.pdf");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg text-text px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/history")}
              className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text transition-colors cursor-pointer"
              aria-label="Back to History"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                Interview Performance Analytics
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                AI evaluation, metric breakdown & question feedback
              </p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-on-primary px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-soft cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* METRICS & DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN: OVERALL + SKILLS */}
          <div className="space-y-6">
            {/* OVERALL SCORE */}
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-subtle uppercase tracking-wider mb-6">
                <Award className="w-4 h-4 text-primary" />
                Overall Score
              </div>

              <div className="relative w-28 h-28 mx-auto">
                <CircularProgressbar
                  value={percentage}
                  text={`${score}/10`}
                  styles={buildStyles({
                    pathColor: "#059669",
                    textColor: "currentColor",
                    trailColor: "var(--surface-2)",
                    textSize: "18px",
                  })}
                />
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-bold text-text">{performanceText}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{shortTagline}</p>
              </div>
            </div>

            {/* SKILLS */}
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 space-y-4">
              <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
                Skill Breakdown
              </h3>

              <div className="space-y-4">
                {skills.map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-text">{s.label}</span>
                      <span className="font-bold text-primary">{s.value} / 10</span>
                    </div>

                    <div className="bg-surface-2 h-2 rounded-full overflow-hidden border border-border">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(s.value * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CHART + QUESTIONS */}
          <div className="lg:col-span-2 space-y-6">
            {/* SCORE TIMELINE CHART */}
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                    Question-by-Question Progression
                  </h3>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={questionScoreData}>
                    <defs>
                      <linearGradient id="scoreEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="name" stroke="var(--text-subtle)" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} stroke="var(--text-subtle)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--text)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#059669"
                      strokeWidth={2}
                      fill="url(#scoreEmeraldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* QUESTION FEEDBACK LIST */}
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                  Detailed Question Feedback
                </h3>
              </div>

              <div className="space-y-4">
                {questionWiseScore.map((q, i) => (
                  <div
                    key={i}
                    className="bg-surface-2/60 border border-border p-4 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-text-subtle uppercase">
                          Question {i + 1}
                        </span>
                        <p className="text-sm font-semibold text-text mt-0.5">
                          {q.question || "Question prompt"}
                        </p>
                      </div>

                      <span className="bg-primary-soft text-primary font-bold text-xs px-2.5 py-1 rounded-md shrink-0 border border-primary/20">
                        {q.score ?? 0} / 10
                      </span>
                    </div>

                    <div className="bg-surface border border-border p-3 rounded-lg text-xs leading-relaxed text-text-muted">
                      <span className="font-semibold text-text block mb-1">Feedback:</span>
                      {q.feedback?.trim() || "No feedback recorded"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
