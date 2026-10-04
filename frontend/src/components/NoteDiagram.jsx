import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

const NoteDiagram = ({ diagramData, className = "" }) => {
  const svgRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!diagramData) {
      setLoading(false);
      return;
    }

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(false);

        const isDark = document.documentElement.classList.contains("dark");

        // Mermaid config
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
        });

        const { svg } = await mermaid.render(
          `diagram-${Math.random().toString(36).substr(2, 9)}`,
          diagramData
        );

        if (svgRef.current) {
          svgRef.current.innerHTML = svg;
        }

        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    renderDiagram();
  }, [diagramData]);

  if (!diagramData) {
    return null;
  }

  return (
    <div className={`bg-surface border border-border rounded-xl p-5 shadow-subtle ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        <span className="text-sm font-semibold text-text">Concept Diagram</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-6 text-danger text-xs bg-danger-soft border border-danger/20 rounded-lg">
          Failed to render diagram
        </div>
      )}

      {!loading && !error && (
        <div ref={svgRef} className="mermaid w-full h-auto max-h-96 overflow-auto flex justify-center py-2" />
      )}
    </div>
  );
};

export default NoteDiagram;
