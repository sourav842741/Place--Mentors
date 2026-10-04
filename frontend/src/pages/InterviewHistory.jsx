import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "@/components/Navbar";
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
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-border">
            <button
              onClick={() => navigate("/quiz")}
              className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer shadow-subtle"
              aria-label="Back to quiz"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Interview History
              </h1>

              <p className="text-xs text-text-muted mt-0.5">
                Track your past mock interviews and performance reports
              </p>
            </div>
          </div>

          {/* EMPTY STATE */}
          {interviews.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl text-center border border-border shadow-subtle">
              <p className="text-xs text-text-muted">
                No past interviews found. Start your first mock interview from Interview Practice.
              </p>
            </div>
          ) : (
            /* LIST */
            <div className="grid gap-4">
              {interviews.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="bg-surface p-5 rounded-xl shadow-subtle hover:border-primary/40 border border-border transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* LEFT */}
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-semibold text-text group-hover:text-primary transition-colors">
                        {item.role}
                      </h3>

                      <p className="text-xs text-text-muted">
                        {item.experience} • {item.mode}
                      </p>

                      <p className="text-[11px] text-text-subtle pt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-6 self-end md:self-center">
                      {/* SCORE */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {item.finalScore || 0}/10
                        </p>
                        <p className="text-[10px] text-text-subtle uppercase tracking-wider">Overall Score</p>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                          item.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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
