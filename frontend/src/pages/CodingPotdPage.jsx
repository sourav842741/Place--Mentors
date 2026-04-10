import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCpotd,
  submitCpotdCode,
  setCurrentQuestion,
  clearSubmission,
  setTimer,
  timeUp,
  resetCodingPotd,
} from "../redux/codingPotdSlice.js";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar.jsx";

import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const CodingPotdPage = () => {
  const dispatch = useDispatch();
  const {
    questions,
    currentQuestionIndex,
    executionResults,
    submissionResult,
    loading,
    error,
    timer,
    timeUp: isTimeUp,
  } = useSelector((state) => state.codingPotd);
  const {
    executeCode,
    result: execResult,
    isLoading: execLoading,
  } = useCompiler();
  const [code, setCode] = useState("// Write your code here");
  const [codeMap, setCodeMap] = useState({});
  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();

  // ✅ fetch only once
  useEffect(() => {
    dispatch(fetchCpotd());
  }, [dispatch]);

  // ✅ timer logic separate
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(setTimer(timer - 1));

      if (timer <= 1) {
        dispatch(timeUp());
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, dispatch]);

  useEffect(() => {
    if (codeMap[currentQuestionIndex]) {
      setCode(codeMap[currentQuestionIndex]); // 🔥 load saved code
    } else {
      setCode("// Write your code here"); // default
    }

    setCustomInput(""); // input reset
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleRun = () => {
    if (currentQuestion) {
      executeCode(
        code,
        language,
        customInput || currentQuestion.sampleTestCases[0]?.input || "",
      );
    }
  };
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const res = await dispatch(
      submitCpotdCode({
        questionIndex: currentQuestionIndex,
        language,
        code,
      }),
    );

    if (res?.payload) {
      await getCurrentUser();
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    console.log("EXEC RESULT:", execResult);
  }, [execResult]);

  if (loading && !questions.length) return <div>Loading CPOTD...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 md:ml-64 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Coding Problem of the Day
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-mono">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Q{currentQuestionIndex + 1} / {questions.length}
              </Badge>
            </div>
          </div>

          {submissionResult ? (
            // Results
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-4">
                <Badge
                  className={`text-lg px-4 py-2 ${
                    submissionResult.isAccepted
                      ? "bg-green-500"
                      : submissionResult.results.some((r) => r.error)
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                >
                  {submissionResult.isAccepted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accepted
                    </>
                  ) : submissionResult.results.some((r) => r.error) ? (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Runtime Error
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Wrong Answer
                    </>
                  )}
                </Badge>
                {submissionResult.xpEarned > 0 && (
                  <Badge variant="secondary" className="text-lg">
                    +{submissionResult.xpEarned} XP ✅
                  </Badge>
                )}
              </div>
              <Card
                className={`${
                  submissionResult.isAccepted
                    ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500"
                    : "bg-gradient-to-r from-red-900/50 to-rose-900/50 border-red-500"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-3xl">
                    {submissionResult.score}% Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Test Cases</h3>
                    {submissionResult.results.map((r, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl mb-3 border ${r.passed ? "bg-green-500/10 border-green-400" : r.error ? "bg-yellow-500/10 border-yellow-400" : "bg-red-500/10 border-red-400"}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {r.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : r.error ? (
                            <XCircle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-semibold">
                            Test {r.testCase}
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-auto ${r.passed ? "border-green-500 text-green-700" : r.error ? "border-yellow-500 text-yellow-700" : "border-red-500 text-red-700"}`}
                          >
                            {r.passed ? "Passed" : r.error ? "Error" : "Failed"}
                          </Badge>
                        </div>
                        {r.error && (
                          <div className="text-xs bg-yellow-500/20 p-2 rounded mb-2 border border-yellow-500/50">
                            <strong>Error:</strong> {r.error}
                          </div>
                        )}
                        {!r.passed && !r.error && (
                          <div className="text-xs space-y-1 mt-2">
                            <div>
                              <strong>Expected:</strong>{" "}
                              <code>{r.expected}</code>
                            </div>
                            <div>
                              <strong>Got:</strong> <code>{r.got}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Solution</h3>
                    <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                      {submissionResult.solutionExplanation}
                    </pre>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                {/* 🔙 BACK BUTTON */}
                {currentQuestionIndex > 0 && (
                  <Button
                    onClick={() => {
                      dispatch(setCurrentQuestion(currentQuestionIndex - 1));
                      dispatch(clearSubmission());
                    }}
                    className="flex-1"
                    variant="outline"
                  >
                    ← Previous Question
                  </Button>
                )}

                {/* TRY AGAIN */}
                <Button
                  onClick={() => dispatch(clearSubmission())}
                  className="flex-1"
                  variant="outline"
                >
                  Try Again
                </Button>

                {/* NEXT BUTTON */}
                {currentQuestionIndex + 1 < questions.length && (
                  <Button
                    onClick={() => {
                      dispatch(setCurrentQuestion(currentQuestionIndex + 1));
                      dispatch(clearSubmission());
                    }}
                    className="flex-1"
                  >
                    Next Question →
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel - Problem (40%) */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border-0 bg-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          currentQuestion?.difficulty === "easy"
                            ? "default"
                            : currentQuestion?.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {currentQuestion?.difficulty?.toUpperCase()}
                      </Badge>
                      <h2 className="text-2xl font-bold">
                        {currentQuestion?.title}
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                        <TabsTrigger value="submit">Submit</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="description"
                        className="space-y-4 mt-4"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentQuestion?.description,
                          }}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Input Format</h4>
                            <pre className="bg-gray-300 text-white-300 font-mono p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap break-words border">
                              {currentQuestion?.inputFormat}
                            </pre>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">
                              Output Format
                            </h4>
                            <pre className="bg-gray-200 text-white-300 font-mono p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap break-words border">
                              {currentQuestion?.outputFormat}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Constraints</h4>
                          <pre className="bg-gray-200 text-white-300 font-mono p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap break-words border">
                            {currentQuestion?.constraints}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="testcases" className="mt-4">
                        <div className="space-y-3">
                          {currentQuestion?.sampleTestCases?.map((tc, i) => (
                            <div key={i} className="border rounded-lg p-4">
                              <h5 className="font-medium mb-2">
                                Sample Input {i + 1}
                              </h5>
                              <pre className="bg-black/20 p-3 rounded mb-2 text-xs">
                                {tc.input}
                              </pre>
                              <h5 className="font-medium mb-2">
                                Sample Output
                              </h5>
                              <pre className="bg-green-500/20 p-3 rounded text-xs border-green-500/50 border">
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="submit" className="mt-4">
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700">
                            Ready to submit your solution?
                          </p>
                          <Button
                            onClick={handleSubmit}
                            className="w-full"
                            disabled={loading || isTimeUp || isSubmitting}
                          >
                            {loading || isSubmitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Solution
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Editor (60%) */}

              <div className="lg:col-span-7 space-y-6">
                <div className="flex gap-4 items-center mb-4">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white/10 border-white/30 px-3 py-2 rounded-md text-sm"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java 17</option>
                    <option value="c++">C++17</option>
                  </select>
                  {/* <Button
                    onClick={handleRun}
                    className="flex-1 md:flex-none"
                    disabled={execLoading || isTimeUp}
                  >
                    {execLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Run Test
                  </Button> */}
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Custom input for testing (optional)"
                    className="flex-1 bg-white/10 border-2 p-2 rounded-md text-sm resize-none h-12"
                    disabled={execLoading || isTimeUp}
                  />
                </div>

                <Card className="border-0 bg-black/30 h-[500px]">
                  <CardContent className="h-full p-0 pt-2">
                    <Editor
                      key={currentQuestionIndex}
                      height="100%"
                      theme="vs-dark"
                      language={language}
                      value={code}
                      onChange={(val) => {
                        setCode(val);

                        setCodeMap((prev) => ({
                          ...prev,
                          [currentQuestionIndex]: val, // 🔥 save code per question
                        }));
                      }}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        readOnly: isTimeUp,
                      }}
                    />
                  </CardContent>
                </Card>
                <div className="flex gap-3 mt-4">
                  {currentQuestionIndex > 0 && (
                    <Button
                      onClick={() =>
                        dispatch(setCurrentQuestion(currentQuestionIndex - 1))
                      }
                      variant="outline"
                      className="flex-1"
                    >
                      ← Previous
                    </Button>
                  )}

                  <Button
                    onClick={handleRun}
                    disabled={execLoading || isTimeUp}
                    className="flex-1"
                  >
                    Run
                  </Button>

                  {currentQuestionIndex + 1 < questions.length && (
                    <Button
                      onClick={() =>
                        dispatch(setCurrentQuestion(currentQuestionIndex + 1))
                      }
                      className="flex-1"
                    >
                      Next →
                    </Button>
                  )}
                </div>

                {!execLoading && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Test Output
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-h-32 font-mono">
                        {execResult
                          ? execResult.output?.trim() ||
                            execResult.error ||
                            "No output"
                          : "Click Run to see output"}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {isTimeUp && !submissionResult && (
            <div className="text-center mt-8 p-8 bg-yellow-500/20 border border-yellow-500 rounded-xl">
              <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
              <p className="text-lg mb-6">
                Submit your current solution to see results.
              </p>
              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full max-w-md"
              >
                Final Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CodingPotdPage;
