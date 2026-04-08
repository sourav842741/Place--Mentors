import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPotd, submitPotd, selectAnswer, resetPotd } from '../redux/potdSlice.js';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Loader2, Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

const PotdPage = () => {
  const dispatch = useDispatch();
  const { questions, userAnswers, result, loading, error, submitted } = useSelector((state) => state.potd);
  const { user } = useAuth();
  const [allAnswered, setAllAnswered] = useState(false);

  useEffect(() => {
    dispatch(fetchPotd());
    return () => dispatch(resetPotd());
  }, [dispatch]);

  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setAllAnswered(answeredCount === 15 && !submitted);
  }, [userAnswers, submitted]);

  const handleAnswerSelect = (questionIndex, selected) => {
    dispatch(selectAnswer({ questionIndex, selected }));
  };

  const handleSubmit = () => {
    const answers = Object.entries(userAnswers).map(([idx, selected]) => ({
      questionIndex: parseInt(idx),
      selected
    }));
    dispatch(submitPotd(answers));
  };

  // Loader
  if (loading && !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
          <p>{error}</p>
          <Button onClick={() => dispatch(fetchPotd())} className="mt-4">Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Target className="h-10 w-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-indigo-600">Problem of the Day</h1>
          </div>
          {user && <p className="text-gray-500">Welcome {user.fullName}</p>}
        </div>

        {!submitted ? (
          <>
            {/* Progress */}
            <Card className="mb-6 p-5">
              <div className="flex justify-between">
                <p className="font-semibold">{Object.keys(userAnswers).length}/15 answered</p>
                <p className="text-sm text-gray-500">Max XP: 150</p>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{ width: `${(Object.keys(userAnswers).length / 15) * 100}%` }}
                />
              </div>
            </Card>

            {/* Questions */}
            <div className="flex flex-col gap-6">
              {questions.map((q, index) => (
                <Card key={index} className="p-5 hover:shadow-lg transition">

                  <CardHeader className="flex flex-row justify-between items-center pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">Q{index + 1}</span>
                      <Badge>{q.difficulty}</Badge>
                      <Badge variant="outline">{q.category}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="mb-4 text-gray-900 font-medium">
                      {q.question}
                    </p>

                    <div className="grid gap-3">
                      {q.options.map((option, i) => (
                        <label
                          key={i}
                          className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name={`q${index}`}
                            value={option}
                            checked={userAnswers[index] === option}
                            onChange={() => handleAnswerSelect(index, option)}
                            className="mt-1"
                          />
                          <span>{option}</span>
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
              className="w-full mt-8 h-12"
            >
              {loading ? "Submitting..." : `Submit (${Object.keys(userAnswers).length}/15)`}
            </Button>
          </>
        ) : (
          <>
            {/* Results */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Results</h2>
              <p>Score: {result.score}/15</p>
              <p>XP Earned: {result.xpEarned}</p>
              <p>Weak Area: {result.weakArea}</p>
            </Card>

            {/* Detailed */}
            <div className="flex flex-col gap-4">
              {result.results.map((r, i) => (
                <Card key={i} className="p-4">
                  <p className="font-medium mb-2">Q{i + 1}: {r.question}</p>
                  <p className={r.isCorrect ? "text-green-600" : "text-red-600"}>
                    Your: {r.userAnswer} | Correct: {r.correctAnswer}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{r.explanation}</p>
                </Card>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PotdPage;