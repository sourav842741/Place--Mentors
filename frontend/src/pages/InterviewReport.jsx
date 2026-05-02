import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Step3Report from '../components/Step3QuizResult';

function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await api.get('/api/interview/report/' + id, {
          withCredentials: true,
        });

        setReport(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchReport();
  }, [id]);

  if (!report || Object.keys(report).length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center
        bg-gray-50 dark:bg-gray-950
        transition-colors duration-300"
      >
        {/* Loader */}
        <div
          className="w-12 h-12 border-4 
          border-blue-500 dark:border-blue-400
          border-t-transparent rounded-full animate-spin mb-5"
        ></div>

        {/* Text */}
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading Report...</p>

        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Preparing your interview insights
        </p>
      </div>
    );
  }

  return <Step3Report result={report} />;
}

export default InterviewReport;
