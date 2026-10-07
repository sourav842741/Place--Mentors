import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

const NoteDiagram = ({ diagramData, className = "" }) => {
  const svgRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Clean raw diagram string from LLM formatting
  const cleanDiagram = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    let clean = raw.trim();

    // Strip markdown code fences (```mermaid ... ``` or ``` ... ```)
    clean = clean.replace(/^```(?:mermaid)?\s*/i, "").replace(/```\s*$/i, "").trim();

    // Remove any trailing or leading HTML
    clean = clean.replace(/<[^>]*>/g, "").trim();

    // Check if it starts with valid Mermaid diagram keywords
    const validStarts = [
      "graph ",
      "graph\n",
      "flowchart ",
      "flowchart\n",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "pie",
      "gantt",
      "gitGraph",
      "journey",
      "mindmap",
    ];

    const hasValidStart = validStarts.some((kw) => clean.startsWith(kw));
    if (!hasValidStart && clean.length > 0) {
      clean = `graph TD\n${clean}`;
    }

    return clean;
  };

  useEffect(() => {
    if (!diagramData) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(false);

        const isDark = document.documentElement.classList.contains("dark");
        const cleanedData = cleanDiagram(diagramData);

        if (!cleanedData) {
          setError(true);
          setLoading(false);
          return;
        }

        // Initialize Mermaid with suppressErrorRendering: true so it NEVER injects error SVGs into document.body!
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          logLevel: "fatal",
        });

        // Validate syntax with parse first
        const isValid = await mermaid.parse(cleanedData, { suppressErrors: true });
        if (!isValid && isValid !== undefined) {
          throw new Error("Invalid diagram syntax");
        }

        const uniqueId = `diagram-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, cleanedData);

        if (isMounted && svgRef.current) {
          svgRef.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      } finally {
        // Remove any rogue mermaid error elements that Mermaid might have appended to document.body
        const rogueElements = document.querySelectorAll(
          'body > svg[id*="mermaid"], body > div[id*="mermaid"], body > #dmermaid, body > svg[id^="d"]'
        );
        rogueElements.forEach((el) => {
          if (el.parentNode === document.body) {
            el.remove();
          }
        });
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Clean up on unmount as well
      const rogueElements = document.querySelectorAll(
        'body > svg[id*="mermaid"], body > div[id*="mermaid"], body > #dmermaid, body > svg[id^="d"]'
      );
      rogueElements.forEach((el) => {
        if (el.parentNode === document.body) {
          el.remove();
        }
      });
    };
  }, [diagramData]);

  if (!diagramData) {
    return null;
  }

  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 shadow-subtle ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        <span className="text-xs font-bold uppercase tracking-wider text-text">
          Concept Flow Diagram
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-5 text-text-muted text-xs bg-surface-2/60 border border-border rounded-xl">
          Diagram visualization not available for this concept.
        </div>
      )}

      {!loading && !error && (
        <div
          ref={svgRef}
          className="note-diagram-svg w-full h-auto max-h-96 overflow-auto flex justify-center py-2"
        />
      )}
    </div>
  );
};

export default NoteDiagram;
