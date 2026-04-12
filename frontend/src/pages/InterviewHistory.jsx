import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft } from "react-icons/fa";
import Footer from "@/components/Footer";
function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await api.get("/api/interview/get-interview", {
          withCredentials: true,
        });

        setInterviews(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    getMyInterviews();
  }, []);

  return (
    <>
     <div className="min-h-screen 
bg-gradient-to-br from-gray-50 to-emerald-50 
dark:from-gray-950 dark:to-gray-900 
py-10 transition-colors duration-300">

  <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">

    {/* HEADER */}
    <div className="mb-10 w-full flex items-start gap-4 flex-wrap">

      <button
        onClick={() => navigate("/quiz")}
        className="mt-1 p-3 rounded-full 
        bg-white dark:bg-gray-800 
        shadow hover:shadow-md 
        border border-gray-200 dark:border-white/10 transition"
      >
        <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Interview History
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your past interviews and performance reports
        </p>
      </div>
    </div>

    {/* EMPTY STATE */}
    {interviews.length === 0 ? (
      <div className="bg-white dark:bg-gray-900 
      p-10 rounded-2xl shadow text-center 
      border border-gray-200 dark:border-white/10 transition">

        <p className="text-gray-500 dark:text-gray-400">
          No interviews found. Start your first interview.
        </p>
      </div>

    ) : (

      /* LIST */
      <div className="grid gap-6">
        {interviews.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/report/${item._id}`)}
            className="bg-white dark:bg-gray-900 
            p-6 rounded-2xl shadow-md hover:shadow-xl 
            transition-all duration-300 cursor-pointer 
            border border-gray-100 dark:border-white/10"
          >

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* LEFT */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {item.role}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {item.experience} • {item.mode}
                </p>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-6">

                {/* SCORE */}
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    {item.finalScore || 0}/10
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Overall Score
                  </p>
                </div>

                {/* STATUS */}
                <span
                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                    item.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {item.status}
                </span>

              </div>

            </div>

          </div>
        ))}
      </div>
    )}

  </div>
</div>
      <Footer />
    </>
  );
}

export default InterviewHistory;
