import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPotd,
  submitPotd,
  selectAnswer,
  resetPotd,
} from "../redux/potdSlice.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import {
  Loader2,
  Target,
  AlertCircle,
  XCircle,
  CheckCircle,
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import Navbar from "@/components/Navbar.jsx";

const PotdPage = () => {
  const dispatch = useDispatch();
  const { questions, userAnswers, result, loading, error, submitted } =
    useSelector((state) => state.potd);
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
      <div className="min-h-screen bg-gray-50 md:ml-64 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Target className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600">
                Problem of the Day
              </h1>
            </div>
            {user && (
              <p className="text-gray-500 text-sm">Welcome {user.fullName}</p>
            )}
          </div>

          {!submitted ? (
            <>
              {/* Progress */}
              <Card className="mb-6 p-4 shadow-sm">
                <div className="flex justify-between text-sm sm:text-base">
                  <p className="font-semibold">
                    {Object.keys(userAnswers).length}/15 answered
                  </p>
                  <p className="text-gray-500">Max XP: 150</p>
                </div>

                <div className="mt-3 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-500 rounded-full transition-all"
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
                    className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition"
                  >
                    <CardHeader className="flex flex-row justify-between items-center pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
                          Q{index + 1}
                        </span>

                        <Badge
                          className={`text-xs px-2.5 py-0.5 rounded-full ${
                            q.difficulty === "Easy"
                              ? "bg-green-100 text-green-700"
                              : q.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {q.difficulty}
                        </Badge>

                        <Badge variant="outline" className="text-xs">
                          {q.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="mb-4 text-gray-900 font-medium text-sm sm:text-base">
                        {q.question}
                      </p>

                      <div className="grid gap-3">
                        {q.options.map((option, i) => (
                          <label
                            key={i}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition
                            ${
                              userAnswers[index] === option
                                ? "bg-indigo-50 border-indigo-500"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q${index}`}
                              value={option}
                              checked={userAnswers[index] === option}
                              onChange={() => handleAnswerSelect(index, option)}
                              className="mt-1"
                            />
                            <span className="text-sm sm:text-base">
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
                className="w-full mt-8 h-12 text-lg"
              >
                {loading
                  ? "Submitting..."
                  : `Submit (${Object.keys(userAnswers).length}/15)`}
              </Button>
            </>
          ) : (
            <>
              {/* Results */}
              <Card className="p-6 mb-6 shadow-sm text-center">
                <h2 className="text-xl font-bold mb-4">🎉 Results</h2>
                <p className="text-lg">Score: {result.score}/15</p>
                <p className="text-green-600 font-semibold">
                  XP Earned: {result.xpEarned}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Weak Area: {result.weakArea}
                </p>
              </Card>

              {/* Detailed Results */}
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    📋 Detailed Results
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {result.results?.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border-2 shadow-sm transition-all ${
                        r.isCorrect
                          ? "bg-linear-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-200"
                          : "bg-linear-to-r from-red-50 to-pink-50 border-red-200 shadow-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                        <span className="text-2xl font-bold">Q{idx + 1}</span>
                        {r.isCorrect ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                        <Badge
                          className={`${
                            r.isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {r.isCorrect ? "Correct" : "Wrong"}
                        </Badge>
                        <Badge variant="outline" className="ml-auto">
                          {r.difficulty}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {r.question}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                          <div>
                            <strong className="text-sm font-semibold block mb-2 text-gray-700">
                              Your Answer:
                            </strong>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                                r.isCorrect
                                  ? "bg-green-100 text-green-900 border-green-300"
                                  : "bg-red-100 text-red-900 border-red-300"
                              }`}
                            >
                              {r.userAnswer || "Not answered"}
                            </span>
                          </div>
                          <div>
                            <strong className="text-sm font-semibold block mb-2 text-gray-700">
                              Correct Answer:
                            </strong>
                            <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-900 border-2 border-blue-300">
                              {r.correctAnswer}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4">
                          <strong className="text-sm font-semibold block mb-3 text-gray-700">
                            Explanation:
                          </strong>
                          <div className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-inner">
                            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                              {r.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PotdPage;
