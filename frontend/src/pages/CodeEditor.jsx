import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { Play, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const boilerplates = {
  javascript: `console.log("Hello World 👋");`,

  python: `print("Hello World 👋")`,

  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World 👋");
  }
}`,

  "c++": `#include <iostream>
using namespace std;

int main() {
  cout << "Hello World 👋";
  return 0;
}`,
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(boilerplates["javascript"]);

  const { executeCode, result, isLoading, error } = useCompiler();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(boilerplates[lang]);
  };

  const handleRun = () => {
    executeCode(code, language);
  };

  return (
    <>
      <Navbar />

      {/* MAIN */}
      <div className="min-h-screen bg-[#0b1220] text-gray-200 mt-16 md:ml-64">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0f172a]">
          <h1 className="text-sm font-semibold tracking-wide">
            ⚡ Code Compiler
          </h1>

          <button
            onClick={handleRun}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md text-sm transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Running
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">

          {/* SIDEBAR */}
          <div className="w-full md:w-60 bg-[#020617] border-b md:border-r border-gray-800 p-4 space-y-5">

            <div>
              <p className="text-xs text-gray-400 mb-2">LANGUAGE</p>

              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
              </select>
            </div>

            <div className="bg-[#0f172a] text-center py-2 rounded text-xs font-semibold tracking-wider border border-gray-700">
              {language.toUpperCase()}
            </div>

            <button
              onClick={handleRun}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded flex items-center justify-center gap-2 text-sm transition"
            >
              <Play className="w-4 h-4" />
              Run Code
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 flex flex-col w-full">

            {/* EDITOR */}
            <div className="flex-1 border-b border-gray-800 min-h-[300px]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === "c++" ? "cpp" : language}
                value={code}
                onChange={(val) => setCode(val)}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* OUTPUT */}
            <div className="min-h-[140px] md:h-56 bg-[#020617] p-3 font-mono text-sm overflow-auto border-t border-gray-800">
              {isLoading && <p className="text-yellow-400">Running...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {result?.output && (
                <pre className="text-green-400 whitespace-pre-wrap">
                  {result.output}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CodeEditor;