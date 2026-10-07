import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { useTheme } from "../hooks/useTheme";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Code2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Flame,
  FileCode,
  CheckSquare,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Footer from "@/components/Footer.jsx";
import {
  getQuestionBoilerplate,
  wrapCodeWithDriver,
  parseFormatDetails,
  getConstraintList,
  getFormattedExamples,
} from "../utils/cpotdBoilerplates.js";

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: "js", label: "Node.js 18" },
  { id: "python", name: "Python 3", ext: "py", label: "Python 3.10" },
  { id: "c++", name: "C++17", ext: "cpp", label: "GCC 17" },
  { id: "java", name: "Java 17", ext: "java", label: "OpenJDK 17" },
];

const CodingPotdPage = () => {
  const dispatch = useDispatch();
  const {
    questions,
    currentQuestionIndex,
    submissionResult,
    loading,
    error,
    timer,
    timeUp: isTimeUp,
  } = useSelector((state) => state.codingPotd);

  const { executeCode, result: execResult, isLoading: execLoading, clearResult } = useCompiler();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();

  // Multi-language code state: codeMap[questionIndex][language]
  const [codeMap, setCodeMap] = useState({});
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0); // 0, 1, ... or 'custom'
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); // 'testcases' | 'output'
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const editorRef = useRef(null);
  const currentQuestion = questions[currentQuestionIndex];

  const formatDetails = parseFormatDetails(
    currentQuestion?.inputFormat,
    currentQuestion?.outputFormat,
    currentQuestion
  );
  const formattedExamples = getFormattedExamples(currentQuestion);
  const constraintsList = getConstraintList(currentQuestion?.constraints);

  // Fetch CPOTD questions on mount
  useEffect(() => {
    dispatch(fetchCpotd());
  }, [dispatch]);

  // Timer countdown
  useEffect(() => {
    if (isTimeUp) return;
    const interval = setInterval(() => {
      dispatch(setTimer(Math.max(0, timer - 1)));
      if (timer <= 1) {
        dispatch(timeUp());
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isTimeUp, dispatch]);

  // Sync / Initialize code when question or language changes
  useEffect(() => {
    if (!currentQuestion) return;

    const existing = codeMap[currentQuestionIndex]?.[language];
    if (existing !== undefined) {
      setCode(existing);
    } else {
      const boilerplate = getQuestionBoilerplate(currentQuestion, language);
      setCode(boilerplate);
      setCodeMap((prev) => ({
        ...prev,
        [currentQuestionIndex]: {
          ...(prev[currentQuestionIndex] || {}),
          [language]: boilerplate,
        },
      }));
    }

    // Default custom input to sample test case 1 if empty
    if (!customInput && currentQuestion.sampleTestCases?.[0]?.input) {
      setCustomInput(currentQuestion.sampleTestCases[0].input);
    }
  }, [currentQuestionIndex, language, currentQuestion]);

  // Handle editor code change
  const handleEditorChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    setCodeMap((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...(prev[currentQuestionIndex] || {}),
        [language]: newCode,
      },
    }));
  };

  // Reset boilerplate code
  const handleResetCode = () => {
    if (!currentQuestion) return;
    const boilerplate = getQuestionBoilerplate(currentQuestion, language);
    setCode(boilerplate);
    setCodeMap((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...(prev[currentQuestionIndex] || {}),
        [language]: boilerplate,
      },
    }));
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy console output
  const handleCopyOutput = () => {
    if (!execResult?.output) return;
    navigator.clipboard.writeText(execResult.output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  // Determine input to run
  const getInputToRun = () => {
    if (selectedCaseIdx === "custom") {
      return customInput || "";
    }
    return currentQuestion?.sampleTestCases?.[selectedCaseIdx]?.input || customInput || "";
  };

  // Run Code
  const handleRun = async () => {
    if (!currentQuestion || execLoading || isTimeUp) return;
    setActiveConsoleTab("output");
    const inputToRun = getInputToRun();
    const executableCode = wrapCodeWithDriver(code, currentQuestion, language);
    await executeCode(executableCode, language, inputToRun);
  };

  // Submit Code
  const handleSubmit = async () => {
    if (isSubmitting || !currentQuestion || isTimeUp) return;
    setIsSubmitting(true);
    try {
      const executableCode = wrapCodeWithDriver(code, currentQuestion, language);
      const res = await dispatch(
        submitCpotdCode({
          questionIndex: currentQuestionIndex,
          language,
          code: executableCode,
        })
      );
      if (res?.payload) {
        await getCurrentUser();
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  // Test case evaluation verdict
  const getTestVerdict = () => {
    if (!execResult) return null;

    if (execResult.hasError) {
      return {
        type: "error",
        label: execResult.errorCategory || "Execution Error",
        color: "text-red-400 bg-red-500/10 border-red-500/30",
        badge: "bg-red-500 text-white",
      };
    }

    if (selectedCaseIdx !== "custom" && currentQuestion?.sampleTestCases?.[selectedCaseIdx]) {
      const expected = currentQuestion.sampleTestCases[selectedCaseIdx].expectedOutput.trim();
      const actual = (execResult.output || "").trim();
      const passed = expected === actual;
      return {
        type: passed ? "passed" : "wrong",
        label: passed ? "Test Passed" : "Wrong Answer",
        passed,
        expected,
        actual,
        color: passed
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          : "text-rose-400 bg-rose-500/10 border-rose-500/30",
        badge: passed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white",
      };
    }

    return {
      type: "custom",
      label: "Execution Finished",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      badge: "bg-blue-500 text-white",
    };
  };

  const verdict = getTestVerdict();

  if (loading && !questions.length) {
    return (
      <>
        <Navbar />
        <div className="pt-28 pb-16 min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-text">Loading Today's Challenge...</h2>
            <p className="text-sm text-text-muted">Fetching problem of the day and test cases</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-28 pb-16 min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-text">Failed to Load Challenge</h2>
            <p className="text-sm text-text-muted">{typeof error === "string" ? error : "An unexpected error occurred."}</p>
            <Button onClick={() => dispatch(fetchCpotd())} variant="outline">
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className={`pt-20 lg:pt-20 lg:pl-64 px-3 sm:px-6 pb-12 min-h-screen bg-bg text-text transition-colors duration-200 ${
          isFullscreen ? "fixed inset-0 z-50 pt-4 lg:pl-4 bg-bg overflow-y-auto" : ""
        }`}
        onKeyDown={handleKeyDown}
      >
        <div className="max-w-[1600px] mx-auto space-y-4">
          {/* Top Bar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/30" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text">
                    Coding Problem of the Day
                  </h1>
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
                    POTD
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Solve daily algorithm challenges, write working driver solutions & earn XP
                </p>
              </div>
            </div>

            {/* Questions Switcher & Timer */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      dispatch(setCurrentQuestion(idx));
                      dispatch(clearSubmission());
                      clearResult();
                      setSelectedCaseIdx(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      currentQuestionIndex === idx
                        ? "bg-card text-text shadow-xs font-semibold"
                        : "text-text-muted hover:text-text hover:bg-card/50"
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    <span className="hidden sm:inline text-[11px] truncate max-w-[100px]">
                      {q.title}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        q.difficulty === "easy"
                          ? "bg-emerald-500"
                          : q.difficulty === "medium"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-semibold transition-all ${
                  timer < 300
                    ? "bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse"
                    : timer < 600
                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                      : "bg-card border-border text-text"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* SUBMISSION VERDICT VIEW */}
          {submissionResult ? (
            <div className="max-w-4xl mx-auto space-y-6 pt-4 animate-in fade-in duration-300">
              <Card
                className={`border-2 overflow-hidden shadow-lg ${
                  submissionResult.isAccepted
                    ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card"
                    : "border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-card to-card"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {submissionResult.isAccepted ? (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center">
                          <XCircle className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-text">
                          {submissionResult.isAccepted ? "Accepted! All Tests Passed" : "Submission Result"}
                        </h2>
                        <p className="text-sm text-text-muted">
                          {submissionResult.passed} / {submissionResult.totalTests} test cases passed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-primary">
                          {submissionResult.score}%
                        </div>
                        <span className="text-xs text-text-muted">Score</span>
                      </div>
                      {submissionResult.xpEarned > 0 && (
                        <Badge className="bg-amber-500 text-white font-semibold text-sm px-3 py-1">
                          +{submissionResult.xpEarned} XP 🎉
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Test Cases Results Breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      Detailed Test Cases Evaluation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {submissionResult.results?.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl border text-sm transition-all ${
                            r.passed
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : r.error
                                ? "bg-amber-500/5 border-amber-500/30"
                                : "bg-rose-500/5 border-rose-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs flex items-center gap-1.5">
                              {r.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                              Test Case #{r.testCase}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-mono ${
                                r.passed
                                  ? "border-emerald-500 text-emerald-500"
                                  : r.error
                                    ? "border-amber-500 text-amber-500"
                                    : "border-rose-500 text-rose-500"
                              }`}
                            >
                              {r.passed ? "Passed" : r.error ? "Runtime Error" : "Wrong Answer"}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="text-text-muted truncate">
                              <span className="font-sans font-semibold text-text">Input: </span>
                              {r.input}
                            </div>
                            {r.error ? (
                              <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs whitespace-pre-wrap">
                                {r.error}
                              </div>
                            ) : (
                              <>
                                <div className="text-emerald-500 truncate">
                                  <span className="font-sans font-semibold text-text">Expected: </span>
                                  {r.expected}
                                </div>
                                <div
                                  className={`truncate ${
                                    r.passed ? "text-emerald-500" : "text-rose-500 font-bold"
                                  }`}
                                >
                                  <span className="font-sans font-semibold text-text">Your Output: </span>
                                  {r.got || "(no output)"}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solution Explanation if available */}
                  {submissionResult.solutionExplanation && (
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <h4 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Editorial & Explanation
                      </h4>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {submissionResult.solutionExplanation}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      onClick={() => dispatch(clearSubmission())}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again / Edit Code
                    </Button>
                    {currentQuestionIndex + 1 < questions.length && (
                      <Button
                        onClick={() => {
                          dispatch(setCurrentQuestion(currentQuestionIndex + 1));
                          dispatch(clearSubmission());
                          clearResult();
                          setSelectedCaseIdx(0);
                        }}
                        className="flex-1 bg-primary text-primary-foreground"
                      >
                        Next Problem
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate("/dashboard")}
                      variant="secondary"
                      className="flex-1 sm:flex-none"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* MAIN SPLIT VIEW (PROBLEM & IDE) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* LEFT PANEL: Problem Details (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border border-border bg-card shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            currentQuestion?.difficulty === "easy"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : currentQuestion?.difficulty === "medium"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {currentQuestion?.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentQuestion?.difficulty === "easy" ? "+50 XP" : "+100 XP"}
                        </Badge>
                      </div>

                      <div className="text-xs text-text-muted">
                        Problem {currentQuestionIndex + 1} of {questions.length}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-text mt-2">{currentQuestion?.title}</h2>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/60 p-1 rounded-xl">
                        <TabsTrigger value="description" className="text-xs rounded-lg">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="testcases" className="text-xs rounded-lg">
                          Test Cases ({currentQuestion?.sampleTestCases?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="hints" className="text-xs rounded-lg">
                          Constraints & Tips
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab 1: Problem Description */}
                      <TabsContent value="description" className="space-y-4 mt-0">
                        <div
                          className="prose dark:prose-invert max-w-none text-sm text-text-muted leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: currentQuestion?.description,
                          }}
                        />

                        {/* Examples Section (LeetCode Style) */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-primary" />
                            Examples
                          </h4>
                          {formattedExamples.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs"
                            >
                              <div className="font-semibold text-xs text-text flex items-center justify-between">
                                <span className="text-primary font-bold">Example {idx + 1}:</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                  {idx === 0 ? "Sample Case" : "Test Case"}
                                </Badge>
                              </div>
                              <div className="space-y-1.5 pl-2.5 border-l-2 border-primary/40 font-mono text-xs">
                                <div>
                                  <span className="font-semibold text-text font-sans">Input: </span>
                                  <span className="text-text-muted break-words">{ex.input}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-text font-sans">Output: </span>
                                  <span className="text-emerald-500 font-bold break-words">{ex.expectedOutput}</span>
                                </div>
                                {ex.explanation && (
                                  <div className="pt-0.5">
                                    <span className="font-semibold text-text font-sans">Explanation: </span>
                                    <span className="text-text-muted font-sans text-xs">{ex.explanation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Function Signature & Parameters (Readable Specifications) */}
                        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-2.5">
                          <div className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Function Parameters & Return Type
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {formatDetails.params.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 flex-wrap p-2 rounded-lg bg-muted/40 border border-border/50"
                              >
                                <span className="font-mono font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded text-[11px]">
                                  {p.name}
                                </span>
                                <span className="font-mono text-[11px] text-text-muted px-1.5 py-0.5 bg-background rounded border border-border/50">
                                  {p.type}
                                </span>
                                <span className="text-text-muted text-xs">
                                  — {p.desc}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 flex-wrap p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                                Returns:
                              </span>
                              <span className="font-mono font-bold text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded text-[11px]">
                                {formatDetails.returnType}
                              </span>
                              <span className="text-text-muted text-xs">
                                — {formatDetails.returnDesc}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Constraints (Clean Bullet List) */}
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
                          <div className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Constraints
                          </div>
                          <ul className="space-y-1.5 text-xs text-text-muted font-mono list-disc list-inside">
                            {constraintsList.map((c, i) => (
                              <li key={i} className="leading-relaxed">
                                <code className="bg-background/80 px-1.5 py-0.5 rounded border border-border/40 text-[11px] text-text">
                                  {c}
                                </code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      {/* Tab 2: Test Cases Explorer */}
                      <TabsContent value="testcases" className="space-y-3 mt-0">
                        <p className="text-xs text-text-muted mb-2">
                          Click "Use in Runner" to test your solution against any of these sample cases.
                        </p>
                        {currentQuestion?.sampleTestCases?.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border transition-all text-xs font-mono space-y-2 ${
                              selectedCaseIdx === idx
                                ? "bg-primary/5 border-primary/40 shadow-xs"
                                : "bg-muted/30 border-border hover:border-border/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                Sample Case #{idx + 1}
                              </span>
                              <Button
                                size="sm"
                                variant={selectedCaseIdx === idx ? "default" : "outline"}
                                className="h-6 text-[11px] px-2"
                                onClick={() => {
                                  setSelectedCaseIdx(idx);
                                  setCustomInput(tc.input);
                                  setActiveConsoleTab("testcases");
                                }}
                              >
                                {selectedCaseIdx === idx ? "Active" : "Use in Runner"}
                              </Button>
                            </div>
                            <div className="p-2 rounded bg-background/60 border border-border/60">
                              <span className="text-text-muted font-sans text-[11px] block font-semibold mb-0.5">
                                Input:
                              </span>
                              <div className="text-text break-words">{tc.input}</div>
                            </div>
                            <div className="p-2 rounded bg-background/60 border border-border/60">
                              <span className="text-text-muted font-sans text-[11px] block font-semibold mb-0.5">
                                Expected Output:
                              </span>
                              <div className="text-emerald-500 font-semibold break-words">
                                {tc.expectedOutput}
                              </div>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      {/* Tab 3: Constraints & Hints */}
                      <TabsContent value="hints" className="space-y-4 mt-0">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                          <span className="text-xs font-bold text-text uppercase tracking-wide flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Constraints
                          </span>
                          <ul className="space-y-1.5 text-xs text-text-muted font-mono list-disc list-inside">
                            {constraintsList.map((c, i) => (
                              <li key={i} className="leading-relaxed">
                                <code className="bg-background/80 px-1.5 py-0.5 rounded border border-border/40 text-[11px] text-text">
                                  {c}
                                </code>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                            <Sparkles className="w-4 h-4" />
                            How Input Parsing Works
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            The starter code automatically reads from standard input (stdin) and passes
                            the parsed arguments into your solution function. You only need to write your
                            logic inside the function.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT PANEL: Monaco IDE & Console Runner (7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                {/* Editor Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-border">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium flex items-center gap-1.5 pl-1">
                      <Code2 className="w-3.5 h-3.5 text-primary" />
                      Language:
                    </span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-muted/80 text-text border border-border px-2.5 py-1.5 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name} ({lang.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Editor Tool Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleResetCode}
                      className="h-7 px-2.5 text-xs text-text-muted hover:text-text"
                      title="Reset code to question boilerplate"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset Code
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCode}
                      className="h-7 px-2.5 text-xs text-text-muted hover:text-text"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-7 px-2 text-xs text-text-muted hover:text-text"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Monaco Code Editor */}
                <Card className="border border-border bg-card shadow-xs overflow-hidden">
                  <div className="h-[430px] w-full">
                    <Editor
                      key={`${currentQuestionIndex}-${language}`}
                      height="100%"
                      theme={isDark ? "vs-dark" : "light"}
                      language={language === "c++" ? "cpp" : language}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={(editor) => {
                        editorRef.current = editor;
                      }}
                      options={{
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        readOnly: isTimeUp,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: "on",
                        lineNumbers: "on",
                        folding: true,
                        bracketPairColorization: { enabled: true },
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
                </Card>

                {/* BOTTOM CONSOLE & TESTCASE RUNNER */}
                <Card className="border border-border bg-card shadow-xs overflow-hidden">
                  <div className="border-b border-border p-2 bg-muted/40 flex items-center justify-between flex-wrap gap-2">
                    {/* Console Tabs */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveConsoleTab("testcases")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          activeConsoleTab === "testcases"
                            ? "bg-card text-text shadow-xs border border-border"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-primary" />
                        Test Cases
                      </button>

                      <button
                        onClick={() => setActiveConsoleTab("output")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          activeConsoleTab === "output"
                            ? "bg-card text-text shadow-xs border border-border"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5 text-amber-500" />
                        Execution Console
                        {execResult && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              execResult.hasError ? "bg-red-500" : "bg-emerald-500"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    {/* Console Actions / Clear / Copy */}
                    {activeConsoleTab === "output" && execResult && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyOutput}
                          className="h-6 text-[11px] px-2 text-text-muted"
                        >
                          {copiedOutput ? (
                            <Check className="w-3 h-3 text-emerald-500 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          Copy Output
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearResult}
                          className="h-6 text-[11px] px-2 text-text-muted hover:text-rose-500"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    {/* Console Tab 1: Test Cases Selector */}
                    {activeConsoleTab === "testcases" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {currentQuestion?.sampleTestCases?.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCaseIdx(idx);
                                if (currentQuestion.sampleTestCases[idx]?.input) {
                                  setCustomInput(currentQuestion.sampleTestCases[idx].input);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedCaseIdx === idx
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "bg-muted text-text-muted hover:bg-muted/80"
                              }`}
                            >
                              Case {idx + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setSelectedCaseIdx("custom")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedCaseIdx === "custom"
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "bg-muted text-text-muted hover:bg-muted/80"
                            }`}
                          >
                            + Custom Input
                          </button>
                        </div>

                        {/* Input Display / Editor */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-text flex items-center justify-between">
                            <span>
                              {selectedCaseIdx === "custom"
                                ? "Custom Input (passed to stdin)"
                                : `Input for Case ${selectedCaseIdx + 1}:`}
                            </span>
                            <span className="text-[11px] text-text-muted font-normal">
                              {selectedCaseIdx === "custom"
                                ? "Editable"
                                : "Read-only (switch to Custom Input to edit)"}
                            </span>
                          </label>
                          <textarea
                            value={
                              selectedCaseIdx === "custom"
                                ? customInput
                                : currentQuestion?.sampleTestCases?.[selectedCaseIdx]?.input || ""
                            }
                            onChange={(e) => {
                              if (selectedCaseIdx === "custom") {
                                setCustomInput(e.target.value);
                              }
                            }}
                            readOnly={selectedCaseIdx !== "custom"}
                            rows={3}
                            placeholder="Enter custom input string..."
                            className="w-full bg-background font-mono text-xs p-2.5 rounded-lg border border-border focus:outline-hidden focus:ring-1 focus:ring-primary resize-y"
                          />
                        </div>

                        {selectedCaseIdx !== "custom" &&
                          currentQuestion?.sampleTestCases?.[selectedCaseIdx] && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs font-mono">
                              <span className="font-sans font-semibold text-text text-[11px] block mb-1">
                                Expected Output:
                              </span>
                              <span className="text-emerald-500 font-semibold">
                                {currentQuestion.sampleTestCases[selectedCaseIdx].expectedOutput}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Console Tab 2: Execution Output / Error Diagnostics */}
                    {activeConsoleTab === "output" && (
                      <div className="space-y-3">
                        {execLoading ? (
                          <div className="p-6 text-center space-y-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                            <p className="text-xs text-text-muted">Compiling and running code against sandbox...</p>
                          </div>
                        ) : !execResult ? (
                          <div className="p-6 text-center text-text-muted text-xs">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            Click <strong className="text-text">"Run Code"</strong> to execute your solution
                          </div>
                        ) : (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            {/* Verdict Banner */}
                            <div
                              className={`p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2 ${
                                verdict?.color || "bg-muted border-border"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {verdict?.type === "passed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : verdict?.type === "wrong" ? (
                                  <XCircle className="w-5 h-5 text-rose-500" />
                                ) : verdict?.type === "error" ? (
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                )}
                                <span className="font-bold text-sm">{verdict?.label}</span>
                              </div>

                              <div className="flex items-center gap-3 text-xs font-mono">
                                {execResult.time && (
                                  <span>
                                    Time: <strong>{execResult.time}</strong>
                                  </span>
                                )}
                                {execResult.memory && execResult.memory !== "N/A" && (
                                  <span>
                                    Mem: <strong>{execResult.memory}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Error Details if compilation / runtime error */}
                            {execResult.hasError ? (
                              <div className="space-y-2">
                                <div className="p-3 rounded-lg bg-black text-rose-300 font-mono text-xs overflow-x-auto max-h-48 border border-red-500/30 whitespace-pre-wrap">
                                  {execResult.compile_output ||
                                    execResult.stderr ||
                                    execResult.output ||
                                    "Error occurred during execution"}
                                </div>
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-start gap-2">
                                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Diagnostic Hint:</strong>{" "}
                                    {execResult.errorCategory === "Compilation Error"
                                      ? "Check for syntax errors, missing semicolons, or undeclared variables on the lines specified above."
                                      : "Check for runtime issues such as array out-of-bounds, reading properties of null/undefined, or recursion depth."}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Success / Output Diff Comparison */
                              <div className="space-y-2 text-xs font-mono">
                                {selectedCaseIdx !== "custom" &&
                                  currentQuestion?.sampleTestCases?.[selectedCaseIdx] && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                                        <span className="font-sans font-semibold text-text text-[11px] block mb-1">
                                          Expected Output:
                                        </span>
                                        <div className="text-emerald-500 font-semibold break-words">
                                          {currentQuestion.sampleTestCases[selectedCaseIdx].expectedOutput}
                                        </div>
                                      </div>
                                      <div
                                        className={`p-2.5 rounded-lg border ${
                                          verdict?.type === "passed"
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                            : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                                        }`}
                                      >
                                        <span className="font-sans font-semibold text-text text-[11px] block mb-1">
                                          Your Output:
                                        </span>
                                        <div className="font-semibold break-words">
                                          {execResult.output || "(no output returned)"}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {(selectedCaseIdx === "custom" ||
                                  !currentQuestion?.sampleTestCases?.[selectedCaseIdx]) && (
                                  <div className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-xs overflow-x-auto max-h-48 border border-border whitespace-pre-wrap">
                                    {execResult.output || "(no output returned)"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  {/* BOTTOM ACTION BAR */}
                  <div className="border-t border-border p-3 bg-muted/30 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-text-muted hidden sm:inline">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Ctrl + Enter</kbd> to run
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        onClick={handleRun}
                        disabled={execLoading || isTimeUp}
                        variant="outline"
                        className="h-9 px-4 text-xs font-semibold"
                      >
                        {execLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                        )}
                        Run Code
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isTimeUp || !currentQuestion}
                        className="h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Submit Solution
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Time Up Alert Banner if expired and not submitted */}
          {isTimeUp && !submissionResult && (
            <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-center space-y-3 max-w-xl mx-auto">
              <Clock className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-text">Time's Up!</h3>
              <p className="text-xs text-text-muted">
                Your 30-minute test duration has ended. Submit your current solution now to see your final score.
              </p>
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="px-8">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Final Submit
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CodingPotdPage;
