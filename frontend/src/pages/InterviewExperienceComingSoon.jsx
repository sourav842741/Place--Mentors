import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Briefcase, Sparkles, Clock3, ArrowRight, MessageSquare, ChevronLeft, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InterviewExperienceComingSoon() {
  const navigate = useNavigate();

  const handleNotify = () => {
    toast.success("Notification enabled successfully", {
      description: "We'll notify you as soon as Interview Experience archives launch.",
    });
  };

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-xs font-medium text-text transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          {/* Main Card */}
          <div className="bg-surface rounded-xl border border-border p-8 md:p-10 shadow-subtle space-y-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Community Driven Knowledge
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text leading-tight mb-3">
                Interview Experiences & Archives
              </h1>

              <p className="text-sm text-text-muted leading-relaxed">
                Real student interview reports, round-by-round coding questions, HR behavioral experiences, and insider placement tips from top tier tech companies.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4 bg-surface-2/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-text">Company-Specific Breakdowns</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">TCS, Infosys, Wipro, Amazon, Google & startups</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-surface-2/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-text">Verified Candidate Questions</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Actual questions asked in recent 2025-2026 drives</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-surface-2/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-text">Round Duration & Timelines</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">OA rounds, technical interviews, managerial & HR</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-surface-2/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-text">Salary & Offer Insights</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">CTC ranges, band levels & negotiation pointers</p>
                </div>
              </div>
            </div>

            {/* Notify CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleNotify}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-soft transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Notify Me When Launched</span>
              </button>

              <span className="text-xs text-text-subtle">Releasing in our next platform update</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
