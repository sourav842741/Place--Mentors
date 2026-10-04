import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { Play, Loader2, Code2, Terminal, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const boilerplates = {
  javascript: `console.log("Hello from PlaceMentor!");`,

  python: `print("Hello from PlaceMentor!")`,

  java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int a = sc.nextInt();
    int b = sc.nextInt();
    System.out.println("Sum: " + (a + b));
  }
}`,

  "c++": `#include <iostream>
using namespace std;

int main() {
  int a, b;
  if (cin >> a >> b) {
    cout << "Sum: " << (a + b) << endl;
  } else {
    cout << "Hello from PlaceMentor!" << endl;
  }
  return 0;
}`,
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(boilerplates["javascript"]);

  // TERMINAL STATES
  const [terminalInput, setTerminalInput] = useState([]);
  const [currentLine, setCurrentLine] = useState("");

  const { executeCode, result, isLoading, error } = useCompiler();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(boilerplates[lang]);
  };

  const handleRun = () => {
    const allInputs = [...terminalInput];
    if (currentLine.trim() !== "") {
      allInputs.push(currentLine);
    }
    const finalInput = allInputs.join("\n");
    executeCode(code, language, finalInput);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-bg text-text pt-16 lg:pl-64 flex flex-col transition-colors duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center border border-primary/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text">Online Code Compiler</h1>
              <p className="text-[11px] text-text-muted">Fast sandbox execution for interview practice</p>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-soft disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-125px)]">
          {/* SIDE CONTROLS */}
          <div className="w-full md:w-64 bg-surface-2/60 border-b md:border-b-0 md:border-r border-border p-4 space-y-4 shrink-0">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-surface border border-border text-text text-xs p-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="c++">C++ (GCC)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCode(boilerplates[language])}
                className="w-full text-xs py-2 px-3 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-text-subtle" />
                Reset Boilerplate
              </button>
            </div>

            <div className="pt-2 text-[11px] text-text-muted space-y-2">
              <p>💡 <strong>Tip:</strong> If your solution uses standard input (e.g. <code>cin</code> or <code>Scanner</code>), type input into the terminal bar below and hit Enter before executing.</p>
            </div>
          </div>

          {/* MAIN EDITOR & TERMINAL */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* EDITOR */}
            <div className="flex-1 min-h-[350px] border-b border-border">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === "c++" ? "cpp" : language}
                value={code}
                onChange={(val) => setCode(val)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "Geist Mono, monospace",
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                }}
              />
            </div>

            {/* TERMINAL UI */}
            <div className="h-56 bg-surface border-t border-border flex flex-col font-mono text-xs">
              <div className="px-4 py-2 bg-surface-2/80 border-b border-border flex items-center justify-between text-text-subtle text-[11px] font-semibold uppercase">
                <span className="flex items-center gap-1.5 text-text">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  Terminal Console
                </span>
                {terminalInput.length > 0 && (
                  <button
                    onClick={() => setTerminalInput([])}
                    className="hover:text-text cursor-pointer underline lowercase"
                  >
                    clear input history
                  </button>
                )}
              </div>

              {/* Terminal inputs */}
              <div className="p-3 bg-surface border-b border-border space-y-1">
                {terminalInput.map((line, i) => (
                  <div key={i} className="text-text-muted">
                    <span className="text-primary font-bold mr-1.5">&gt;</span>
                    {line}
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="text-primary font-bold mr-1.5">&gt;</span>
                  <input
                    value={currentLine}
                    onChange={(e) => setCurrentLine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setTerminalInput((prev) => [...prev, currentLine]);
                        setCurrentLine("");
                      }
                    }}
                    className="flex-1 bg-transparent text-text outline-none placeholder:text-text-subtle"
                    placeholder="Type stdin value and press Enter..."
                  />
                </div>
              </div>

              {/* Output Display */}
              <div className="flex-1 p-3 overflow-auto bg-surface-2/30">
                {isLoading && (
                  <p className="text-accent flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Executing code in secure sandbox...
                  </p>
                )}
                {error && <p className="text-danger">{error}</p>}
                {result?.output && (
                  <pre className="text-primary whitespace-pre-wrap leading-relaxed">
                    {result.output}
                  </pre>
                )}
                {!isLoading && !error && !result?.output && (
                  <p className="text-text-subtle italic">Program output will appear here after clicking 'Run Code'</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CodeEditor;
