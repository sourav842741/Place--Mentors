import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Loader2,
  BookOpen,
  Star,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  FileText,
  RotateCcw,
  Zap,
  GraduationCap,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGenerateNotesMutation, useGeneratePDFMutation } from "../redux/notesSlice";
import NoteDiagram from "./NoteDiagram";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

// Smart presets for quick selection
const LEVEL_PRESETS = [
  "B.Tech 3rd/4th Year",
  "Fresher / Placements",
  "GATE CSE Aspirant",
  "Beginner CS Student",
];

const EXAM_PRESETS = [
  "Campus Placements & Tech Screen",
  "Semester University Exams",
  "GATE CSE",
  "System Design Rounds",
];

const NotesForm = ({ presetTopic }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: "",
    classLevel: "B.Tech 3rd/4th Year",
    examType: "Campus Placements & Tech Screen",
    revisionMode: true,
    includeDiagram: true,
    includeChart: true,
  });

  const [currentNote, setCurrentNote] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync with preset topic when clicked in hero
  useEffect(() => {
    if (presetTopic) {
      setForm((prev) => ({ ...prev, topic: presetTopic }));
    }
  }, [presetTopic]);

  const [generateNotes, { isLoading: generateLoading, error: generateError }] =
    useGenerateNotesMutation();
  const [generatePDF, { isLoading: pdfLoading }] = useGeneratePDFMutation();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.topic?.trim()) {
      toast.error("Please enter a subject or topic!");
      return;
    }

    const toastId = toast.loading("Analyzing syllabus & generating topper-level notes with AI...");
    try {
      const result = await generateNotes(form).unwrap();
      setCurrentNote(result.data);
      toast.dismiss(toastId);
      toast.success("Topper-level study notes ready!");

      // Scroll to preview smoothly
      setTimeout(() => {
        const previewEl = document.getElementById("generated-notes-preview");
        if (previewEl) {
          previewEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Generate error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to generate notes. Please check your topic or try again.");
    }
  };

  const handlePDFDownload = async () => {
    if (!currentNote) return;
    const downloadToast = toast.loading("Exporting study notes PDF...");
    try {
      const blob = await generatePDF(currentNote).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ExamNotes-${(form.topic || "study-notes").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(downloadToast);
      toast.success("Study notes PDF downloaded!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.dismiss(downloadToast);
      toast.error("Failed to generate PDF. You can copy the notes directly!");
    }
  };

  const handleCopyMarkdown = () => {
    if (!currentNote?.notes) return;
    navigator.clipboard.writeText(currentNote.notes);
    setCopied(true);
    toast.success("Notes copied to clipboard as Markdown!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Subtopics Breakdown with Star Rating Badges
  const renderSubTopics = (subTopics) => {
    if (!subTopics || Object.keys(subTopics).length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(subTopics).map(([stars, topics]) => {
          if (!topics || topics.length === 0) return null;

          const isTopTier = stars.includes("⭐⭐⭐") || stars === "3";
          const isMidTier = stars.includes("⭐⭐") || stars === "2";

          return (
            <div
              key={stars}
              className={`rounded-2xl border p-4 shadow-subtle ${
                isTopTier
                  ? "bg-amber-500/5 border-amber-500/20"
                  : isMidTier
                  ? "bg-blue-500/5 border-blue-500/20"
                  : "bg-surface border-border"
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/80">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {stars.split("").map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                    {isTopTier ? "Must-Know" : isMidTier ? "High Frequency" : "Core Basics"}
                  </h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-subtle">
                  {topics.length} Subtopics
                </span>
              </div>

              <ul className="space-y-1.5 text-xs">
                {topics.map((topic, idx) => (
                  <li key={idx} className="text-text-muted flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-snug text-[11.5px]">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Formatted Lists
  const renderList = (title, items, icon) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
          {icon || <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
          {title}
        </h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-text-muted flex items-start gap-2.5">
              <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed text-[12px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* GENERATOR FORM CARD */}
      <div className="bg-surface border border-border rounded-3xl shadow-subtle p-6 sm:p-8 transition-colors">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3 text-text">
            <div className="w-11 h-11 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shadow-soft">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text">
                Generate High-Yield Study Notes
              </h2>
              <p className="text-xs text-text-muted">
                Configured with 3-Star topic prioritization, diagrams, and flash revision points
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="self-start sm:self-auto h-9 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium cursor-pointer"
          >
            ← Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Topic Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topic-input" className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Topic or Subject *
              </Label>
              <span className="text-[11px] text-text-subtle">
                e.g. Normalization, Dijkstra, TCP Handshake
              </span>
            </div>
            <div className="relative flex items-center">
              <Input
                id="topic-input"
                placeholder="e.g. Normalization in DBMS, React Hooks, Dijkstra Algorithm, Virtual Memory"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="h-11 bg-surface-2/80 border-border text-text placeholder:text-text-subtle focus:ring-2 focus:ring-primary text-xs sm:text-sm rounded-xl pl-3.5 pr-9 font-medium"
                required
              />
              {form.topic && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, topic: "" })}
                  className="absolute right-3 text-text-subtle hover:text-text p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Academic Level & Target Exam Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Academic Level */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" /> Academic / Experience Level
              </Label>
              <Input
                value={form.classLevel}
                onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                placeholder="e.g. B.Tech 3rd Year, Beginner, Senior Developer"
                className="h-9 bg-surface-2 border-border text-text text-xs rounded-xl"
              />
              {/* Quick Level Pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {LEVEL_PRESETS.map((lvl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, classLevel: lvl })}
                    className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition cursor-pointer font-medium ${
                      form.classLevel === lvl
                        ? "bg-primary-soft text-primary border-primary/40 font-semibold"
                        : "bg-surface-2/60 text-text-muted border-border hover:bg-surface-2"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Exam */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> Target Exam / Interview Type
              </Label>
              <Input
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                placeholder="e.g. Campus Placements, GATE, Semester Exam"
                className="h-9 bg-surface-2 border-border text-text text-xs rounded-xl"
              />
              {/* Quick Exam Pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {EXAM_PRESETS.map((exm, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, examType: exm })}
                    className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition cursor-pointer font-medium ${
                      form.examType === exm
                        ? "bg-primary-soft text-primary border-primary/40 font-semibold"
                        : "bg-surface-2/60 text-text-muted border-border hover:bg-surface-2"
                    }`}
                  >
                    {exm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INTERACTIVE FEATURE TOGGLE CARDS */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Enhancement Modules
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Revision Mode */}
              <div
                onClick={() => setForm((p) => ({ ...p, revisionMode: !p.revisionMode }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  form.revisionMode
                    ? "bg-primary-soft/30 border-primary ring-1 ring-primary/30"
                    : "bg-surface-2/50 border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-text truncate">Revision Mode</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Flash cheat-sheet & formulas
                  </p>
                </div>
                <Switch
                  checked={form.revisionMode}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, revisionMode: v }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Include Diagrams */}
              <div
                onClick={() => setForm((p) => ({ ...p, includeDiagram: !p.includeDiagram }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  form.includeDiagram
                    ? "bg-primary-soft/30 border-primary ring-1 ring-primary/30"
                    : "bg-surface-2/50 border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-text truncate">Mermaid Diagrams</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Visual architecture & flow
                  </p>
                </div>
                <Switch
                  checked={form.includeDiagram}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, includeDiagram: v }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Include Charts */}
              <div
                onClick={() => setForm((p) => ({ ...p, includeChart: !p.includeChart }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  form.includeChart
                    ? "bg-primary-soft/30 border-primary ring-1 ring-primary/30"
                    : "bg-surface-2/50 border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-text truncate">Summary Matrix</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Comparative tables & metrics
                  </p>
                </div>
                <Switch
                  checked={form.includeChart}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, includeChart: v }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          {/* GENERATE SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={generateLoading || !form.topic?.trim()}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-soft transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {generateLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Crafting High-Yield Study Notes with AI... (~3-5s)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Topper-Level Notes</span>
              </>
            )}
          </Button>
        </form>

        {generateError && (
          <Alert variant="destructive" className="mt-4 bg-danger-soft border-danger/20 text-danger text-xs rounded-xl">
            <AlertDescription>
              Failed to generate notes. Please refine your topic query or retry.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* GENERATED NOTES PREVIEW SECTION */}
      {currentNote && (
        <div id="generated-notes-preview" className="space-y-6 pt-6 border-t border-border">
          {/* Sticky Toolbar Bar */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Generated Study Material
                </span>
                <h2 className="text-lg font-black text-text capitalize">
                  {form.topic}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-9 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Markdown"}
              </Button>

              <Button
                onClick={handlePDFDownload}
                disabled={pdfLoading}
                size="sm"
                className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-soft transition cursor-pointer flex items-center gap-1.5"
              >
                {pdfLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download PDF
              </Button>
            </div>
          </div>

          {/* High-Yield Subtopics breakdown */}
          {renderSubTopics(currentNote.subTopics)}

          {/* Full Markdown Notes Body */}
          <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2/40">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Detailed Study Guide & Theory
              </h3>
              <span className="text-xs text-text-subtle font-medium">
                Markdown Formatted
              </span>
            </div>

            <div className="p-6 sm:p-8 max-h-[650px] overflow-y-auto">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text prose-p:text-text-muted prose-headings:text-text prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-code:bg-surface-2 prose-code:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {String(currentNote?.notes || "")}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Practice Questions & Flash Revision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flash Revision Points */}
            <div className="space-y-4">
              {renderList(
                "🎯 60-Second Flash Revision Points",
                currentNote.revisionPoints,
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
              {renderList(
                "❓ Short 2-Mark Exam Questions",
                currentNote.questions?.short,
                <HelpCircle className="w-4 h-4 text-primary" />
              )}
            </div>

            {/* Long Questions & Diagram Questions */}
            <div className="space-y-4">
              {renderList(
                "📝 Comprehensive Long Questions",
                currentNote.questions?.long,
                <BookOpen className="w-4 h-4 text-primary" />
              )}

              {currentNote.questions?.diagram && (
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    Diagrammatic Exam Question
                  </h4>
                  <div className="bg-primary-soft/50 border-l-4 border-primary p-3.5 rounded-r-xl">
                    <p className="text-xs italic text-text leading-relaxed font-medium">
                      {currentNote.questions.diagram}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Concept Diagram */}
          {currentNote.diagram?.data && (
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-text">Visual Concept Architecture</h4>
              </div>
              <NoteDiagram diagramData={currentNote.diagram.data} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesForm;
