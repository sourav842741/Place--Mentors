import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Star, SwitchCamera, BarChart3, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NotesList = ({ notes, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-xl bg-surface-2/40 animate-pulse space-y-2">
            <div className="h-4 bg-surface-2 rounded w-1/3"></div>
            <div className="h-3 bg-surface-2 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl bg-surface-2/20">
        <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary mx-auto mb-3">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-text mb-1">No notes generated yet</h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          Use the generator above to create comprehensive revision notes, questions, and diagrams.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note._id}
          className="group rounded-xl border border-border bg-surface-2/30 hover:bg-surface-2 hover:border-primary/40 p-4 transition-all duration-200 cursor-pointer shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          onClick={() => navigate(`/notes/${note._id}`)}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                {note.topic}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {note.classLevel && (
                <span>{note.classLevel}</span>
              )}
              {note.classLevel && note.examType && <span>•</span>}
              {note.examType && (
                <span>{note.examType}</span>
              )}

              <div className="flex items-center gap-1 text-[11px] text-text-subtle ml-auto sm:ml-2">
                <Calendar className="h-3 w-3" />
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            <div className="flex items-center gap-1.5 flex-wrap">
              {note.revisionMode && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Star className="h-2.5 w-2.5 fill-amber-400" />
                  Revision
                </span>
              )}

              {note.includeDiagram && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary-soft text-primary border border-primary/20">
                  <SwitchCamera className="h-2.5 w-2.5" />
                  Diagram
                </span>
              )}

              {note.includeChart && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface text-text-muted border border-border">
                  <BarChart3 className="h-2.5 w-2.5" />
                  Charts
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-primary flex items-center gap-0.5 ml-2 group-hover:translate-x-0.5 transition-transform">
              View
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
