import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2, BookOpen, Star, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSingleNoteQuery, useGeneratePDFMutation } from "../redux/notesSlice";
import NoteDiagram from "../components/NoteDiagram";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function NoteDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleNoteQuery(id);
  const [generatePDF, { isLoading: pdfLoading }] = useGeneratePDFMutation();

  const note = data?.content;
  const topic = data?.topic;
  const createdAt = data?.createdAt;

  const renderSubTopics = (subTopics) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {Object.entries(subTopics || {}).map(([stars, topics]) =>
        stars && topics?.length > 0 ? (
          <div key={stars} className="bg-surface border border-border rounded-xl p-4 shadow-subtle">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border">
              <div className="flex items-center">
                {stars.split("").map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <h4 className="text-xs font-semibold text-text uppercase tracking-wider">{stars} Topics</h4>
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

  const renderList = (title, items) =>
    items?.length > 0 && (
      <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle">
        <h4 className="text-sm font-semibold text-text mb-3">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-text-muted flex gap-2 items-start">
              <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );

  const handlePDFDownload = async () => {
    if (!note) return;
    try {
      const blob = await generatePDF(note).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ExamNotesAI-${topic || "notes"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg text-text pt-24 lg:pt-24 lg:pl-64 px-4 flex items-center justify-center">
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm font-medium text-text-muted">Loading study notes...</p>
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
        <div className="min-h-screen bg-bg text-text pt-24 lg:pt-24 lg:pl-64 px-4 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6 bg-surface border border-border rounded-xl shadow-subtle text-center">
            <Alert variant="destructive" className="bg-danger-soft border-danger/20 text-danger text-xs mb-4">
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
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              to="/notes"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs text-text-subtle">
                Generated {new Date(createdAt).toLocaleDateString()}
              </span>

              <Button
                onClick={handlePDFDownload}
                disabled={pdfLoading}
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white text-xs gap-1.5 font-medium cursor-pointer"
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
          <div className="bg-surface border border-border rounded-xl p-6 shadow-subtle flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-primary">Revision Notes</span>
              <h1 className="text-xl md:text-2xl font-bold text-text capitalize mt-0.5">
                {topic}
              </h1>
            </div>
          </div>

          {/* SUBTOPICS */}
          {renderSubTopics(note.subTopics)}

          {/* COMPREHENSIVE NOTES */}
          <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Comprehensive Notes
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text prose-p:text-text-muted prose-headings:text-text prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-code:bg-surface-2 prose-code:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {note.notes || "No notes content available."}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderList("🎯 Revision Points", note.revisionPoints)}
              {renderList("❓ Short Questions", note.questions?.short)}
            </div>

            <div className="space-y-6">
              {renderList("📝 Long Questions", note.questions?.long)}

              {note.questions?.diagram && (
                <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-3">
                  <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Diagram Question
                  </h4>
                  <div className="bg-primary-soft border-l-4 border-primary p-4 rounded-r-xl">
                    <p className="text-xs italic text-text leading-relaxed">
                      {note.questions.diagram}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DIAGRAM */}
          {note.diagram?.data && <NoteDiagram diagramData={note.diagram.data} />}

          {/* CHARTS */}
          {note.charts?.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-4">
              <h4 className="text-sm font-semibold text-text">
                📊 Visual Aids & Key Summaries
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {note.charts.map((chart, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface-2 border border-border rounded-xl"
                  >
                    <h5 className="font-semibold text-xs mb-1.5 text-text">
                      Chart Summary {idx + 1}
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
