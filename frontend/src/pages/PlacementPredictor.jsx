import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Award,
  History,
  RotateCcw,
  Target,
} from "lucide-react";

import { toast } from "sonner";
import predictionApi from "../services/predictionApi";
import { trackEvent } from "../hooks/useAnalytics";

const PlacementPredictor = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    collegeTier: "",
    cgpa: "",
    skillsLevel: "",
    dsaLevel: "",
    projectsCount: "",
    communicationLevel: "",
    internshipExperience: "",
  });

  const tiers = ["Tier 1", "Tier 2", "Tier 3"];
  const skills = [
    "Beginner",
    "Intermediate",
    "Strong",
  ];
  const dsa = ["Weak", "Average", "Good"];
  const projects = ["0", "1-2", "3+"];
  const comm = ["Weak", "Average", "Good"];
  const internship = ["No", "Yes"];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const res =
        await predictionApi.getHistory();

      setHistory(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleInput = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      trackEvent("placement_predictor_used");

      const res =
        await predictionApi.predictPlacement(
          formData
        );

      setResult(res.data.prediction);

      toast.success(
        "Prediction generated successfully"
      );

      fetchHistory();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Prediction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const useOldPrediction = (item) => {
    setFormData(item.inputs);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <div className="lg:pl-64 px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Placement Predictor AI
          </h1>

          <p className="text-gray-500 mt-2">
            Check your placement chances in
            seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FORM */}
          <Card className="lg:col-span-2 border-0 shadow-2xl rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>
                Fill Your Profile
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    value={formData.collegeTier}
                    onValueChange={(v) =>
                      handleInput(
                        "collegeTier",
                        v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="College Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="CGPA"
                    type="number"
                    value={formData.cgpa}
                    onChange={(e) =>
                      handleInput(
                        "cgpa",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    value={formData.skillsLevel}
                    onValueChange={(v) =>
                      handleInput(
                        "skillsLevel",
                        v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Skills Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={formData.dsaLevel}
                    onValueChange={(v) =>
                      handleInput(
                        "dsaLevel",
                        v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="DSA Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {dsa.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    value={formData.projectsCount}
                    onValueChange={(v) =>
                      handleInput(
                        "projectsCount",
                        v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      formData.communicationLevel
                    }
                    onValueChange={(v) =>
                      handleInput(
                        "communicationLevel",
                        v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Communication" />
                    </SelectTrigger>
                    <SelectContent>
                      {comm.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select
                  value={
                    formData.internshipExperience
                  }
                  onValueChange={(v) =>
                    handleInput(
                      "internshipExperience",
                      v
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Internship Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {internship.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  {loading
                    ? "Analyzing..."
                    : "Predict Now"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* HISTORY */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        Recent History
      </div>

      <Badge
        variant="secondary"
        className="rounded-xl px-3"
      >
        {history.length}
      </Badge>
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3">
    {historyLoading ? (
      <div className="py-8 text-center text-sm text-gray-500">
        Loading...
      </div>
    ) : history.length === 0 ? (
      <div className="py-8 text-center text-sm text-gray-500">
        No history found
      </div>
    ) : (
      history
        .slice(0, 3)
        .map((item) => (
          <div
            key={item._id}
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl">
                {
                  item.manualScore
                    .placementChance
                }
                %
              </Badge>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-xl hover:bg-purple-100 dark:hover:bg-gray-700"
                onClick={() =>
                  useOldPrediction(
                    item
                  )
                }
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {
                item.manualScore
                  .expectedSalaryRange
              }
            </p>

            <Progress
              value={
                item.manualScore
                  .placementChance
              }
              className="h-2 mb-2"
            />

            <p className="text-xs text-gray-500">
              {new Date(
                item.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        ))
    )}

    {history.length > 3 && (
      <Button
        variant="outline"
        className="w-full rounded-2xl mt-2"
      >
        View All History (
        {history.length})
      </Button>
    )}
  </CardContent>
</Card>
        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="rounded-3xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Placement Chance
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-5xl font-bold mb-4">
                  {
                    result.manualScore
                      .placementChance
                  }
                  %
                </div>

                <Progress
                  value={
                    result.manualScore
                      .placementChance
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Salary Range
                </CardTitle>
              </CardHeader>

              <CardContent className="text-2xl font-bold">
                {
                  result.manualScore
                    .expectedSalaryRange
                }
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Readiness
                </CardTitle>
              </CardHeader>

              <CardContent className="text-5xl font-bold">
                {
                  result.manualScore
                    .readinessScore
                }
                %
              </CardContent>
            </Card>

            <Card className="md:col-span-3 rounded-3xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>

              <CardContent className="whitespace-pre-wrap">
                {
                  result.aiAnalysis
                    .personalizedSuggestions
                }
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PlacementPredictor;