import React, { useState } from "react";
import { Download, Loader2, BookOpen, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGenerateNotesMutation,
  useGeneratePDFMutation,
} from "../redux/notesSlice";
import NoteDiagram from "./NoteDiagram";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Navbar from "./Navbar";

const NotesForm = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-22  ">
        {Object.entries(subTopics || {}).map(
          ([stars, topics]) =>
            stars &&
            topics &&
            topics.length > 0 && (
              <Card key={stars}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-1">
                    {stars.split("").map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-500"
                      />
                    ))}
                    <CardTitle className="text-sm font-semibold">
                      {stars} Level
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-sm">
                    {topics.map((topic, idx) => (
                      <li key={idx} className="text-gray-800">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ),
        )}
      </div>
    );
  };

  const renderList = (title, items) =>
    items &&
    items.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Navbar />

     <div className="max-w-4xl mx-auto space-y-8 p-4 ">

  {/* FORM */}
  <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10">
    
    <CardHeader className="flex flex-row items-center justify-between">
      
      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
        <BookOpen className="h-6 w-6" />
        Generate Exam Notes
      </CardTitle>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1"
      >
        ← Dashboard
      </Button>

    </CardHeader>

    
    <CardContent className="space-y-6 px-4 py-6">

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >

        <div className="space-y-2">
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            placeholder="e.g. Normalization in DBMS"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classLevel">Class Level</Label>
          <Input
            id="classLevel"
            value={form.classLevel}
            onChange={(e) =>
              setForm({ ...form, classLevel: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="examType">Exam Type</Label>
          <Input
            id="examType"
            value={form.examType}
            onChange={(e) =>
              setForm({ ...form, examType: e.target.value })
            }
          />
        </div>

        {/* SWITCHES */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.revisionMode}
              onCheckedChange={(checked) =>
                setForm({ ...form, revisionMode: checked })
              }
            />
            <Label>Revision Mode</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.includeDiagram}
              onCheckedChange={(checked) =>
                setForm({ ...form, includeDiagram: checked })
              }
            />
            <Label>Include Diagram</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.includeChart}
              onCheckedChange={(checked) =>
                setForm({ ...form, includeChart: checked })
              }
            />
            <Label>Include Charts</Label>
          </div>

        </div>

        <Button
          type="submit"
          className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          disabled={generateLoading || !form.topic}
          size="lg"
        >
          {generateLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            "Generate Topper-Level Notes"
          )}
        </Button>

      </form>

    </CardContent>
  </Card>

  {/* PREVIEW */}
  {currentNote && (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3 
        bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-white/10 
        rounded-2xl px-5 py-3 shadow-sm">

          <BookOpen className="h-6 w-6 text-blue-600" />

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {form.topic}
          </h2>

        </div>

        <Button
          onClick={handlePDFDownload}
          disabled={pdfLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        >
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>

      </div>

      {/* SUBTOPICS */}
      {renderSubTopics(currentNote.subTopics)}

      {/* NOTES (🔥 MAIN FIX) */}
      <Card className="max-h-[500px] overflow-auto rounded-2xl 
      border border-gray-200 dark:border-white/10 
      shadow-xl bg-white dark:bg-gray-900">

        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            📖
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Comprehensive Notes
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="prose prose-lg max-w-none 
          dark:prose-invert 
          !bg-transparent
          prose-p:text-gray-800 dark:prose-p:text-gray-300 
          prose-headings:text-gray-900 dark:prose-headings:text-white">

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {String(currentNote?.notes || "")}
            </ReactMarkdown>

          </div>

        </CardContent>
      </Card>

      {/* QUESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {renderList("🎯 Quick Revision Points", currentNote.revisionPoints)}

        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              ❓ Practice Questions
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {renderList("Short Questions", currentNote.questions?.short)}
            {renderList("Long Questions", currentNote.questions?.long)}

            {currentNote.questions?.diagram && (
              <p className="text-sm italic bg-blue-50 dark:bg-gray-800 p-3 rounded">
                {currentNote.questions.diagram}
              </p>
            )}

          </CardContent>
        </Card>

      </div>

      {/* DIAGRAM */}
      <NoteDiagram diagramData={currentNote.diagram?.data} />

    </div>
  )}
</div>
    </>
  );
};

export default NotesForm;
