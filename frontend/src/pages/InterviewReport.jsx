import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Step3Report from "../components/Step3QuizResult";
function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await api.get("/api/interview/report/" + id, {
          withCredentials: true,
        });

        console.log(result.data);
        setReport(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchReport();
  }, []);

  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  return <Step3Report result={report} />;
}

export default InterviewReport;
