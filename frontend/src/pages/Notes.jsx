import React from "react";
import { BookOpen, Sparkles, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotesForm from "../components/NotesForm";
import NotesList from "../components/NotesList";
import { useGetMyNotesQuery } from "../redux/notesSlice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Notes() {
  const { data: notes, isLoading, error } = useGetMyNotesQuery();

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* HERO */}
          <div className="text-center pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Revision Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              AI Exam & Interview Notes
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
              Generate structured, high-yield study notes with diagrams, short questions, and revision summaries tailored to your syllabus.
            </p>
          </div>

          {/* FORM */}
          <NotesForm />

          {/* HISTORY */}
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-text">Your Generated Notes Library</h2>
              </div>
              <NotesList notes={notes} isLoading={isLoading} />
            </div>

            {error && (
              <div className="p-4 bg-danger-soft border border-danger/20 rounded-xl text-center text-xs text-danger">
                Failed to load notes. <button onClick={() => window.location.reload()} className="underline font-medium ml-1 cursor-pointer">Retry</button>
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
