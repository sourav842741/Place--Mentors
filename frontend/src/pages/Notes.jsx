import React from 'react'
import { BookOpen, Sparkles, Star, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NotesForm from '../components/NotesForm'
import NotesList from '../components/NotesList'
import { useGetMyNotesQuery } from '../redux/notesSlice'

function Notes() {
  const { data: notes, isLoading, error } = useGetMyNotesQuery()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-950 py-12 lg:mt-12 md:ml-9 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO */}
        <div className="text-center pb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              AI Exam Notes
            </h1>
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Generate topper-level notes with diagrams, questions, and revision points. 
            Powered by advanced AI tailored for your exams.
          </p>
        </div>

        {/* FORM */}
        <NotesForm />

        {/* HISTORY */}
        <div>
          <Card className="border-0 shadow-xl md:ml-30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl ">
                <BookOpen className="h-8 w-8"  />
                Your Notes Library
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NotesList notes={notes} isLoading={isLoading} />
            </CardContent>
          </Card>

          {error && (
            <Card className="mt-6 border-red-200">
              <CardContent className="p-6 text-center text-red-600">
                Failed to load notes. <button className="underline ml-1">Retry</button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notes

