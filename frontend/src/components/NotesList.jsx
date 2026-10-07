import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Star,
  Layers,
  BarChart3,
  ChevronRight,
  Search,
  Sparkles,
  ArrowUpRight,
  X,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Topic avatar monogram gradients
const getNoteGradient = (topic = "") => {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-indigo-800",
    "from-rose-600 to-red-700",
    "from-amber-500 to-orange-600",
    "from-cyan-600 to-blue-700",
  ];
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const getNoteInitials = (topic = "") => {
  if (!topic) return "NT";
  const words = topic.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const NotesList = ({ notes, isLoading }) => {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTag, setActiveTag] = useState("all"); // 'all' | 'revision' | 'diagram'

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter((n) => {
      const matchSearch =
        !searchFilter ||
        n.topic?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.classLevel?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.examType?.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchSearch) return false;

      if (activeTag === "revision") return n.revisionMode;
      if (activeTag === "diagram") return n.includeDiagram;
      return true;
    });
  }, [notes, searchFilter, activeTag]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 border border-border rounded-2xl bg-surface-2/40 animate-pulse space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-2 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-surface-2 rounded w-1/3" />
                <div className="h-3 bg-surface-2 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className="text-center py-14 px-4 border border-dashed border-border rounded-2xl bg-surface-2/30 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary mx-auto shadow-2xs">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="max-w-sm mx-auto space-y-1">
          <h3 className="text-sm font-bold text-text">No study notes generated yet</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Use the generator above to create comprehensive exam guides, practice questions, and concept diagrams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search saved study notes..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-9 bg-surface-2 border-border text-text placeholder:text-text-subtle text-xs rounded-xl pl-9 pr-8"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: `All (${notes.length})` },
            { id: "revision", label: "Revision Mode" },
            { id: "diagram", label: "With Diagrams" },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                activeTag === tag.id
                  ? "bg-primary text-on-primary font-semibold shadow-2xs"
                  : "bg-surface-2 text-text-muted hover:text-text border border-border"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Notes Cards */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted bg-surface-2/30 rounded-xl border border-border">
          No notes match your search "{searchFilter}".
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotes.map((note) => {
            const gradient = getNoteGradient(note.topic);
            const initials = getNoteInitials(note.topic);

            return (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/${note._id}`)}
                className="group rounded-2xl border border-border bg-surface hover:bg-surface-2/60 hover:border-primary/40 p-4 transition-all duration-200 cursor-pointer shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:-translate-y-0.5"
              >
                {/* Left side: Avatar + Title + Level */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradient} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate leading-tight">
                      {note.topic}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {note.classLevel && (
                        <span className="text-[11px] font-medium">{note.classLevel}</span>
                      )}
                      {note.classLevel && note.examType && <span>•</span>}
                      {note.examType && (
                        <span className="text-[11px] font-medium">{note.examType}</span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] text-text-subtle">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Feature Badges + View Link */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.revisionMode && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-400" />
                        Revision
                      </span>
                    )}

                    {note.includeDiagram && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-primary-soft text-primary border border-primary/20">
                        <Layers className="h-3 w-3" />
                        Diagram
                      </span>
                    )}

                    {note.includeChart && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-surface-2 text-text-muted border border-border">
                        <BarChart3 className="h-3 w-3" />
                        Matrix
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform pl-1">
                    Study Guide
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesList;
