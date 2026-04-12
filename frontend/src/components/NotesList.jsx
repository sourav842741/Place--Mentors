import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Star,
  SwitchCamera,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NotesList = ({ notes, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className="text-center py-12 md:ml-16   ">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-gray-500 mb-4">
          Generate your first set of exam notes.
        </p>
        <Button>Generate Notes</Button>
      </div>
    );
  }

  return (
   <div className="space-y-6 px-4 sm:px-6 md:px-10 lg:px-20 py-6 
bg-gray-50 dark:bg-gray-950 min-h-screen">

  <div className="flex items-center gap-3 
  bg-white dark:bg-gray-900 
  p-4 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 md:ml-16">

    <BookOpen className="h-5 w-5 text-blue-600" />

    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
      Notes History
    </h2>

    <Badge variant="secondary">{notes.length}</Badge>
  </div>

  <div className="grid gap-4">
    {notes.map((note) => (
      <Card
        key={note._id}
        className="rounded-xl border 
        bg-white dark:bg-gray-900 
        border-gray-200 dark:border-white/10 
        shadow-sm hover:shadow-lg 
        transition-all duration-300 cursor-pointer hover:-translate-y-1 md:ml-16"
        onClick={() => navigate(`/notes/${note._id}`)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg leading-tight text-gray-900 dark:text-white">
            {note.topic}
          </CardTitle>

          <CardDescription className="flex flex-wrap gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {note.classLevel} | {note.examType}
            </span>

            <div className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3 w-3" />
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between pt-0 pb-4">

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {note.revisionMode && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Revision
              </Badge>
            )}

            {note.includeDiagram && (
              <Badge variant="outline" className="text-xs">
                <SwitchCamera className="h-3 w-3 mr-1" />
                Diagram
              </Badge>
            )}

            {note.includeChart && (
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Charts
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="sm">
            View
          </Button>

        </CardContent>
      </Card>
    ))}
  </div>
</div>
  );
};

export default NotesList;
