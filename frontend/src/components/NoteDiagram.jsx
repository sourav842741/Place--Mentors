import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

const NoteDiagram = ({ diagramData, className = '' }) => {
  const svgRef = useRef(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!diagramData) {
      setLoading(false)
      return
    }

    const renderDiagram = async () => {
      try {
        setLoading(true)
        setError(false)

        // Mermaid config
        mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose'
        })

        const { svg } = await mermaid.render(
          `diagram-${Math.random().toString(36).substr(2, 9)}`,
          diagramData
        )

        if (svgRef.current) {
          svgRef.current.innerHTML = svg
        }

        setLoading(false)
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(true)
        setLoading(false)
      }
    }

    renderDiagram()
  }, [diagramData])

  if (!diagramData) {
    return null
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 border ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded" />
        <span className="font-semibold text-blue-900">Diagram</span>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500 text-sm">
          Failed to render diagram
        </div>
      )}

      {!loading && !error && (
        <div 
          ref={svgRef} 
          className="mermaid w-full h-auto max-h-96 overflow-auto"
        />
      )}
    </div>
  )
}

export default NoteDiagram

