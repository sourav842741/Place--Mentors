import { useState, useCallback, useMemo, useRef } from "react";
import api from "../services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "../hooks/useAnalytics";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  Download,
  Sparkles,
  Copy,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Palette,
  Layout,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Trophy,
  Code2,
  ChevronDown,
  ChevronUp,
  Wand2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
} from "lucide-react";
import { FaLinkedin, FaGithub, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

// ================= SAMPLE RESUME DATA FOR PLACEMENT =================
const SAMPLE_RESUME_DATA = {
  name: "Aman Sharma",
  roleTitle: "Software Development Engineer (Full Stack)",
  email: "aman.sharma.dev@gmail.com",
  phone: "+91 98765 43210",
  linkedin: "linkedin.com/in/amansharma-dev",
  github: "github.com/amansharma-dev",
  portfolio: "amansharma.dev",
  summary:
    "Final-year B.Tech Computer Science undergraduate with strong core fundamentals in Data Structures, Algorithms, and Full-Stack Engineering. Solved 450+ problems on LeetCode (Rating: 1920+). Proven experience building scalable microservices in React and Node.js, optimizing database query latency by 40%, and deploying distributed apps with Redis and Docker.",
  skills:
    "Data Structures & Algorithms, Java, C++, JavaScript (ES6+), React.js, Next.js, Node.js, Express.js, MongoDB, PostgreSQL, Redis, Docker, Git & GitHub, RESTful APIs, System Design Basics",
  experience:
    "Software Development Intern — TechVenture Labs (Jun 2025 – Aug 2025)\n• Spearheaded the development of a real-time analytics dashboard using React and Tailwind CSS, increasing internal team productivity by 28%.\n• Designed and optimized 12+ RESTful microservices in Node.js, reducing server response times from 340ms to 180ms.\n• Implemented JWT token authentication and Redis session caching supporting 10,000+ daily active user sessions.\n• Collaborated in an Agile Scrum team of 8 engineers, participating in bi-weekly sprints and peer code reviews.",
  projects:
    "PlaceMentor — AI Career Preparation Platform (React, Node.js, MongoDB, Gemini API)\n• Built an end-to-end placement suite featuring AI resume evaluation, mock coding sandbox, and peer discussion boards.\n• Integrated WebSockets for real-time multiplayer code battles with live syntax validation.\n• Scaled application to handle 500+ concurrent simulated candidates with zero downtime.\n\nAlgoTrack — Real-Time Distributed Job Scraper (Node.js, PostgreSQL, BullMQ)\n• Engineered a resilient job scraping engine tracking 40+ career portals with automated deduplication.\n• Implemented distributed job queues with BullMQ and Redis, processing 25,000+ daily listings.",
  education:
    "B.Tech in Computer Science and Engineering — National Institute of Technology (2022 – 2026)\n• Current CGPA: 8.85 / 10.0\n• Relevant Coursework: Data Structures, Operating Systems, DBMS, Computer Networks, Object Oriented Programming\n\nClass XII (CBSE) — Delhi Public School (2022)\n• Percentage: 95.2% in PCM with Computer Science",
  achievements:
    "• Knight (1920+ Rating) on LeetCode, ranked in Top 5% globally among 450,000+ programmers.\n• Winner (1st Rank out of 140 teams) at Smart India Hackathon Internal College Round 2025.\n• Secured Global Rank 380 in Google Kick Start Round D 2024.\n• AWS Certified Cloud Practitioner (scored 870/1000).",
};

// ================= ACCENT COLOR PALETTES =================
const ACCENT_COLORS = [
  { id: "indigo", name: "Indigo", hex: "#4f46e5", light: "#eef2ff", border: "#c7d2fe" },
  { id: "emerald", name: "Emerald", hex: "#059669", light: "#ecfdf5", border: "#a7f3d0" },
  { id: "navy", name: "Navy", hex: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe" },
  { id: "slate", name: "Slate", hex: "#1e293b", light: "#f8fafc", border: "#cbd5e1" },
  { id: "rose", name: "Rose", hex: "#e11d48", light: "#fff1f2", border: "#fecdd3" },
  { id: "violet", name: "Violet", hex: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe" },
];

// ================= ATS SCORE CALCULATOR =================
const calculateAtsScore = (data) => {
  let score = 0;
  const tips = [];

  // Name & Contact
  if (data.name?.trim()) score += 8;
  else tips.push("Add your full name");

  if (data.email?.trim() && /@/.test(data.email)) score += 6;
  else tips.push("Add a valid professional email address");

  if (data.phone?.trim()) score += 4;
  else tips.push("Add your phone number");

  if (data.linkedin?.trim()) score += 4;
  else tips.push("Add LinkedIn profile URL");

  if (data.github?.trim()) score += 4;
  else tips.push("Add GitHub profile link for software roles");

  // Summary
  const words = data.summary?.trim().split(/\s+/).filter(Boolean).length || 0;
  if (words >= 30) score += 14;
  else if (words >= 15) {
    score += 8;
    tips.push("Expand summary to 30+ words highlighting key achievements");
  } else if (words > 0) {
    score += 4;
    tips.push("Make summary more comprehensive");
  } else {
    tips.push("Add a professional summary");
  }

  // Skills
  const skillsCount =
    data.skills?.split(",").map((s) => s.trim()).filter(Boolean).length || 0;
  if (skillsCount >= 8) score += 20;
  else if (skillsCount >= 4) {
    score += 12;
    tips.push("List at least 8 relevant technical skills");
  } else if (skillsCount > 0) {
    score += 6;
    tips.push("Add more core technical skills");
  } else {
    tips.push("Add technical skills (comma-separated)");
  }

  // Experience
  if (data.experience?.trim()) {
    score += 12;
    if (/\d+%|\d+\+|\d+k|\$\d+/i.test(data.experience)) {
      score += 8;
    } else {
      tips.push("Add quantified metrics in experience (e.g. 'improved latency by 35%')");
    }
  } else {
    tips.push("Add internships or work experience");
  }

  // Projects
  if (data.projects?.trim()) {
    score += 12;
    if (/\d+/i.test(data.projects)) score += 4;
  } else {
    tips.push("Add 2+ technical projects with stack details");
  }

  // Education
  if (data.education?.trim()) score += 4;
  else tips.push("Add your degree, university & GPA");

  const total = Math.min(100, score);
  let grade = "Draft";
  let gradeColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200";
  if (total >= 85) {
    grade = "Excellent ATS Match";
    gradeColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200";
  } else if (total >= 70) {
    grade = "Good Quality";
    gradeColor = "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200";
  } else if (total >= 50) {
    grade = "Needs Improvement";
    gradeColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200";
  }

  return { score: total, grade, gradeColor, tips };
};

// ================= RESUME PREVIEW COMPONENT =================
const ResumePreview = ({ data, template, accent }) => {
  const renderLines = (text) => {
    if (!text) return null;
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
        const cleanText = isBullet ? line.replace(/^[•\-*]\s*/, "") : line;

        // Check if line is a title/heading (e.g. "Role — Company (Dates)")
        const isHeading =
          line.includes("—") ||
          line.includes(" - ") ||
          line.includes("(") ||
          !isBullet && line.length < 90;

        return (
          <div
            key={idx}
            className={`text-[12.5px] leading-relaxed text-gray-800 ${
              isBullet
                ? "flex items-start gap-2 ml-1 my-1"
                : isHeading
                ? "font-semibold text-gray-900 mt-2 mb-0.5"
                : "mb-1"
            }`}
          >
            {isBullet && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: accent.hex }}
              />
            )}
            <span>{cleanText}</span>
          </div>
        );
      });
  };

  const skillsList = useMemo(() => {
    if (!data.skills) return [];
    return data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [data.skills]);

  // Initials for avatar monogram
  const initials = useMemo(() => {
    if (!data.name?.trim()) return "PM";
    const parts = data.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [data.name]);

  // ================= TEMPLATE 1: MODERN DUAL-COLUMN =================
  if (template === "modern") {
    return (
      <div
        id="resume-a4-preview"
        className="w-[794px] min-h-[1123px] bg-white text-gray-900 shadow-xl flex flex-row overflow-hidden font-sans box-border"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Left Sidebar (32%) */}
        <div
          className="w-[260px] shrink-0 p-7 flex flex-col justify-between border-r border-gray-200"
          style={{ backgroundColor: accent.light }}
        >
          <div className="space-y-6">
            {/* Monogram Badge & Name */}
            <div className="text-center pt-2">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-bold shadow-md mb-3"
                style={{ backgroundColor: accent.hex }}
              >
                {initials}
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                {data.name || "Your Name"}
              </h1>
              {data.roleTitle && (
                <p
                  className="text-xs font-semibold mt-1 tracking-wide uppercase"
                  style={{ color: accent.hex }}
                >
                  {data.roleTitle}
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 pt-2 border-t border-gray-200/80">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Contact Details
              </h3>
              {data.email && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 break-all">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <Mail className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                  </div>
                  <span className="truncate">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <Phone className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                  </div>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 break-all">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <FaLinkedin className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                  </div>
                  <span className="truncate">{data.linkedin}</span>
                </div>
              )}
              {data.github && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 break-all">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <FaGithub className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                  </div>
                  <span className="truncate">{data.github}</span>
                </div>
              )}
              {data.portfolio && (
                <div className="flex items-center gap-2.5 text-xs text-gray-700 break-all">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <Globe className="w-3.5 h-3.5" style={{ color: accent.hex }} />
                  </div>
                  <span className="truncate">{data.portfolio}</span>
                </div>
              )}
            </div>

            {/* Technical Skills */}
            {skillsList.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-200/80">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-white text-gray-800 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xs border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education in sidebar */}
            {data.education && (
              <div className="space-y-2 pt-2 border-t border-gray-200/80">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Education
                </h3>
                <div className="text-xs text-gray-800 leading-snug">
                  {renderLines(data.education)}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-200/60">
            Placement Verified Resume
          </div>
        </div>

        {/* Right Main Content (68%) */}
        <div className="w-[534px] p-8 space-y-6 flex-1">
          {/* Summary */}
          {data.summary && (
            <section className="space-y-1.5">
              <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: accent.border }}>
                <Sparkles className="w-4 h-4" style={{ color: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Professional Summary
                </h2>
              </div>
              <p className="text-[12.5px] leading-relaxed text-gray-700 text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experience && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: accent.border }}>
                <Briefcase className="w-4 h-4" style={{ color: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Work Experience & Internships
                </h2>
              </div>
              <div>{renderLines(data.experience)}</div>
            </section>
          )}

          {/* Projects */}
          {data.projects && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: accent.border }}>
                <FolderGit2 className="w-4 h-4" style={{ color: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Key Projects
                </h2>
              </div>
              <div>{renderLines(data.projects)}</div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: accent.border }}>
                <Trophy className="w-4 h-4" style={{ color: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Achievements & Certifications
                </h2>
              </div>
              <div>{renderLines(data.achievements)}</div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ================= TEMPLATE 2: CLASSIC ATS MINIMALIST =================
  if (template === "classic") {
    return (
      <div
        id="resume-a4-preview"
        className="w-[794px] min-h-[1123px] bg-white text-gray-900 shadow-xl p-10 font-serif leading-normal box-border"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        {/* Header */}
        <div className="text-center pb-3 border-b-2" style={{ borderColor: accent.hex }}>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">
            {data.name || "YOUR NAME"}
          </h1>
          {data.roleTitle && (
            <p className="text-xs font-sans font-medium text-gray-600 mt-0.5 tracking-wide">
              {data.roleTitle}
            </p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-sans text-gray-700 mt-2">
            {[data.email, data.phone, data.linkedin, data.github, data.portfolio]
              .filter(Boolean)
              .map((item, idx, arr) => (
                <span key={idx} className="flex items-center gap-2">
                  <span>{item}</span>
                  {idx < arr.length - 1 && <span className="text-gray-400">•</span>}
                </span>
              ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 pt-4">
          {/* Summary */}
          {data.summary && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Professional Summary
              </h2>
              <p className="text-[12.5px] leading-relaxed text-gray-800 text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {/* Technical Skills */}
          {skillsList.length > 0 && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Technical Skills
              </h2>
              <p className="text-[12.5px] text-gray-800 font-sans leading-relaxed">
                {skillsList.join("  •  ")}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experience && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Work Experience
              </h2>
              <div className="font-sans">{renderLines(data.experience)}</div>
            </section>
          )}

          {/* Projects */}
          {data.projects && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Technical Projects
              </h2>
              <div className="font-sans">{renderLines(data.projects)}</div>
            </section>
          )}

          {/* Education */}
          {data.education && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Education
              </h2>
              <div className="font-sans">{renderLines(data.education)}</div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements && (
            <section>
              <h2
                className="text-xs font-sans font-bold uppercase tracking-wider pb-1 border-b border-gray-300 mb-1.5"
                style={{ color: accent.hex }}
              >
                Achievements & Certifications
              </h2>
              <div className="font-sans">{renderLines(data.achievements)}</div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ================= TEMPLATE 3: TECH DEVELOPER / EXECUTIVE =================
  return (
    <div
      id="resume-a4-preview"
      className="w-[794px] min-h-[1123px] bg-white text-gray-900 shadow-xl font-sans overflow-hidden box-border"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Top Banner Header */}
      <div className="p-8 pb-6 border-b-4" style={{ borderColor: accent.hex, backgroundColor: accent.light }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {data.name || "Your Name"}
            </h1>
            <div className="inline-block px-2.5 py-0.5 mt-1.5 rounded-full text-xs font-bold text-white shadow-2xs" style={{ backgroundColor: accent.hex }}>
              {data.roleTitle || "Software Engineer"}
            </div>
          </div>
          <div className="text-right text-xs text-gray-700 space-y-1">
            {data.email && <div className="font-medium">{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            <div className="flex gap-2 justify-end text-[11px] text-gray-600 font-mono">
              {data.github && <span>gh/{data.github.replace(/.*github\.com\/?/, "")}</span>}
              {data.linkedin && <span>in/{data.linkedin.replace(/.*linkedin\.com\/in\/?/, "")}</span>}
            </div>
          </div>
        </div>

        {/* Core Tech Stack Bar */}
        {skillsList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-300/70 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 shrink-0">
              Tech Stack:
            </span>
            {skillsList.slice(0, 10).map((skill, idx) => (
              <span
                key={idx}
                className="bg-white text-gray-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-gray-300 shadow-2xs"
              >
                {skill}
              </span>
            ))}
            {skillsList.length > 10 && (
              <span className="text-[10px] text-gray-500 font-medium">
                +{skillsList.length - 10} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-8 space-y-5">
        {/* Summary */}
        {data.summary && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accent.hex }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Candidate Profile
              </h2>
            </div>
            <p className="text-[12.5px] leading-relaxed text-gray-700 pl-4 border-l-2" style={{ borderColor: accent.border }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* Key Projects First for Tech Template */}
        {data.projects && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accent.hex }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Featured Projects & Architecture
              </h2>
            </div>
            <div className="pl-4 border-l-2" style={{ borderColor: accent.border }}>
              {renderLines(data.projects)}
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accent.hex }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Work Experience & Internships
              </h2>
            </div>
            <div className="pl-4 border-l-2" style={{ borderColor: accent.border }}>
              {renderLines(data.experience)}
            </div>
          </section>
        )}

        {/* Education & Achievements Split */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {data.education && (
            <section>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Education
                </h2>
              </div>
              <div className="pl-4 border-l-2" style={{ borderColor: accent.border }}>
                {renderLines(data.education)}
              </div>
            </section>
          )}

          {data.achievements && (
            <section>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accent.hex }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Honors & Competitive Coding
                </h2>
              </div>
              <div className="pl-4 border-l-2" style={{ borderColor: accent.border }}>
                {renderLines(data.achievements)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= MAIN RESUME GENERATOR PAGE =================
export default function ResumeGenerator() {
  const [formData, setFormData] = useState({
    name: "",
    roleTitle: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    achievements: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_COLORS[0]);
  const [activeTab, setActiveTab] = useState("contact");
  const [showAtsTips, setShowAtsTips] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.85);

  const [generateLoading, setGenerateLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // ATS Score analysis
  const atsAnalysis = useMemo(() => calculateAtsScore(formData), [formData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Load sample placement resume
  const handleLoadSample = () => {
    setFormData(SAMPLE_RESUME_DATA);
    toast.success("Loaded SDE placement sample resume!");
    trackEvent("resume_builder_used", { action: "load_sample" });
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all resume content?")) {
      setFormData({
        name: "",
        roleTitle: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        portfolio: "",
        summary: "",
        skills: "",
        experience: "",
        projects: "",
        education: "",
        achievements: "",
      });
      toast.info("Cleared resume fields.");
    }
  };

  // Auto-enhance with AI
  const handleGenerateAI = async () => {
    setGenerateLoading(true);
    const toastId = toast.loading("AI is analyzing and optimizing resume content...");
    try {
      const res = await api.post("/api/ai/generate-content", {
        name: formData.name || "Software Developer",
        education: formData.education || "B.Tech Computer Science",
      });

      if (res.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          name: prev.name || res.data.name || "Software Engineer Candidate",
        }));
        toast.dismiss(toastId);
        toast.success("Resume enhanced with AI suggestions!");
      }

      trackEvent("resume_builder_used", {
        action: "ai_generate",
        template: selectedTemplate,
      });
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("AI service is currently busy. You can use sample template or edit manually.");
    } finally {
      setGenerateLoading(false);
    }
  };

  // Client-side high-res PDF export with server fallback
  const handleDownloadPDF = async () => {
    if (!formData.name?.trim()) {
      toast.error("Please enter your name before downloading!");
      setActiveTab("contact");
      return;
    }

    setDownloadLoading(true);
    const loadingToast = toast.loading("Generating high-resolution A4 resume PDF...");

    try {
      const previewEl = document.getElementById("resume-a4-preview");
      if (!previewEl) throw new Error("Resume preview element not found");

      // High-resolution canvas capture
      const canvas = await html2canvas(previewEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      }

      const safeName = (formData.name || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${safeName}_Placement_Resume.pdf`);

      toast.dismiss(loadingToast);
      toast.success("Resume downloaded successfully!");
      trackEvent("resume_builder_used", {
        action: "download_pdf_success",
        template: selectedTemplate,
      });
    } catch (clientErr) {
      console.warn("Client-side export error, initiating server fallback:", clientErr);
      try {
        const res = await api.post(
          "/api/ai/generate-resume-pdf",
          {
            ...formData,
            template: selectedTemplate,
          },
          { responseType: "blob" }
        );

        const blobUrl = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = `${(formData.name || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`;
        downloadLink.click();
        URL.revokeObjectURL(blobUrl);

        toast.dismiss(loadingToast);
        toast.success("Resume downloaded via server fallback!");
      } catch (serverErr) {
        console.error("Server PDF fallback error:", serverErr);
        toast.dismiss(loadingToast);
        toast.error("Download failed. Please check your browser permissions or try again.");
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  // Copy Plain Text for ATS job forms
  const handleCopyText = () => {
    const textContent = `
${formData.name || "Candidate Name"}
${formData.roleTitle || ""}
${[formData.email, formData.phone, formData.linkedin, formData.github, formData.portfolio]
  .filter(Boolean)
  .join(" | ")}

PROFESSIONAL SUMMARY
${formData.summary}

TECHNICAL SKILLS
${formData.skills}

WORK EXPERIENCE
${formData.experience}

PROJECTS
${formData.projects}

EDUCATION
${formData.education}

ACHIEVEMENTS & CERTIFICATIONS
${formData.achievements}
`.trim();

    navigator.clipboard.writeText(textContent);
    toast.success("Plain text resume copied to clipboard!");
  };

  return (
    <>
      <Navbar />

      {/* Scoped Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-a4-preview, #resume-a4-preview * {
            visibility: visible !important;
          }
          #resume-a4-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            transform: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-bg text-text py-8 px-4 sm:px-6 lg:px-8 lg:ml-64 transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Placement Suite
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                ATS-Optimized Resume Builder
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Real-time Canva-style A4 preview • 100% ATS-friendly parsing • Zero-failure export
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="h-9 px-3 text-xs font-medium border-border hover:bg-surface-2 cursor-pointer flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5 text-primary" />
                Load SDE Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-9 px-3 text-xs font-medium border-border hover:bg-surface-2 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-text-subtle" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateAI}
                disabled={generateLoading}
                className="h-9 px-3 text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generateLoading ? "animate-spin" : ""}`} />
                {generateLoading ? "Enhancing..." : "Auto-Enhance with AI"}
              </Button>
            </div>
          </div>

          {/* Main 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Editor & Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* ATS Score & Feedback Card */}
              <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center font-bold text-xs text-primary">
                      {atsAnalysis.score}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text">ATS Optimization Score</h4>
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.2 rounded border ${atsAnalysis.gradeColor}`}>
                        {atsAnalysis.grade}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAtsTips(!showAtsTips)}
                    className="text-xs text-text-muted hover:text-text flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {showAtsTips ? "Hide Tips" : "View Tips"}
                    {showAtsTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${atsAnalysis.score}%`,
                      backgroundColor:
                        atsAnalysis.score >= 80 ? "#059669" : atsAnalysis.score >= 60 ? "#2563eb" : "#d97706",
                    }}
                  />
                </div>

                {/* Collapsible Tips Checklist */}
                {showAtsTips && (
                  <div className="pt-2 border-t border-border space-y-1.5 text-xs text-text-muted">
                    {atsAnalysis.tips.length === 0 ? (
                      <p className="text-emerald-600 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Outstanding! Your resume covers all key ATS metrics.
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold text-text text-[11px] uppercase tracking-wider">
                          Recommendations to increase callbacks:
                        </p>
                        {atsAnalysis.tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11.5px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Template & Styling Selector */}
              <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5" /> Choose Template
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Accent Color
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Template buttons */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {[
                      { id: "modern", label: "Modern Sidebar" },
                      { id: "classic", label: "Classic ATS" },
                      { id: "tech", label: "Tech Developer" },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-1 sm:flex-initial ${
                          selectedTemplate === tpl.id
                            ? "bg-primary text-on-primary shadow-2xs font-semibold"
                            : "bg-surface-2 text-text hover:bg-surface-2/80 border border-border"
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-2">
                    {ACCENT_COLORS.map((col) => (
                      <button
                        key={col.id}
                        title={col.name}
                        onClick={() => setSelectedAccent(col)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform flex items-center justify-center ${
                          selectedAccent.id === col.id ? "scale-110 ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {selectedAccent.id === col.id && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Editor Tabs */}
              <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
                {/* Navigation Pills */}
                <div className="flex border-b border-border bg-surface-2/40 overflow-x-auto p-1.5 gap-1 text-xs">
                  {[
                    { id: "contact", label: "Contact", icon: User },
                    { id: "summary", label: "Summary & Skills", icon: Sparkles },
                    { id: "experience", label: "Experience", icon: Briefcase },
                    { id: "projects", label: "Projects", icon: FolderGit2 },
                    { id: "education", label: "Education & Honors", icon: GraduationCap },
                    { id: "all", label: "All Fields", icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          activeTab === tab.id
                            ? "bg-surface text-primary shadow-2xs font-semibold"
                            : "text-text-muted hover:text-text hover:bg-surface/50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Form Fields Body */}
                <div className="p-5 space-y-4 max-h-[580px] overflow-y-auto">
                  {/* TAB 1: Contact Info */}
                  {(activeTab === "contact" || activeTab === "all") && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Personal Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">Full Name *</Label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Aman Sharma"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">Target Role / Title</Label>
                          <Input
                            name="roleTitle"
                            value={formData.roleTitle}
                            onChange={handleChange}
                            placeholder="e.g. Software Development Engineer"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">Email *</Label>
                          <Input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. aman.dev@gmail.com"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">Phone</Label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. +91 98765 43210"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">LinkedIn Profile</Label>
                          <Input
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="e.g. linkedin.com/in/amansharma"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-text mb-1 block">GitHub Profile</Label>
                          <Input
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            placeholder="e.g. github.com/amansharma"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs font-medium text-text mb-1 block">Portfolio Website</Label>
                          <Input
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleChange}
                            placeholder="e.g. amansharma.dev"
                            className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Summary & Skills */}
                  {(activeTab === "summary" || activeTab === "all") && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs font-medium text-text">Professional Summary</Label>
                          <span className="text-[10px] text-text-subtle">
                            {formData.summary?.split(/\s+/).filter(Boolean).length || 0} words
                          </span>
                        </div>
                        <Textarea
                          name="summary"
                          value={formData.summary}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Highlight your domain experience, core tech stack, and key career achievements..."
                          className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-text mb-1 block">
                          Technical Skills (Comma separated)
                        </Label>
                        <Textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Java, C++, React.js, Node.js, Express, MongoDB, Docker, Git..."
                          className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg"
                        />
                        {/* Live skills chips preview */}
                        {formData.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formData.skills
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-surface-2 border border-border px-2 py-0.5 rounded text-text font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Experience */}
                  {(activeTab === "experience" || activeTab === "all") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-text">Work Experience & Internships</Label>
                        <span className="text-[10px] text-primary font-medium">Use bullet points •</span>
                      </div>
                      <Textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        rows={6}
                        placeholder={"Software Engineer Intern — Acme Labs (May 2025 - Jul 2025)\n• Developed REST APIs with Node.js, reducing latency by 35%.\n• Built responsive UI components in React."}
                        className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-text-subtle">
                        💡 Pro-tip: Include quantified metrics (e.g. "improved speed by 25%") to pass ATS filters.
                      </p>
                    </div>
                  )}

                  {/* TAB 4: Projects */}
                  {(activeTab === "projects" || activeTab === "all") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-text">Key Projects</Label>
                        <span className="text-[10px] text-primary font-medium">STAR Format</span>
                      </div>
                      <Textarea
                        name="projects"
                        value={formData.projects}
                        onChange={handleChange}
                        rows={6}
                        placeholder={"PlaceMentor — AI Career Preparation App (React, Node.js, MongoDB)\n• Built full-stack platform with real-time coding battle arena.\n• Implemented WebSockets handling 500+ concurrent simulated users."}
                        className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg font-mono text-[11px]"
                      />
                    </div>
                  )}

                  {/* TAB 5: Education & Honors */}
                  {(activeTab === "education" || activeTab === "all") && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium text-text mb-1 block">Education & Academics</Label>
                        <Textarea
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          rows={3}
                          placeholder={"B.Tech in Computer Science — ABC University (2022 - 2026)\n• Current CGPA: 8.8 / 10.0"}
                          className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-text mb-1 block">Achievements & Certifications</Label>
                        <Textarea
                          name="achievements"
                          value={formData.achievements}
                          onChange={handleChange}
                          rows={3}
                          placeholder={"• LeetCode Knight (1900+ Rating), Top 5% Globally\n• Winner at Smart India Hackathon College Round\n• AWS Certified Cloud Practitioner"}
                          className="resize-none bg-surface-2 border-border text-text text-xs rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="p-4 border-t border-border bg-surface-2/30 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleDownloadPDF}
                      disabled={downloadLoading}
                      className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs shadow-soft transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className={`w-4 h-4 ${downloadLoading ? "animate-bounce" : ""}`} />
                      {downloadLoading ? "Generating PDF..." : "Download PDF (Instant)"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCopyText}
                      title="Copy Plain Text Resume"
                      className="h-10 px-3.5 rounded-xl border-border hover:bg-surface-2 text-xs font-medium cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy Text</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-subtle text-center">
                    ⚡ Client-side rendering guarantees immediate download on any deployment.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Live A4 Preview Canvas (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Preview Toolbar */}
              <div className="bg-surface rounded-xl border border-border px-4 py-2.5 shadow-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-text-subtle" />
                  <span className="text-xs font-bold text-text">Live A4 Paper Preview</span>
                  <span className="text-[11px] bg-primary-soft text-primary font-semibold px-2 py-0.5 rounded-full">
                    {selectedTemplate.toUpperCase()}
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
                    title="Zoom Out"
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-text-subtle w-10 text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale((z) => Math.min(1.2, z + 0.1))}
                    title="Zoom In"
                    className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomScale(0.85)}
                    title="Reset Zoom"
                    className="text-[11px] px-2 py-0.5 rounded text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer font-medium ml-1"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* A4 Canvas Container */}
              <div className="bg-surface-2/60 border border-border rounded-2xl p-4 sm:p-6 overflow-x-auto min-h-[750px] flex justify-center items-start">
                <div
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top center",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <ResumePreview
                    data={formData}
                    template={selectedTemplate}
                    accent={selectedAccent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
