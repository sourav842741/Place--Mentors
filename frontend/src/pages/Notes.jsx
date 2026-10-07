import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Star,
  TrendingUp,
  Cpu,
  Layers,
  Code2,
  Network,
  Database,
  Terminal,
  HelpCircle,
  Zap,
} from "lucide-react";
import NotesForm from "../components/NotesForm";
import NotesList from "../components/NotesList";
import { useGetMyNotesQuery } from "../redux/notesSlice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Curated high-yield topics for placements and exams
const TOPIC_PRESETS = [
  {
    category: "Core CS",
    icon: Database,
    topics: [
      "Normalization in DBMS (1NF to BCNF)",
      "OS Process Scheduling Algorithms",
      "TCP 3-Way Handshake & OSI Layers",
      "Deadlock Conditions & Banker's Algorithm",
    ],
  },
  {
    category: "Software & Web",
    icon: Code2,
    topics: [
      "React Hooks (useState, useEffect, useMemo)",
      "RESTful API Design & Status Codes",
      "JWT Authentication & Session Security",
      "SQL vs NoSQL Database Tradeoffs",
    ],
  },
  {
    category: "DSA & System Design",
    icon: Cpu,
    topics: [
      "Dijkstra's Algorithm & Shortest Path",
      "Dynamic Programming: 0/1 Knapsack",
      "Caching Strategies (LRU, Redis, Write-Through)",
      "CAP Theorem & Microservices Architecture",
    ],
  },
];

function Notes() {
  const { data: notes, isLoading, error } = useGetMyNotesQuery();
  const [selectedPreset, setSelectedPreset] = useState("");

  const handleSelectPreset = (topic) => {
    setSelectedPreset(topic);
    // Smooth scroll to form input
    const inputEl = document.getElementById("topic-input");
    if (inputEl) {
      inputEl.focus();
      inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-28 lg:pl-64 px-4 sm:px-6 lg:px-8 pb-16 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* HERO SECTION */}
          <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-subtle overflow-hidden text-center">
            {/* Glowing ambient background blur */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Syllabus & Exam Companion</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text leading-tight">
                Topper-Grade{" "}
                <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  Exam & Interview Notes
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
                Transform any computer science subject, algorithmic concept, or syllabus unit into structured, high-yield study guides with visual Mermaid diagrams, flash revision summaries, and exam-tested questions.
              </p>

              {/* 3 Metric Pills */}
              <div className="pt-3 flex flex-wrap justify-center items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-surface-2 border border-border text-text-muted flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  3-Star Topic Priority
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-2 border border-border text-text-muted flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-primary" />
                  Interactive Mermaid Diagrams
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-2 border border-border text-text-muted flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 text-accent" />
                  Short & Long Exam Q&A
                </span>
              </div>
            </div>

            {/* QUICK TOPIC PRESETS / 1-CLICK PICKS */}
            <div className="relative z-10 mt-8 pt-6 border-t border-border/70 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Popular Placement & Exam Topics (1-Click Fill):
                </span>
                <span className="text-[11px] text-text-subtle hidden sm:inline">
                  Click to pre-fill prompt
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TOPIC_PRESETS.map((group, idx) => {
                  const Icon = group.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-surface-2/60 border border-border/80 space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span>{group.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.topics.map((t, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectPreset(t)}
                            className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-surface hover:bg-primary-soft hover:text-primary hover:border-primary/40 border border-border text-text-muted font-medium transition cursor-pointer leading-tight"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GENERATOR FORM COMPONENT */}
          <NotesForm presetTopic={selectedPreset} />

          {/* NOTES LIBRARY / HISTORY */}
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text">
                      Your Study Notes Vault
                    </h2>
                    <p className="text-xs text-text-muted">
                      All generated revision guides, formulas, and diagrams saved to your account
                    </p>
                  </div>
                </div>

                {notes && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-text-muted border border-border">
                    {notes.length} Notes Saved
                  </span>
                )}
              </div>

              <NotesList notes={notes} isLoading={isLoading} />
            </div>

            {error && (
              <div className="p-4 bg-danger-soft border border-danger/20 rounded-xl text-center text-xs text-danger">
                Failed to load your notes library.{" "}
                <button
                  onClick={() => window.location.reload()}
                  className="underline font-semibold ml-1 cursor-pointer"
                >
                  Click to Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Notes;
