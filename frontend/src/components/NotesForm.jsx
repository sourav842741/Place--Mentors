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
      console.log("API RESPONSE 👉", result);
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

      <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-4  ">
        {/* FORM */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle className="flex items-center gap-2">
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
          <CardContent className="space-y-6 md:ml-64 lg:ml-64 px-4 py-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Normalization in DBMS, Process Scheduling in OS"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Input
                  id="classLevel"
                  placeholder="e.g. B.Tech 3rd Year, Class 12"
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
                  placeholder="e.g. GATE, JEE, University Sem"
                  value={form.examType}
                  onChange={(e) =>
                    setForm({ ...form, examType: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="revisionMode"
                    checked={form.revisionMode}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, revisionMode: checked })
                    }
                  />
                  <Label htmlFor="revisionMode" className="font-medium">
                    Revision Mode
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeDiagram"
                    checked={form.includeDiagram}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, includeDiagram: checked })
                    }
                  />
                  <Label htmlFor="includeDiagram" className="font-medium">
                    Include Diagram
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeChart"
                    checked={form.includeChart}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, includeChart: checked })
                    }
                  />
                  <Label htmlFor="includeChart" className="font-medium">
                    Include Charts
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="md:col-span-2"
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

            {generateError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error:{" "}
                  {generateError?.data?.message ||
                    "Generation failed. Check credits?"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* PREVIEW */}
        {currentNote && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">📚 {form.topic}</h2>
              <Button
                onClick={handlePDFDownload}
                disabled={pdfLoading}
                variant="outline"
                size="lg"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>
            </div>

            {/* SUBTOPICS */}
            {renderSubTopics(currentNote.subTopics)}

            {/* NOTES */}
            <Card className="max-h-[500px] overflow-auto rounded-2xl border border-gray-200 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  📖
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Comprehensive Notes
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="prose prose-lg max-w-none prose-blue">
                  {console.log("NOTES DATA 👉", currentNote?.notes)}

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(currentNote?.notes || "")}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* REVISION */}
              {renderList(
                "🎯 Quick Revision Points",
                currentNote.revisionPoints,
              )}

              {/* QUESTIONS */}
              <Card>
                <CardHeader>
                  <CardTitle>❓ Practice Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderList("Short Questions", currentNote.questions?.short)}
                  {renderList("Long Questions", currentNote.questions?.long)}
                  {currentNote.questions?.diagram && (
                    <div className="space-y-1">
                      <h4 className="font-semibold">Diagram Based:</h4>
                      <p className="text-sm italic bg-blue-50 p-3 rounded">
                        {currentNote.questions.diagram}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* DIAGRAM */}
            <NoteDiagram diagramData={currentNote.diagram?.data} />

            {/* CHARTS */}
            {currentNote.charts?.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>📊 Charts & Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Charts rendering coming soon...</p>
                  <ul>
                    {currentNote.charts.map((chart, idx) => (
                      <li key={idx}>• {chart}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

export default NotesForm;
