import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPotd, submitPotd, selectAnswer, resetPotd } from "../redux/potdSlice.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Loader2, Target, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";

const PotdPage = () => {
  const dispatch = useDispatch();
  const { questions, userAnswers, result, loading, error, submitted } = useSelector(
    (state) => state.potd
  );
  const { user, getCurrentUser } = useAuth();
  const [allAnswered, setAllAnswered] = useState(false);

  //  FETCH ONLY (NO RESET BUG)
  useEffect(() => {
    dispatch(fetchPotd());
  }, [dispatch]);

  // CHECK ALL ANSWERS
  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setAllAnswered(answeredCount === 15 && !submitted);
  }, [userAnswers, submitted]);

  const handleAnswerSelect = (questionIndex, selected) => {
    dispatch(selectAnswer({ questionIndex, selected }));
  };

  //  FIXED SUBMIT (NO RESTART)
  const handleSubmit = async () => {
    const answers = Object.entries(userAnswers).map(([idx, selected]) => ({
      questionIndex: parseInt(idx),
      selected,
    }));

    await dispatch(submitPotd(answers));

    //  delay to avoid UI reset
    setTimeout(() => {
      getCurrentUser();
    }, 300);
  };

  // Loader
  if (loading && !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center max-w-md w-full">
          <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
          <p>{error}</p>
          <Button onClick={() => dispatch(fetchPotd())} className="mt-4 w-full">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-1">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Problem of the Day</h1>
            </div>

            {user && (
              <p className="text-text-muted text-xs">Aptitude, Core CS & Reasoning Daily Practice</p>
            )}
          </div>

          {!submitted ? (
            <>
              {/* Progress */}
              <Card className="mb-6 p-4 shadow-subtle bg-surface border border-border rounded-xl">
                <div className="flex justify-between text-xs sm:text-sm">
                  <p className="font-semibold text-text">
                    {Object.keys(userAnswers).length}/15 answered
                  </p>
                  <p className="text-text-muted">Max XP: 150</p>
                </div>

                <div className="mt-3 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{
                      width: `${(Object.keys(userAnswers).length / 15) * 100}%`,
                    }}
                  />
                </div>
              </Card>

              {/* Questions */}
              <div className="flex flex-col gap-5">
                {questions.map((q, index) => (
                  <Card
                    key={index}
                    className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-subtle transition"
                  >
                    <CardHeader className="flex flex-row justify-between items-center pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="bg-surface-2 border border-border px-2 py-0.5 rounded text-xs text-text-muted font-medium"
                        >
                          Q{index + 1}
                        </span>

                        <Badge
                          className={`text-xs px-2.5 py-0.5 rounded-full ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : q.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-danger-soft text-danger border border-danger/20"
                          }`}
                        >
                          {q.difficulty}
                        </Badge>

                        <Badge variant="outline" className="text-xs border-border text-text-muted">
                          {q.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="mb-4 text-text font-medium text-sm sm:text-base">
                        {q.question}
                      </p>

                      <div className="grid gap-2.5">
                        {q.options.map((option, i) => (
                          <label
                            key={i}
                            className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition text-xs sm:text-sm
                      ${
                        userAnswers[index] === option
                          ? "bg-primary-soft border-primary text-text font-medium"
                          : "hover:bg-surface-2 border-border text-text-muted"
                      }`}
                          >
                            <input
                              type="radio"
                              name={`q${index}`}
                              value={option}
                              checked={userAnswers[index] === option}
                              onChange={() => handleAnswerSelect(index, option)}
                              className="mt-0.5 accent-primary"
                            />
                            <span className="leading-relaxed">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="w-full mt-8 h-11 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {loading ? "Submitting..." : `Submit Daily Problem Set (${Object.keys(userAnswers).length}/15)`}
              </Button>
            </>
          ) : (
            <>
              {/* Results */}
              <Card className="p-6 mb-6 shadow-subtle text-center bg-surface border border-border rounded-xl">
                <h2 className="text-xl font-bold mb-3 text-text">🎉 Practice Completed</h2>
                <p className="text-base text-text">Score: <span className="font-bold text-primary">{result.score}/15</span></p>
                <p className="text-primary font-semibold text-sm mt-1">XP Earned: +{result.xpEarned}</p>
                <p className="text-xs text-text-muted mt-2">
                  Identified Weak Area: <span className="text-text font-medium">{result.weakArea}</span>
                </p>
              </Card>

              {/* Detailed Results */}
              <Card className="max-w-4xl mx-auto bg-surface border border-border rounded-xl shadow-subtle">
                <CardHeader>
                  <h3 className="text-base font-bold flex items-center gap-2 text-text">
                    📋 Question Breakdown & Review
                  </h3>
                </CardHeader>

                <CardContent className="space-y-4 p-6">
                  {result.results?.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border shadow-subtle transition-all ${
                        r.isCorrect
                          ? "bg-emerald-500/5 border-emerald-500/25"
                          : "bg-danger-soft/40 border-danger/25"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/60">
                        <span className="text-lg font-bold text-text">
                          Q{idx + 1}
                        </span>

                        {r.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-danger" />
                        )}

                        <Badge className={`${r.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                          {r.isCorrect ? "Correct" : "Wrong"}
                        </Badge>

                        <Badge variant="outline" className="ml-auto">
                          {r.difficulty}
                        </Badge>
                      </div>

                      <p className="text-gray-800 dark:text-gray-300 font-medium">{r.question}</p>

                      <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800 rounded-xl">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.explanation}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PotdPage;
