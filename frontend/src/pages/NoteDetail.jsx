import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, BookOpen, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGetSingleNoteQuery, useGeneratePDFMutation } from '../redux/notesSlice'
import NoteDiagram from '../components/NoteDiagram'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function NoteDetail() {
  const { id } = useParams()
  const { data, isLoading, error } = useGetSingleNoteQuery(id)
  const [generatePDF, { isLoading: pdfLoading }] = useGeneratePDFMutation()

  const note = data?.content
  const topic = data?.topic
  const createdAt = data?.createdAt

  const renderSubTopics = (subTopics) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {Object.entries(subTopics || {}).map(([stars, topics]) =>
        stars && topics?.length > 0 ? (
          <Card key={stars}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {stars.split('').map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                ))}
                <CardTitle className="text-base leading-tight">{stars} Topics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {topics.map((t, idx) => (
                  <div key={idx} className="text-sm py-1 px-2 bg-gray-50 rounded">{t}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null
      )}
    </div>
  )

  const renderList = (title, items) =>
    items?.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm flex gap-2 items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )

  const handlePDFDownload = async () => {
    if (!note) return
    try {
      const blob = await generatePDF(note).unwrap()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ExamNotesAI-${topic || 'notes'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl">Loading notes...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Note not found or access denied.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 ">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <Link 
            to="/notes" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Library
          </Link>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              Generated on {new Date(createdAt).toLocaleDateString()}
            </div>
            <Button 
              onClick={handlePDFDownload} 
              disabled={pdfLoading}
              className="gap-2"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600" />
              {topic}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* SUBTOPICS */}
        {renderSubTopics(note.subTopics)}

        {/* NOTES */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              📖 Comprehensive Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="prose prose-lg max-w-none p-8 lg:p-12 prose-headings:font-bold prose-h2:text-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {note.notes || 'No notes content available.'}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* REVISION & SHORT */}
          <div className="space-y-6">
            {renderList('🎯 Revision Points', note.revisionPoints)}
            {renderList('❓ Short Questions', note.questions?.short)}
          </div>

          {/* LONG & DIAGRAM */}
          <div className="space-y-6">
            {renderList('📝 Long Questions', note.questions?.long)}
            {note.questions?.diagram && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎨 Diagram Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <p className="text-lg italic font-medium">{note.questions.diagram}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* DIAGRAM */}
        {note.diagram?.data && (
          <NoteDiagram diagramData={note.diagram.data} />
        )}

        {/* CHARTS */}
        {note.charts?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Visual Aids & Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {note.charts.map((chart, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold mb-2">Chart {idx + 1}</h4>
                    <p>{chart}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 italic">
                Interactive charts coming soon...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    <Footer/>
    </>
  )
}

export default NoteDetail

