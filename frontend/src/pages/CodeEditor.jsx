import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { Play, Loader2 } from "lucide-react";

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
    setCode(boilerplates[lang]); // 🔥 auto change code
  };

  const handleRun = () => {
    executeCode(code, language);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h1 className="text-sm font-semibold">Code Compiler</h1>

        <button
          onClick={handleRun}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md text-sm"
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

      {/* MAIN */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-50px)]">

        {/* SIDEBAR */}
        <div className="w-full lg:w-60 bg-[#111827] border-r border-gray-700 p-4 space-y-4">

          <p className="text-xs text-gray-400">LANGUAGE</p>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full bg-[#1f2937] border border-gray-600 rounded-md p-2 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c++">C++</option>
          </select>

          <div className="bg-black text-center py-1 rounded text-xs font-bold">
            {language.toUpperCase()}
          </div>

          <button
            onClick={handleRun}
            className="w-full bg-black hover:bg-gray-800 py-2 rounded flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Code
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col">

          {/* EDITOR */}
          <div className="flex-1 border-b border-gray-700">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "c++" ? "cpp" : language}
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
              }}
            />
          </div>

          {/* OUTPUT */}
          <div className="h-40 md:h-56 bg-black p-3 text-green-400 font-mono text-sm overflow-auto">
            {isLoading && "Running..."}
            {error && <div className="text-red-400">{error}</div>}
            {result?.output}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;