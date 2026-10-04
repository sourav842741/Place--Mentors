import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useAdminCreate } from "../../hooks/useAdminCreate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const AdminCreatePotd = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "",
      options: ["", "", "", ""],
      correct: "",
      difficulty: "easy",
      category: "",
      explanation: "",
    },
  ]);
  const { loading, error, success, createPotd } = useAdminCreate();
  const navigate = useNavigate();

  const addQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
        options: ["", "", "", ""],
        correct: "",
        difficulty: "easy",
        category: "",
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (id, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, options: q.options.map((opt, i) => (i === index ? value : opt)) } : q
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (questions.length < 15) {
      console.log(" Less than 15 questions");
      toast.error("Minimum 15 questions required for POTD");
      return;
    }

    const hasEmpty = questions.some(
      (q) =>
        !q.text.trim() ||
        q.options.some((o) => !o.trim()) ||
        !q.correct ||
        !q.explanation.trim() ||
        !q.category
    );
    if (hasEmpty) {
      console.log(" Empty fields detected");
      toast.error("Please fill all fields completely");
      return;
    }

    const potdData = {
      questions: questions.map((q) => ({
        question: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        answer: q.correct,
        explanation: q.explanation.trim(),
        category: q.category,
        difficulty: q.difficulty,
      })),
    };

    try {
      await createPotd(potdData);

      toast.success("POTD created successfully!");
      navigate("/admin/potd");
    } catch (err) {
      toast.error(error || "Failed to create POTD");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text lg:ml-72 p-4 md:p-6 space-y-8 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text">
            Create Manual POTD
          </h1>
          <p className="text-text-muted mt-2">
            Create custom Problem of the Day (Minimum 15 questions)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary-soft text-primary border border-primary/20 rounded-full text-sm px-4 py-2 font-semibold">
            {questions.length} Questions
          </Badge>
          <Button
            type="button"
            onClick={async () => {
              try {
                await api.post("/api/potd/generate");
                toast.success("POTD Generated!");
              } catch {
                toast.error("Failed to generate");
              }
            }}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 font-medium"
          >
            ⚡ Quick Trigger POTD
          </Button>
        </div>
      </div>

      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-text font-bold">
            <div className="px-3 py-1.5 bg-primary-soft text-primary border border-primary/20 rounded-xl font-bold text-lg">
              {questions.length}/15+
            </div>
            Question List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, qIndex) => (
            <div
              key={`question-${question.id}`}
              className="p-5 border border-border rounded-2xl bg-surface-2/40 hover:bg-surface-2/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm">
                    Q{qIndex + 1}
                  </div>
                  <h3 className="text-xl font-bold text-text">
                    Question {qIndex + 1}
                  </h3>
                </div>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Question Text */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-text">
                  Question Text
                </label>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                  placeholder="Enter the question..."
                  className="h-12 text-base rounded-xl border-border bg-surface text-text placeholder:text-text-subtle focus:border-primary"
                />
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-semibold text-text">
                  Options
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-center gap-3 p-2.5 border border-border rounded-xl bg-surface"
                    >
                      <div className="w-8 h-8 bg-surface-2 border border-border rounded-lg flex items-center justify-center font-bold text-sm text-text">
                        {String.fromCharCode(65 + oIndex)}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        className="border-0 bg-transparent text-text focus-visible:ring-0 px-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-text block mb-2">
                    Correct Answer
                  </label>
                  <Select
                    value={question.correct}
                    onValueChange={(v) => updateQuestion(question.id, "correct", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border bg-surface text-text">
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      <SelectItem value="A" className="text-text hover:bg-surface-2">A</SelectItem>
                      <SelectItem value="B" className="text-text hover:bg-surface-2">B</SelectItem>
                      <SelectItem value="C" className="text-text hover:bg-surface-2">C</SelectItem>
                      <SelectItem value="D" className="text-text hover:bg-surface-2">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-text block mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={question.difficulty}
                    onValueChange={(v) => updateQuestion(question.id, "difficulty", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border bg-surface text-text">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      <SelectItem value="easy" className="text-text hover:bg-surface-2">Easy</SelectItem>
                      <SelectItem value="medium" className="text-text hover:bg-surface-2">Medium</SelectItem>
                      <SelectItem value="hard" className="text-text hover:bg-surface-2">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-text block mb-2">
                    Category
                  </label>
                  <Select
                    value={question.category}
                    onValueChange={(v) => updateQuestion(question.id, "category", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border bg-surface text-text">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      <SelectItem value="aptitude" className="text-text hover:bg-surface-2">Aptitude</SelectItem>
                      <SelectItem value="reasoning" className="text-text hover:bg-surface-2">Reasoning</SelectItem>
                      <SelectItem value="verbal" className="text-text hover:bg-surface-2">Verbal</SelectItem>
                      <SelectItem value="technical" className="text-text hover:bg-surface-2">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text">
                  Explanation
                </label>
                <Input
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                  placeholder="Detailed explanation for this question..."
                  className="h-11 rounded-xl border-border bg-surface text-text placeholder:text-text-subtle focus:border-primary"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Question Button */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
          <CardContent className="p-6 text-center">
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 px-8 py-3 rounded-xl font-bold transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Question
            </Button>
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
          <CardContent className="p-6">
            {questions.length < 15 && (
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 text-amber-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">
                    Minimum 15 Questions Required
                  </h3>
                  <p className="text-sm mt-0.5 opacity-90">
                    Add {15 - questions.length} more questions to enable submit
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/admin/potd")}
                className="px-6 py-2.5 rounded-xl border-border bg-surface text-text hover:bg-surface-2 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || questions.length < 15}
                className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating POTD...
                  </>
                ) : (
                  "Create POTD"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AdminCreatePotd;
