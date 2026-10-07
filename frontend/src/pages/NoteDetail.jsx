import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  BookOpen,
  Star,
  HelpCircle,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSingleNoteQuery, useGeneratePDFMutation } from "../redux/notesSlice";
import NoteDiagram from "../components/NoteDiagram";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

function NoteDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleNoteQuery(id);
  const [generatePDF, { isLoading: pdfLoading }] = useGeneratePDFMutation();
  const [copied, setCopied] = useState(false);

  const note = data?.content;
  const topic = data?.topic;
  const createdAt = data?.createdAt;

  const renderSubTopics = (subTopics) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {Object.entries(subTopics || {}).map(([stars, topics]) =>
        stars && topics?.length > 0 ? (
          <div
            key={stars}
            className={`rounded-2xl border p-4 shadow-subtle ${
              stars.includes("⭐⭐⭐") || stars === "3"
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-surface border-border"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {stars.split("").map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">{stars} Level</h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-subtle">
                {topics.length} Subtopics
              </span>
            </div>
            <div className="space-y-1.5">
              {topics.map((t, idx) => (
                <div key={idx} className="text-xs py-1.5 px-2.5 bg-surface-2 border border-border/70 rounded-lg text-text">
                  {t}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );

  const renderList = (title, items, icon) =>
    items?.length > 0 && (
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
          {icon || <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
          {title}
        </h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-text-muted flex gap-2 items-start">
              <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed text-[12px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );

  const handleCopy = () => {
    if (!note?.notes) return;
    navigator.clipboard.writeText(note.notes);
    setCopied(true);
    toast.success("Study notes copied as Markdown!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Study guide link copied to clipboard!");
    } catch {
      toast.error("Copy link failed");
    }
  };

  const handlePDFDownload = async () => {
    if (!note) return;
    const downloadToast = toast.loading("Generating high-resolution study notes PDF...");
    try {
      const blob = await generatePDF(note).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ExamNotesAI-${(topic || "notes").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(downloadToast);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(downloadToast);
      toast.error("PDF generation failed. Please copy the notes directly!");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg text-text pt-24 lg:pt-28 lg:pl-64 px-4 flex items-center justify-center">
          <div className="text-center py-20 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-sm font-semibold text-text-muted">Loading study notes...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !note) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg text-text pt-24 lg:pt-28 lg:pl-64 px-4 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6 bg-surface border border-border rounded-2xl shadow-subtle text-center space-y-4">
            <Alert variant="destructive" className="bg-danger-soft border-danger/20 text-danger text-xs rounded-xl">
              <AlertDescription>Note not found or access denied.</AlertDescription>
            </Alert>
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Notes Library
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-28 lg:pl-64 px-4 sm:px-6 lg:px-8 pb-16 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border/80">
            <Link
              to="/notes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Study Notes Library
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-subtle hidden sm:inline-block mr-2">
                Created {new Date(createdAt).toLocaleDateString()}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-9 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-9 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
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

          {/* TITLE HERO */}
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shrink-0 shadow-soft">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
                AI High-Yield Revision Guide
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-text capitalize leading-tight">
                {topic}
              </h1>
            </div>
          </div>

          {/* SUBTOPICS */}
          {renderSubTopics(note.subTopics)}

          {/* COMPREHENSIVE NOTES */}
          <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2/40">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Comprehensive Theory & Notes
              </h2>
              <span className="text-xs text-text-subtle font-medium">Verified Placement Content</span>
            </div>

            <div className="p-6 md:p-8">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text prose-p:text-text-muted prose-headings:text-text prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-code:bg-surface-2 prose-code:text-primary leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {note.notes || "No notes content available."}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* GRID: REVISION POINTS & QUESTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderList(
                "🎯 60-Second Flash Revision Points",
                note.revisionPoints,
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
              {renderList(
                "❓ Short 2-Mark Exam Questions",
                note.questions?.short,
                <HelpCircle className="w-4 h-4 text-primary" />
              )}
            </div>

            <div className="space-y-6">
              {renderList(
                "📝 Comprehensive Long Questions",
                note.questions?.long,
                <BookOpen className="w-4 h-4 text-primary" />
              )}

              {note.questions?.diagram && (
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary" />
                    Diagrammatic Exam Question
                  </h4>
                  <div className="bg-primary-soft/50 border-l-4 border-primary p-4 rounded-r-xl">
                    <p className="text-xs italic text-text leading-relaxed font-medium">
                      {note.questions.diagram}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DIAGRAM */}
          {note.diagram?.data && (
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-text">Visual Concept Diagram</h4>
              </div>
              <NoteDiagram diagramData={note.diagram.data} />
            </div>
          )}

          {/* CHARTS */}
          {note.charts?.length > 0 && (
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-subtle space-y-4">
              <h4 className="text-sm font-bold text-text flex items-center gap-2">
                <span>📊 Visual Aids & Matrix Summaries</span>
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {note.charts.map((chart, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-2 border border-border rounded-2xl"
                  >
                    <h5 className="font-bold text-xs mb-1.5 text-text">
                      Matrix Summary {idx + 1}
                    </h5>
                    <p className="text-xs text-text-muted leading-relaxed">{chart}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NoteDetail;
