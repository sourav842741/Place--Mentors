import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { socket } from "../socket";
import {
  updateMyCode,
  decrementTimeLeft,
  updateMyLanguage,
  setTyping,
  battleResult,
  battleDraw,
  updateOpponentCode,
} from "../redux/battleSlice";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import api from "../services/api";
import Footer from "@/components/Footer";

const BattlePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const battle = useSelector((state) => state.battle);
  const {
    problem,
    timeLeft,
    myCode,
    status,
    opponent,
    results,
    submitterId,
    isWinner,
    isOpponentTyping,
    myLanguage,
  } = battle;

  const location = useLocation();

// 🔥 FINAL FIX
const finalOpponent = opponent || location.state?.opponent;

  const safeTime = Number(timeLeft) || 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef();
  const typingTimeoutRef = useRef();
  const [activeTab, setActiveTab] = useState("description");

  // Reset run results when code changes
  useEffect(() => {
    setRunResults(null);
  }, [myCode]);

  // JOIN BATTLE
  // 1 AUTO JOIN (TOP)
  useEffect(() => {
    if (roomId && user?._id) {
      socket.emit("join_battle", roomId);
    }
  }, [roomId, user?._id]);

  // CLEANUP
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // TIMER - Fixed with ref to avoid stale closure
  useEffect(() => {
    if (status !== "running") return;

    timerRef.current = setInterval(() => {
      dispatch(decrementTimeLeft());
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [status, dispatch]);

  // 🔥 FORCE DRAW SAFETY (IMPORTANT)
useEffect(() => {
  if (safeTime === 0 && status === "running") {
    console.log("FORCE DRAW TRIGGER (frontend)");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    dispatch(battleDraw());
  }
}, [safeTime, status, dispatch]);

  //  BATTLE RESULT LISTENER (Room-specific)
  useEffect(() => {
  const handleBattleResult = (data) => {
    dispatch(battleResult(data));
  };

  const handleOpponentCodeChange = (data) => {
    dispatch(updateOpponentCode(data));
  };

  // 🔥 ADD THIS
  const handleTyping = (isTyping) => {
    console.log("Typing:", isTyping);
    dispatch(setTyping(isTyping));
  };

  const handleBattleData = (data) => {
    dispatch({
      type: "battle/battleStart",
      payload: {
        roomId: data.roomId,
        problem: data.problem,
        timeLimit: data.remainingTime || 900,
        opponent: data.opponent || null,
      },
    });
  };

const handleDraw = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null; 
  }
  dispatch(battleDraw());
};

  socket.on("battle:result", handleBattleResult);
  socket.on("opponent_code_change", handleOpponentCodeChange);
  socket.on("opponent_typing", handleTyping);
  socket.on("battle:data", handleBattleData);
  socket.on("battle:draw", handleDraw);

  return () => {
    socket.off("battle:result", handleBattleResult);
    socket.off("opponent_code_change", handleOpponentCodeChange);
    socket.off("opponent_typing", handleTyping);
    socket.off("battle:data", handleBattleData);
    socket.off("battle:draw", handleDraw);
  };
}, [dispatch, roomId]);

  // CODE CHANGE + TYPING
  const handleCodeChange = useCallback(
    (value) => {
      const code = value || "";
      dispatch(updateMyCode(code));

      socket.emit("code:change", {
        roomId,
        code,
        language: myLanguage,
      });

      // Typing emit
      socket.emit("typing:start", { roomId, userId: user._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { roomId, userId: user._id });
      }, 1500);
    },
    [dispatch, roomId, user._id, myLanguage],
  );

  const handleLanguageChange = (value) => {
    dispatch(updateMyLanguage(value));
  };

  const handleRun = async () => {
    if (!myCode.trim() || isRunning || status !== "running") return;

    setIsRunning(true);
    setRunResults(null);

    try {
      const response = await api.post("/api/compiler/runTests", {
        code: myCode,
        language: myLanguage,
        testCases: problem?.testCases || [],
      });

      const rawResults = response.data.results || response.data || [];

      const results = rawResults.map((test, i) => ({
        passed: test.passed ?? false,
        got: test.output || test.stdout || test.got || "No Output",
        input: problem?.testCases?.[i]?.input || "N/A",
        expectedOutput: problem?.testCases?.[i]?.expectedOutput || "N/A",
      }));

      setRunResults(results);
    } catch (error) {
      console.error("Run Error:", error);

      setRunResults([
        {
          passed: false,
          input: "",
          expectedOutput: "",
          got: "Execution failed. Please check your code.",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !myCode.trim() || status !== "running") return;
    setIsSubmitting(true);
    socket.emit("battle:submit", {
      roomId,
      code: myCode,
      language: myLanguage,
      playerId: user._id,
    });
    setTimeout(() => setIsSubmitting(false), 10000);
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Reconnecting battle...</div>
      </div>
    );
  }

  const myResults = submitterId === user._id;
  const score = results
    ? ((results.filter((r) => r.passed).length / results.length) * 100).toFixed(
        0,
      )
    : 0;

  const passedCount = runResults?.filter((r) => r.passed).length || 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:ml-64 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER - Match CodingPotd */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ⚔️ Code Battle
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-mono">
                  {Math.floor(safeTime / 60)}:
                  {(safeTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Live Battle
              </Badge>
            </div>
          </div>

          {/* BATTLE RESULTS - Match CodingPotd Results UI */}
          {status === "submitted" && results && (
            <div className="max-w-4xl mx-auto space-y-6 mb-12">
              <div className="flex justify-between items-center mb-4">
                <Badge
                  className={`text-lg px-4 py-2 ${
                    isWinner ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {isWinner ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Perfect Score
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Some Failed
                    </>
                  )}
                </Badge>
                <Badge variant="secondary" className="text-lg">
                  {score}% Score
                </Badge>
              </div>
              <Card
                className={`${
                  isWinner
                    ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500"
                    : "bg-gradient-to-r from-red-900/50 to-rose-900/50 border-red-500"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-3xl">
                    Test Results (
                    {myResults ? "Your Submission" : "Opponent Submission"})
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {results.map((test, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl mb-3 border ${
                        test.passed
                          ? "bg-green-500/10 border-green-400"
                          : "bg-red-500/10 border-red-400"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            test.passed
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {test.passed ? "✔️" : "❌"}
                        </div>
                        <span className="font-semibold text-lg">
                          Test Case {i + 1}
                        </span>
                        <Badge
                          className={`ml-auto ${
                            test.passed
                              ? "border-green-500 text-green-700 bg-green-500/10"
                              : "border-red-500 text-red-700 bg-red-500/10"
                          }`}
                        >
                          {test.passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Input:</strong>
                          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                            {test.input}
                          </pre>
                        </div>
                        <div>
                          <strong>Expected:</strong>
                          <pre className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded mt-1 font-mono text-xs">
                            {test.expectedOutput}
                          </pre>
                        </div>
                        <div>
                          <strong>Got:</strong>
                          <pre
                            className={`p-2 rounded mt-1 font-mono text-xs ${
                              test.passed
                                ? "bg-emerald-50 dark:bg-emerald-900/30"
                                : "bg-rose-50 dark:bg-rose-900/30"
                            }`}
                          >
                            {test.got}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/users")}
                  className="flex-1"
                  variant="outline"
                >
                  Find New Battle
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* MAIN BATTLE UI - Exact CodingPotd Layout */}
          {status !== "submitted" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: Problem (col-span-5) */}
              <div className="lg:col-span-5">
                <Card className="border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          problem?.difficulty === "easy"
                            ? "default"
                            : problem?.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {problem?.difficulty?.toUpperCase()}
                      </Badge>
                      <CardTitle className="text-2xl">
                        {problem?.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="description">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                      </TabsList>

                      <TabsContent value="description" className="mt-4">
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: problem?.description,
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="testcases" className="mt-4">
                        <div className="space-y-4">
                          {problem?.testCases?.map((tc, i) => (
                            <div
                              key={i}
                              className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                            >
                              <h5 className="font-semibold mb-3">
                                Test Case {i + 1}
                              </h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <strong>Input:</strong>
                                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 text-sm font-mono whitespace-pre-wrap break-words overflow-auto max-h-32">
                                    {tc.input}
                                  </pre>
                                </div>
                                <div>
                                  <strong>Expected Output:</strong>
                                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 text-sm font-mono whitespace-pre-wrap break-words overflow-auto max-h-32">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* OPPONENT CARD - Top right style */}
               {finalOpponent && (
                 <Card className="mt-6 border border-gray-200 dark:border-white/10 
bg-white dark:bg-gray-900/70 backdrop-blur-xl 
shadow-md hover:shadow-xl transition-all duration-300">

  <CardHeader className="pb-2">
    <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-white">
      👤 Opponent
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="flex items-center gap-4 p-2">

      {/* Avatar */}
      <div className="relative">
        <img
          src={finalOpponent?.avatar || "/default-avatar.png"}
          className="w-14 h-14 rounded-full object-cover 
          ring-2 ring-blue-500/70 shadow-md"
        />

        {/* Online dot (optional) */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
      </div>

      <div className="flex-1">

        {/* Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {finalOpponent?.fullName || "Opponent"}
        </h3>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-xs mt-1 text-gray-600 dark:text-gray-300">

          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            ⚡ Lv. {finalOpponent?.level || 1}
          </span>

          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            🧠 XP: {finalOpponent?.xp || 0}
          </span>

          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            🔥 {finalOpponent?.streakCount || 0}
          </span>

        </div>

        {/* Typing */}
       {isOpponentTyping && (
  <div className="flex items-center gap-2 mt-2">

    {/* Animated dots */}
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
    </div>

    {/* Text */}
    <span className="text-xs text-blue-500 font-medium">
      Opponent is typing...
    </span>

  </div>
)}

      </div>
    </div>
  </CardContent>
</Card>
                )}
              </div>

              {/* RIGHT: Editor (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Language + Submit */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">
                      Language
                    </label>
                    <Select
                      value={myLanguage}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python 3</SelectItem>
                        <SelectItem value="java">Java 17</SelectItem>
                        <SelectItem value="cpp">C++17</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleRun}
                    disabled={
                      !myCode.trim() || isRunning || status !== "running"
                    }
                    className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 flex-1 lg:flex-none lg:w-32"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || status !== "running"}
                    className="flex-1 h-12 cursor-pointer"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Battle
                      </>
                    )}
                  </Button>
                </div>

                {/* Monaco Editor */}
                <Card className="border-0 h-[400px] md:h-[500px]">
                  <CardContent className="h-full p-0 pt-2">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={myLanguage === "cpp" ? "cpp" : myLanguage}
                      value={myCode}
                      onChange={handleCodeChange}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                      }}
                    />
                  </CardContent>
                </Card>

                {/* RUN Results */}
                {runResults && !isRunning && status !== "submitted" && (
                  <Card className="border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500">Run Results</Badge>
                        <CardTitle className="text-xl">
                          {passedCount}/{runResults.length} test cases passed
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                      {runResults.map((test, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border ${
                            test.passed
                              ? "bg-emerald-500/10 border-emerald-400"
                              : "bg-red-500/10 border-red-400"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                test.passed ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            >
                              {test.passed ? "✓" : "✗"}
                            </div>
                            <span className="font-semibold">
                              Test Case {i + 1}
                            </span>
                            <Badge
                              className={`ml-auto ${
                                test.passed
                                  ? "border-emerald-500 text-emerald-700 bg-emerald-500/10"
                                  : "border-red-500 text-red-700 bg-red-500/10"
                              }`}
                            >
                              {test.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <strong>Input:</strong>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                                {test.input}
                              </pre>
                            </div>
                            <div>
                              <strong>Expected:</strong>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                                {test.expectedOutput}
                              </pre>
                            </div>
                            <div>
                              <strong>Got:</strong>
                              <pre
                                className={`p-2 rounded font-mono text-xs ${
                                  test.passed
                                    ? "bg-emerald-50 dark:bg-emerald-900/30"
                                    : "bg-rose-50 dark:bg-rose-900/30"
                                }`}
                              >
                                {test.got}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {isRunning && status !== "submitted" && (
                  <Card className="border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl animate-pulse">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-500" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Running your code...
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Please wait for test results
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* TIME UP MODAL */}
          {status === "draw" && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-3xl p-8 shadow-2xl border">
                <Clock className="w-24 h-24 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-bold text-center mb-2">
                  Time Expired!
                </h2>
                <p className="text-center text-gray-600 mb-8">It's a draw!</p>
                <Button onClick={() => navigate("/users")} className="w-full">
                  Find New Opponent
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default BattlePage;
