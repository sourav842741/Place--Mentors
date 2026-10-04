import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle, Play, Code } from "lucide-react";
import { useAdminCreate } from "../../hooks/useAdminCreate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminCreateCpotd = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    sampleTestCases: [{ id: 1, input: "", expected: "" }],
    hiddenTestCases: [{ id: 1, input: "", expected: "" }],
    solutionExplanation: "",
  });
  const { loading, error, success, createCpotd } = useAdminCreate();
  const navigate = useNavigate();

  const addTestCase = (type) => {
    const newId = formData[type].length + 1;
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: newId, input: "", expected: "" }],
    }));
  };

  const removeTestCase = (type, id) => {
    if (formData[type].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [type]: prev[type].filter((tc) => tc.id !== id),
      }));
    }
  };

  const updateTestCase = (type, id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    }));
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.solutionExplanation.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      formData.sampleTestCases.some((tc) => !tc.input.trim() || !tc.expected.trim()) ||
      formData.hiddenTestCases.some((tc) => !tc.input.trim() || !tc.expected.trim())
    ) {
      toast.error("Please fill all test cases");
      return;
    }

    const cpotdData = {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      sampleTestCases: formData.sampleTestCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
      })),
      hiddenTestCases: formData.hiddenTestCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
      })),
      solutionExplanation: formData.solutionExplanation,
    };

    try {
      await createCpotd(cpotdData);
      toast.success("CPOTD created successfully!");
      navigate("/admin/cpotd");
    } catch (err) {
      toast.error(error || "Failed to create CPOTD");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text lg:ml-72 p-4 md:p-6 space-y-8 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text">
            Create Manual CPOTD
          </h1>
          <p className="text-text-muted mt-2">
            Create custom Coding Problem of the Day
          </p>
        </div>
        {/*  GENERATE BUTTON */}
        <Button
          onClick={async () => {
            try {
              await api.post("/api/cpotd/generate");
              toast.success("CPOTD Generated!");
            } catch {
              toast.error("Failed to generate");
            }
          }}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 font-medium"
        >
          ⚡ Quick Trigger CPOTD
        </Button>
      </div>

      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-text font-bold">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-text block mb-2">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateFormField("title", e.target.value)}
              placeholder="Enter problem title..."
              className="h-11 text-base rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-text block mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Enter problem description..."
              className="text-base rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              rows={5}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-semibold text-text block mb-2">
                Difficulty
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) => updateFormField("difficulty", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-border bg-surface-2 text-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border text-text">
                  <SelectItem value="easy" className="text-text hover:bg-surface-2">Easy</SelectItem>
                  <SelectItem value="medium" className="text-text hover:bg-surface-2">Medium</SelectItem>
                  <SelectItem value="hard" className="text-text hover:bg-surface-2">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Test Cases */}
      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-text font-bold">
            <div className="px-3 py-1.5 bg-primary-soft text-primary border border-primary/20 rounded-xl font-bold text-sm">
              📋 Sample Test Cases
            </div>
            <Badge className="bg-primary-soft text-primary border border-primary/20 rounded-full font-medium">Visible to users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {formData.sampleTestCases.map((tc) => (
            <div
              key={tc.id}
              className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-xl bg-surface-2/40"
            >
              <div className="flex-1">
                <label className="text-xs font-semibold text-text mb-1.5 block">
                  Input
                </label>
                <Input
                  value={tc.input}
                  onChange={(e) =>
                    updateTestCase("sampleTestCases", tc.id, "input", e.target.value)
                  }
                  placeholder="Enter input..."
                  className="font-mono rounded-xl border-border bg-surface text-text focus:border-primary h-10"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-text mb-1.5 block">
                  Expected Output
                </label>
                <Input
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestCase("sampleTestCases", tc.id, "expected", e.target.value)
                  }
                  placeholder="Enter expected output..."
                  className="font-mono rounded-xl border-border bg-surface text-text focus:border-primary h-10"
                />
              </div>
              {formData.sampleTestCases.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="self-end p-2.5 rounded-xl h-10 bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20"
                  onClick={() => removeTestCase("sampleTestCases", tc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-2 border-dashed border-border hover:border-primary/50 text-text w-full h-11 text-sm font-semibold rounded-xl bg-surface-2/20 hover:bg-surface-2/50 transition-colors"
            onClick={() => addTestCase("sampleTestCases")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Test Case
          </Button>
        </CardContent>
      </Card>

      {/* Hidden Test Cases */}
      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-text font-bold">
            <div className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm">
              🔒 Hidden Test Cases
            </div>
            <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-medium">Secret tests</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {formData.hiddenTestCases.map((tc) => (
            <div
              key={tc.id}
              className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-xl bg-surface-2/40"
            >
              <div className="flex-1">
                <label className="text-xs font-semibold text-text mb-1.5 block">
                  Input
                </label>
                <Input
                  value={tc.input}
                  onChange={(e) =>
                    updateTestCase("hiddenTestCases", tc.id, "input", e.target.value)
                  }
                  placeholder="Enter input..."
                  className="font-mono rounded-xl border-border bg-surface text-text focus:border-primary h-10"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-text mb-1.5 block">
                  Expected Output
                </label>
                <Input
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestCase("hiddenTestCases", tc.id, "expected", e.target.value)
                  }
                  placeholder="Enter expected output..."
                  className="font-mono rounded-xl border-border bg-surface text-text focus:border-primary h-10"
                />
              </div>
              {formData.hiddenTestCases.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="self-end p-2.5 rounded-xl h-10 bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20"
                  onClick={() => removeTestCase("hiddenTestCases", tc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-2 border-dashed border-border hover:border-primary/50 text-text w-full h-11 text-sm font-semibold rounded-xl bg-surface-2/20 hover:bg-surface-2/50 transition-colors"
            onClick={() => addTestCase("hiddenTestCases")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hidden Test Case
          </Button>
        </CardContent>
      </Card>

      {/* Solution Explanation */}
      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-text font-bold">Solution Explanation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            value={formData.solutionExplanation}
            onChange={(e) => updateFormField("solutionExplanation", e.target.value)}
            placeholder="Detailed solution explanation..."
            className="text-base rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary font-mono"
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/admin/cpotd")}
              className="px-6 py-2.5 rounded-xl border-border bg-surface text-text hover:bg-surface-2 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={submitForm}
              disabled={loading}
              className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating CPOTD...
                </>
              ) : (
                "Create CPOTD"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateCpotd;
