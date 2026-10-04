import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Loader2, BookOpen, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGenerateNotesMutation, useGeneratePDFMutation } from "../redux/notesSlice";
import NoteDiagram from "./NoteDiagram";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const NotesForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: "",
    classLevel: "",
    examType: "",
    revisionMode: false,
    includeDiagram: false,
    includeChart: false,
  });
  const [currentNote, setCurrentNote] = useState(null);

  const [generateNotes, { isLoading: generateLoading, error: generateError }] =
    useGenerateNotesMutation();
  const [generatePDF, { isLoading: pdfLoading }] = useGeneratePDFMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await generateNotes(form).unwrap();
      setCurrentNote(result.data);
    } catch (err) {
      console.error("Generate error:", err);
    }
  };

  const handlePDFDownload = async () => {
    if (!currentNote) return;

    try {
      const blob = await generatePDF(currentNote).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ExamNotesAI-${form.topic}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
    }
  };

  const renderSubTopics = (subTopics) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(subTopics || {}).map(
          ([stars, topics]) =>
            stars &&
            topics &&
            topics.length > 0 && (
              <div
                key={stars}
                className="bg-surface border border-border rounded-xl p-4 shadow-subtle"
              >
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border">
                  <div className="flex items-center">
                    {stars.split("").map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <h4 className="text-xs font-semibold text-text uppercase tracking-wider">{stars} Level</h4>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {topics.map((topic, idx) => (
                    <li key={idx} className="text-text-muted flex items-start gap-1.5">
                      <span className="text-primary">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}
      </div>
    );
  };

  const renderList = (title, items) =>
    items &&
    items.length > 0 && (
      <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle">
        <h4 className="text-sm font-semibold text-text mb-3">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-text-muted flex items-start gap-2">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* FORM CARD */}
      <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 transition-colors">
        <div className="flex flex-row items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-2.5 text-text">
            <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Generate Exam Notes</h2>
              <p className="text-xs text-text-muted">Enter a subject or concept to create high-yield study notes</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 border-border bg-surface hover:bg-surface-2 text-text text-xs"
          >
            ← Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs font-medium text-text">
              Topic or Subject *
            </Label>
            <Input
              id="topic"
              placeholder="e.g. Normalization in DBMS, React Hooks, Dijkstra Algorithm"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="bg-surface-2 border-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-primary text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="classLevel" className="text-xs font-medium text-text">
              Academic / Experience Level
            </Label>
            <Input
              id="classLevel"
              placeholder="e.g. B.Tech 3rd Year, Beginner, Senior Developer"
              value={form.classLevel}
              onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
              className="bg-surface-2 border-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="examType" className="text-xs font-medium text-text">
              Target Exam / Interview Type
            </Label>
            <Input
              id="examType"
              placeholder="e.g. Campus Placements, GATE, Semester Exam, System Design"
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
              className="bg-surface-2 border-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* SWITCHES */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
              <Label htmlFor="revision-mode" className="text-xs font-medium text-text cursor-pointer">
                Revision Mode
              </Label>
              <Switch
                id="revision-mode"
                checked={form.revisionMode}
                onCheckedChange={(checked) => setForm({ ...form, revisionMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
              <Label htmlFor="include-diagram" className="text-xs font-medium text-text cursor-pointer">
                Include Diagram
              </Label>
              <Switch
                id="include-diagram"
                checked={form.includeDiagram}
                onCheckedChange={(checked) => setForm({ ...form, includeDiagram: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
              <Label htmlFor="include-charts" className="text-xs font-medium text-text cursor-pointer">
                Include Charts
              </Label>
              <Switch
                id="include-charts"
                checked={form.includeChart}
                onCheckedChange={(checked) => setForm({ ...form, includeChart: checked })}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="md:col-span-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            disabled={generateLoading || !form.topic}
            size="lg"
          >
            {generateLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Comprehensive Notes with AI...
              </>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Topper-Level Notes
              </span>
            )}
          </Button>
        </form>

        {generateError && (
          <Alert variant="destructive" className="mt-4 bg-danger-soft border-danger/20 text-danger text-xs">
            <AlertDescription>
              Failed to generate notes. Please check your prompt or network connection and retry.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* PREVIEW */}
      {currentNote && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-border rounded-xl p-5 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text capitalize">
                  {form.topic}
                </h2>
                <p className="text-xs text-text-muted">Generated Study Material</p>
              </div>
            </div>

            <Button
              onClick={handlePDFDownload}
              disabled={pdfLoading}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-medium"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Download PDF
            </Button>
          </div>

          {/* SUBTOPICS */}
          {renderSubTopics(currentNote.subTopics)}

          {/* NOTES CONTENT */}
          <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Comprehensive Notes
              </h3>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none text-text prose-p:text-text-muted prose-headings:text-text prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-code:bg-surface-2 prose-code:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {String(currentNote?.notes || "")}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* QUESTIONS & REVISION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderList("🎯 Quick Revision Points", currentNote.revisionPoints)}

            <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle space-y-4">
              <h4 className="text-sm font-semibold text-text">❓ Practice Questions</h4>

              {renderList("Short Questions", currentNote.questions?.short)}
              {renderList("Long Questions", currentNote.questions?.long)}

              {currentNote.questions?.diagram && (
                <div className="text-xs italic bg-primary-soft text-text p-3.5 rounded-lg border border-primary/20">
                  {currentNote.questions.diagram}
                </div>
              )}
            </div>
          </div>

          {/* DIAGRAM */}
          {currentNote.diagram?.data && (
            <NoteDiagram diagramData={currentNote.diagram.data} />
          )}
        </div>
      )}
    </div>
  );
};

export default NotesForm;
