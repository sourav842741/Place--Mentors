import React, { useState } from 'react';
import Step1QuizSetup from '../components/Step1QuizSetup';
import Step2QuizPlay from '../components/Step2QuizPlay';
import Step3QuizResult from '../components/Step3QuizResult';
import QuizNav from '../components/QuizNav';

function QuizPage() {
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState(null);

  return (
    <>
      <QuizNav />
      <div className="min-h-screen bg-gray-50">
        {step === 1 && (
          <Step1QuizSetup
            onStart={(data) => {
              setQuizData(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <Step2QuizPlay
            interviewData={quizData}
            onFinish={(result) => {
              setQuizData(result);
              setStep(3);
            }}
          />
        )}

        {step === 3 && <Step3QuizResult result={quizData} />}
      </div>
    </>
  );
}

export default QuizPage;
