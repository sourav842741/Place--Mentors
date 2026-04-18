import React, { useState, useEffect, useMemo, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MonacoCodeEditor = ({
  starterCode = "display: flex;",
  userCSS,
  setUserCSS,
  level,
  validateSolution,
  isWon = false,
  onRun,
}) => {
  const [editorValue, setEditorValue] = useState(userCSS || starterCode);
  const [theme, setTheme] = useState("vs-dark");
  const [isValid, setIsValid] = useState(false);

  // detect theme
  useEffect(() => {
    const applyTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setTheme(dark ? "vs-dark" : "vs");
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // sync external state
  useEffect(() => {
    setEditorValue(userCSS || starterCode);
  }, [userCSS, starterCode, level?.id]);

  // debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const result = validateSolution?.(editorValue) || false;
        setIsValid(result);
      } catch {
        setIsValid(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [editorValue, validateSolution]);

  const handleChange = useCallback((value) => {
    setEditorValue(value || "");
  }, []);

 const handleRun = useCallback(() => {
  setUserCSS(editorValue);

  if (isValid) {
    onRun?.(editorValue);   
    toast.success("Correct solution! 🚀");
  } else {
    toast.error("Not correct yet. Try again.");
  }
}, [editorValue, isValid, onRun, setUserCSS]);

  const handleReset = useCallback(() => {
    setEditorValue(starterCode);
    setUserCSS(starterCode);
    toast.success("Editor reset");
  }, [starterCode, setUserCSS]);

  const handleHint = useCallback(() => {
    toast.info(level?.hint || "Try using flex properties.");
  }, [level]);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 16,
      lineHeight: 24,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      roundedSelection: true,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      padding: { top: 16, bottom: 16 },
      tabSize: 2,
      insertSpaces: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      contextmenu: true,
      folding: false,
      fontFamily:
        'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
    }),
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            CSS Editor
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live Preview Enabled • Ctrl + Enter to Run
          </p>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isValid
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isValid ? "Valid Solution" : "Editing"}
        </div>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-2xl border shadow-xl bg-white dark:bg-slate-950">
        <Editor
          key={level?.id}
          height="360px"
          language="css"
          theme={theme}
          value={editorValue}
          onChange={handleChange}
          options={editorOptions}
          onMount={(editor) => {
            editor.addCommand(
              window.monaco?.KeyMod.CtrlCmd |
                window.monaco?.KeyCode.Enter,
              handleRun
            );
          }}
        />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={handleRun}
          className={`h-12 text-base font-semibold ${
            isValid && !isWon
              ? "bg-green-600 hover:bg-green-700"
              : ""
          }`}
        >
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 mr-2" />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          {isValid ? "Complete Level" : "Run Code"}
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          className="h-12 text-base font-semibold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button
          variant="outline"
          onClick={handleHint}
          className="h-12 text-base font-semibold"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Hint
        </Button>
      </div>
    </div>
  );
};

export default MonacoCodeEditor;