import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, HelpCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const CodeEditor = ({ 
  starterCode, 
  userCSS, 
  setUserCSS, 
  level, 
  validateSolution, 
  isWon = false,
  onRun 
}) => {
  const [inputCSS, setInputCSS] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef(null);

  // Sync input with prop
  useEffect(() => {
    setInputCSS(userCSS);
  }, [userCSS]);

  // Live validation debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsValid(validateSolution(inputCSS));
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputCSS, validateSolution]);

  const handleRun = () => {
    if (isValid) {
      onRun?.();
      toast.success('Perfect! 🎉 CSS applied correctly.');
    } else {
      toast.error('Not quite right. Check the instruction!');
    }
    setUserCSS(inputCSS);
  };

  const handleReset = () => {
    setInputCSS(starterCode);
    setUserCSS(starterCode);
    toast.message('Reset to starter code');
  };

  const handleHint = () => {
    toast.info(level.hint, { 
      duration: 5000,
      icon: <HelpCircle className="w-5 h-5" />
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleRun();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setInputCSS(inputCSS.substring(0, start) + '  ' + inputCSS.substring(end));
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 ring-2 ring-green-200/50" />
          <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
            CSS Editor (Ctrl+Enter to run)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {isValid ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-400" />}
          <span>{isValid ? 'Valid' : 'Live Preview'}</span>
        </div>
      </div>

      {/* Editor */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={inputCSS}
          onChange={(e) => setInputCSS(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Write your CSS here&#10;display: flex;"
// Live status border
          className={`
            w-full h-64 p-6 rounded-2xl font-mono text-sm
            bg-white/80 dark:bg-slate-900/80 border-2 shadow-xl
            backdrop-blur-sm resize-none focus:outline-none focus:ring-4
            transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500
            ${isValid 
              ? 'border-green-300 ring-green-200/50 bg-green-50/50 dark:bg-green-900/20 dark:border-green-500/50' 
              : isWon 
                ? 'border-green-400 ring-green-300/50 bg-green-50/80 dark:border-green-500 dark:bg-green-900/40' 
                : 'border-slate-200 dark:border-slate-700 ring-transparent hover:border-slate-300 dark:hover:border-slate-600'
            }
          `}
          spellCheck="false"
        />
        
        {/* Line numbers placeholder */}
        <div className="absolute left-4 top-6 bottom-6 w-8 text-xs text-slate-400 dark:text-slate-500 flex flex-col items-end select-none pointer-events-none">
          {Array.from({length: 12}, (_, i) => i+1).map(n => (
            <span key={n} className="leading-relaxed h-6">{n}</span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="absolute bottom-3 right-4 flex gap-2">
          <button
            onClick={handleRun}
            disabled={isWon}
            className="p-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4" />
            {isValid ? 'Complete!' : 'Run'}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2.5 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 text-sm font-medium hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleHint}
            className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 text-sm font-medium hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
            Hint
          </button>
        </div>
      </div>

      {/* Hint popup if active */}
      {showHint && (
        <div className="p-4 bg-blue-50/80 dark:bg-blue-900/50 border border-blue-200/50 dark:border-blue-700 rounded-2xl backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            💡 {level.hint}
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;

