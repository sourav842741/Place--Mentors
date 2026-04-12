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
     <div className="min-h-screen flex flex-col items-center justify-center 
bg-white dark:bg-gray-950 transition-colors duration-300">

  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>

  <p className="text-gray-500 dark:text-gray-400 text-lg">
    Loading Report...
  </p>

</div>
    );
  }

  return <Step3Report result={report} />;
}

export default InterviewReport;
