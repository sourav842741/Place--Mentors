import React, { useState, useEffect, useMemo, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Quick property presets for each level to make learning instant & fun
const LEVEL_PRESETS = {
  1: ["justify-content: flex-end;", "justify-content: center;", "justify-content: flex-start;"],
  2: ["justify-content: center;", "justify-content: flex-end;", "justify-content: space-between;"],
  3: ["justify-content: space-between;", "justify-content: space-around;", "justify-content: space-evenly;"],
  4: ["align-items: center;", "align-items: flex-end;", "align-items: flex-start;"],
  5: ["align-items: flex-end;", "align-items: center;", "align-items: stretch;"],
  6: ["flex-direction: row-reverse;", "flex-direction: column;", "flex-direction: row;"],
  7: ["flex-direction: column;", "flex-direction: column-reverse;", "flex-direction: row;"],
  8: ["justify-content: space-around;", "justify-content: space-between;", "justify-content: space-evenly;"],
  9: ["justify-content: space-evenly;", "justify-content: space-around;", "justify-content: space-between;"],
  10: ["flex-wrap: wrap;", "flex-wrap: nowrap;", "flex-wrap: wrap-reverse;"],
  11: [".banana { order: 1; }", ".grape { order: 2; }", ".apple { order: 3; }"],
  12: [".strawberry { align-self: flex-end; }", ".strawberry { align-self: center; }"],
  13: ["gap: 1rem;", "gap: 2rem;", "gap: 0.5rem;"],
  14: ["justify-content: center;\nalign-items: flex-end;"],
  15: ["flex-direction: column-reverse;\nflex-wrap: wrap;\ngap: 1rem;\n.strawberry { order: 4; align-self: flex-end; }"],
};

const CHEAT_SHEET = [
  {
    property: "justify-content",
    desc: "Aligns items horizontally along the main axis.",
    values: "flex-start | flex-end | center | space-between | space-around | space-evenly",
  },
  {
    property: "align-items",
    desc: "Aligns items vertically along the cross axis.",
    values: "flex-start | flex-end | center | baseline | stretch",
  },
  {
    property: "flex-direction",
    desc: "Defines the direction items are placed in the container.",
    values: "row | row-reverse | column | column-reverse",
  },
  {
    property: "flex-wrap",
    desc: "Specifies whether items should wrap into multiple lines.",
    values: "nowrap | wrap | wrap-reverse",
  },
  {
    property: "gap",
    desc: "Sets the spacing between flex items.",
    values: "1rem | 2rem | 16px | 24px",
  },
  {
    property: "order / align-self",
    desc: "Changes individual item order or cross-axis alignment.",
    values: "order: <number>; align-self: auto | flex-start | flex-end | center",
  },
];

const MonacoCodeEditor = ({
  starterCode = "display: flex;",
  userCSS,
  setUserCSS,
  level,
  validateSolution,
  isWon = false,
  onRun,
  onNextLevel,
  isLastLevel = false,
}) => {
  const [editorValue, setEditorValue] = useState(userCSS || starterCode);
  const [theme, setTheme] = useState("vs-dark");
  const [isValid, setIsValid] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Sync Monaco theme with global dark mode
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

  // Sync external state on level change
  useEffect(() => {
    setEditorValue(userCSS || starterCode);
    setShowHint(false);
  }, [userCSS, starterCode, level?.id]);

  // Live validation
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const result = validateSolution?.(editorValue) || false;
        setIsValid(result);
      } catch {
        setIsValid(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [editorValue, validateSolution]);

  const handleChange = useCallback(
    (value) => {
      const newVal = value || "";
      setEditorValue(newVal);
      setUserCSS(newVal);
    },
    [setUserCSS]
  );

  const handleRun = useCallback(() => {
    setUserCSS(editorValue);

    if (isValid) {
      onRun?.(editorValue);
    } else {
      toast.error("Not quite right yet. Check the hint for guidance!");
    }
  }, [editorValue, isValid, onRun, setUserCSS]);

  const handleReset = useCallback(() => {
    setEditorValue(starterCode);
    setUserCSS(starterCode);
    toast.info("Editor reset to starter code");
  }, [starterCode, setUserCSS]);

  const handleApplyPreset = (snippet) => {
    let updated;
    if (!editorValue.trim()) {
      updated = snippet;
    } else if (editorValue.includes(snippet.trim())) {
      return;
    } else {
      updated = `${editorValue.trim()}\n${snippet}`;
    }
    setEditorValue(updated);
    setUserCSS(updated);
    toast.success("Inserted property!");
  };

  const presets = LEVEL_PRESETS[level?.id] || [];

  return (
    <div className="space-y-4">
      {/* Code Editor Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all">
        {/* IDE Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 select-none">
          {/* macOS Window Controls + Filename */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              #fruitbox.css
            </span>
          </div>

          {/* Solution Status Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                isValid
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isValid ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                }`}
              />
              <span>{isValid ? "Solved! ✅" : "Live Preview"}</span>
            </span>
          </div>
        </div>

        {/* Code Scope Header */}
        <div className="px-4 pt-3 pb-1 font-mono text-xs text-slate-500 dark:text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50">
          <span className="text-purple-600 dark:text-purple-400 font-bold">#fruitbox</span> {"{"}
        </div>

        {/* Monaco Editor (Configured without false red error squiggles) */}
        <div className="relative bg-white dark:bg-slate-950">
          <Editor
            key={level?.id}
            height="145px"
            language="css"
            theme={theme}
            value={editorValue}
            onChange={handleChange}
            beforeMount={(monaco) => {
              // DISABLE false CSS syntax errors on bare properties
              monaco.languages.css.cssDefaults.setDiagnosticsOptions({
                validate: false,
                lint: { emptyRules: "ignore" },
              });
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
              fontLigatures: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              automaticLayout: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
              },
              renderLineHighlight: "all",
              padding: { top: 8, bottom: 8 },
            }}
            onMount={(editor) => {
              editor.addCommand(
                window.monaco?.KeyMod.CtrlCmd | window.monaco?.KeyCode.Enter,
                handleRun
              );
            }}
          />
        </div>

        {/* Code Scope Footer */}
        <div className="px-4 py-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/50">
          {"}"}
        </div>

        {/* Quick Suggestion Chips */}
        {presets.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium select-none">
              Quick insert:
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                + {preset.split("\n")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Main Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Next Level / Run Button */}
        {isValid ? (
          <Button
            onClick={() => {
              handleRun();
              if (onNextLevel) onNextLevel();
            }}
            className="w-full sm:flex-1 h-11 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>{isLastLevel ? "Finish All Levels 🎉" : "Next Level ➔"}</span>
          </Button>
        ) : (
          <Button
            onClick={handleRun}
            className="w-full sm:flex-1 h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            <span>Check Solution (Ctrl+Enter)</span>
          </Button>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-auto h-11 px-4 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Reset</span>
        </Button>

        {/* Hint Button */}
        <Button
          variant="outline"
          onClick={() => setShowHint((prev) => !prev)}
          className={`w-full sm:w-auto h-11 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            showHint
              ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
          <span>{showHint ? "Hide Hint" : "Hint"}</span>
        </Button>
      </div>

      {/* Expandable Hint Box */}
      {showHint && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Hint for Level {level?.id}:</span>
          </div>
          <p>{level?.hint}</p>
        </div>
      )}

      {/* Collapsible Flexbox Cheat Sheet Accordion */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 transition-all">
        <button
          type="button"
          onClick={() => setShowCheatSheet((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Flexbox Quick Reference Guide</span>
          </div>
          {showCheatSheet ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showCheatSheet && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs animate-in fade-in">
            {CHEAT_SHEET.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {item.property}
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-[11px]">{item.desc}</div>
                <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 opacity-90">
                  {item.values}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoCodeEditor;
