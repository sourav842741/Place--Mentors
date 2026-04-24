import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Briefcase,
  Sparkles,
  Clock3,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";

export default function InterviewExperienceComingSoon() {
  const navigate = useNavigate();

  const handleNotify = () => {
    toast.success("Notification enabled successfully 🔔", {
      description: "We’ll inform you when Interview Experience launches.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:scale-105 transition-all duration-300 text-slate-700 dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">

          <div className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center p-6 sm:p-10">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                <Sparkles className="h-4 w-4" />
                New Feature Launching Soon
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Interview Experience
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                  Coming Soon 🚀
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Real interview stories, company-wise questions, candidate tips,
                HR rounds, technical rounds, and honest insights to help you
                prepare smarter.
              </p>

              {/* Features */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Company Wise Stories
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Real Candidate Feedback
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-pink-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Latest 2026 Trends
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Placement Guidance
                    </span>
                  </div>
                </div>
              </div>

              {/* Notify Button */}
              <button
                onClick={handleNotify}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Notify Me
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6">
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <p className="text-sm opacity-90">Upcoming Experience</p>
                    <h3 className="text-xl font-bold mt-1">
                      TCS Ninja Interview
                    </h3>
                  </div>

                  <div className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                    <p className="font-semibold text-slate-800 dark:text-white">Infosys</p>
                  </div>

                  <div className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Round Covered</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      HR + Technical + Coding
                    </p>
                  </div>

                  <div className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                    <p className="font-semibold text-emerald-500">Launching Soon</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Stay ready. Great opportunities are on the way ✨
        </p>
      </div>
    </div>
  );
}