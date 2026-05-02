import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { Play, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const boilerplates = {
  javascript: `console.log("Hello World");`,

  python: `print("Hello World")`,

  java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);

    int a = sc.nextInt();
    int b = sc.nextInt();
    int c = sc.nextInt();

    System.out.println("Sum: " + (a + b + c));
  }
}`,

  "c++": `#include <iostream>
using namespace std;

int main() {
  int a, b, c;
  cin >> a >> b >> c;
  cout << "Sum: " << (a + b + c);
  return 0;
}`,
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(boilerplates["javascript"]);

  //  TERMINAL STATES
  const [terminalInput, setTerminalInput] = useState([]);
  const [currentLine, setCurrentLine] = useState("");

  const { executeCode, result, isLoading, error } = useCompiler();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(boilerplates[lang]);
  };

  //  RUN WITH JOINED INPUT
  const handleRun = () => {
    const allInputs = [...terminalInput];

    //  agar last line type karke Enter nahi dabaya
    if (currentLine.trim() !== "") {
      allInputs.push(currentLine);
    }

    const finalInput = allInputs.join("\n");

    console.log("FINAL INPUT:", finalInput); // debug

    executeCode(code, language, finalInput);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0b1220] text-gray-200 lg:mt-16 lg:ml-64 md:mt-16">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0f172a]">
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

        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
          {/* SIDEBAR */}
          <div className="w-full md:w-60 bg-[#020617] border-b md:border-r border-gray-800 p-4 space-y-5">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 p-2 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
            </select>

            <button
              onClick={handleRun}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Code
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 flex flex-col">
            {/* EDITOR */}
            <div className="flex-1 border-b border-gray-800 min-h-75">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === "c++" ? "cpp" : language}
                value={code}
                onChange={(val) => setCode(val)}
                options={{ minimap: { enabled: false } }}
              />
            </div>

            {/*  TERMINAL INPUT UI */}
            <div className="bg-black text-green-400 p-3 font-mono text-sm border-t border-gray-800">
              <p className="text-gray-400 mb-2">Terminal Input (press Enter)</p>

              {/* history */}
              {terminalInput.map((line, i) => (
                <div key={i}> {line}</div>
              ))}

              {/* current input */}
              <input
                value={currentLine}
                onChange={(e) => setCurrentLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTerminalInput((prev) => [...prev, currentLine]);
                    setCurrentLine("");
                  }
                }}
                className="w-full bg-black outline-none"
                placeholder="Type input and press Enter..."
              />
            </div>

            {/* OUTPUT */}
            <div className="bg-[#020617] p-3 font-mono text-sm border-t border-gray-800 min-h-30">
              {isLoading && <p className="text-yellow-400">Running...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {result?.output && (
                <pre className="text-green-400 whitespace-pre-wrap">{result.output}</pre>
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
