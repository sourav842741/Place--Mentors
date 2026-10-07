import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import useCompiler from "../hooks/useCompiler";
import { useTheme } from "../hooks/useTheme";
import {
  Play,
  Loader2,
  Code2,
  Terminal,
  Files,
  Search,
  GitBranch,
  Bug,
  Settings,
  Sparkles,
  Maximize2,
  Minimize2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  RotateCw,
  Check,
  Copy,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

// ================= FILE & LANGUAGE CONFIG =================
const PROJECT_FILES = [
  {
    id: "main-py",
    name: "main.py",
    languageName: "Python 3",
    version: "v3.12",
    langId: "python",
    monaco: "python",
    iconType: "python",
    badgeColor: "text-[#3572A5] bg-[#3572A5]/15 border-[#3572A5]/30",
    folder: "src",
    cmd: 'python -u "practice-1.py"',
    defaultCode: `# Python 3.12 Interactive Sandbox
name = input("enter your name")
age = input("enter your age")
print(f"My name is {name} and my age is {age}")

# marks = int(input("enter your marks"))
# if marks>90:
#     print("A+")
# elif marks>80:
#     print("B")
# elif marks<60:
#     print("fail")
# print("complete")
`,
    templates: {
      default: `# Python 3.12 Sandbox
name = "Sourav"

for char in name:
    print(char)

print(name[0:3])  # name[start:end]

print(name.lower())
print(name.upper())
print(name.strip())

text = "I love Coding"
print(text.replace("Coding", "Python"))
`,
      stdin: `import sys

# Reading numbers from STDIN / input.txt
raw = sys.stdin.read().split()
if raw:
    numbers = [int(x) for x in raw if x.lstrip('-').isdigit()]
    if len(numbers) >= 2:
        print(f"Sum: {numbers[0]} + {numbers[1]} = {numbers[0] + numbers[1]}")
    else:
        print("Read values:", raw)
else:
    print("No STDIN provided. Write values into input.txt or the STDIN tab.")
`,
      algorithm: `# Two Sum in Python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
print("Input:", nums, "Target:", target)
print("Solution Indices:", two_sum(nums, target))
`,
    },
  },
  {
    id: "main-cpp",
    name: "main.cpp",
    languageName: "C++",
    version: "GCC 14.1",
    langId: "c++",
    monaco: "cpp",
    iconType: "cpp",
    badgeColor: "text-[#00599c] bg-[#00599c]/15 border-[#00599c]/30",
    folder: "src",
    cmd: "g++ main.cpp -o main ; ./main",
    defaultCode: `// C++20 (GCC 14.1) Sandbox
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string name = "Sourav";
    for (char c : name) {
        cout << c << endl;
    }

    cout << "Substring: " << name.substr(0, 3) << endl;
    cout << "PlaceMentor C++ compiler ready." << endl;
    return 0;
}
`,
    templates: {
      default: `#include <iostream>
using namespace std;

int main() {
    cout << "⚡ Hello from PlaceMentor C++20 (GCC 14.1)!" << endl;
    return 0;
}
`,
      stdin: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Sum: " << (a + b) << endl;
    } else {
        cout << "Provide numbers in input.txt or STDIN tab (e.g. '10 20')." << endl;
    }
    return 0;
}
`,
      algorithm: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) return {seen[comp], i};
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> ans = twoSum(nums, 9);
    cout << "Indices: [" << ans[0] << ", " << ans[1] << "]" << endl;
    return 0;
}
`,
    },
  },
  {
    id: "main-java",
    name: "Main.java",
    languageName: "Java",
    version: "OpenJDK 17",
    langId: "java",
    monaco: "java",
    iconType: "java",
    badgeColor: "text-[#b07219] bg-[#b07219]/15 border-[#b07219]/30",
    folder: "src",
    cmd: "javac Main.java ; java Main",
    defaultCode: `// Java 17 (OpenJDK) Sandbox
// Note: Class must be named 'Main'
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String name = "Sourav";
        for (int i = 0; i < name.length(); i++) {
            System.out.println(name.charAt(i));
        }

        System.out.println("Substring: " + name.substring(0, 3));
        System.out.println("PlaceMentor OpenJDK 17 Sandbox ready.");
    }
}
`,
    templates: {
      default: `public class Main {
    public static void main(String[] args) {
        System.out.println("⚡ Hello from PlaceMentor Java 17 sandbox!");
    }
}
`,
      stdin: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.hasNextInt() ? sc.nextInt() : 0;
            System.out.println("Sum: " + (a + b));
        } else {
            System.out.println("Provide numbers in input.txt or STDIN tab.");
        }
        sc.close();
    }
}
`,
      algorithm: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                System.out.println("Indices: [" + map.get(comp) + ", " + i + "]");
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
    },
  },
  {
    id: "index-js",
    name: "index.js",
    languageName: "JavaScript",
    version: "Node.js 22",
    langId: "javascript",
    monaco: "javascript",
    iconType: "javascript",
    badgeColor: "text-[#c29b00] bg-[#c29b00]/15 border-[#c29b00]/30",
    folder: "src",
    cmd: "node index.js",
    defaultCode: `// Node.js 22 Sandbox
const user = "Sourav";

for (const char of user) {
  console.log(char);
}

console.log(user.slice(0, 3));
console.log(user.toLowerCase());
console.log(user.toUpperCase());

const message = "I love Coding";
console.log(message.replace("Coding", "JavaScript"));
`,
    templates: {
      default: `// Node.js 22 Sandbox
console.log("⚡ Hello from PlaceMentor Node.js 22 runtime!");
`,
      stdin: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const nums = input.split(/\\s+/).map(Number).filter(n => !isNaN(n));
  if (nums.length >= 2) {
    console.log(\`Sum: \${nums[0]} + \${nums[1]} = \${nums[0] + nums[1]}\`);
  } else {
    console.log("Tokens:", nums);
  }
} else {
  console.log("Write data in input.txt or the STDIN tab.");
}
`,
      algorithm: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}

console.log("Indices:", twoSum([2, 7, 11, 15], 9));
`,
    },
  },
  {
    id: "main-c",
    name: "main.c",
    languageName: "C",
    version: "GCC 14.1",
    langId: "c",
    monaco: "c",
    iconType: "c",
    badgeColor: "text-[#555555] bg-[#555555]/15 border-[#555555]/30",
    folder: "src",
    cmd: "gcc main.c -o main ; ./main",
    defaultCode: `// C (GCC 14.1) Sandbox
#include <stdio.h>

int main() {
    printf("⚡ PlaceMentor C Compiler Ready.\\n");
    char name[] = "Sourav";
    for (int i = 0; name[i] != '\\0'; i++) {
        printf("%c\\n", name[i]);
    }
    return 0;
}
`,
    templates: {
      default: `#include <stdio.h>

int main() {
    printf("⚡ Hello from PlaceMentor C runtime!\\n");
    return 0;
}
`,
      stdin: `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("Sum: %d\\n", a + b);
    } else {
        printf("Provide integers in input.txt or STDIN tab.\\n");
    }
    return 0;
}
`,
      algorithm: `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int n = 5;
    printf("Array reversed: ");
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}
`,
    },
  },
  {
    id: "main-ts",
    name: "main.ts",
    languageName: "TypeScript",
    version: "v5.6",
    langId: "typescript",
    monaco: "typescript",
    iconType: "typescript",
    badgeColor: "text-[#3178C6] bg-[#3178C6]/15 border-[#3178C6]/30",
    folder: "src",
    cmd: "ts-node main.ts",
    defaultCode: `// TypeScript 5.6 Sandbox
interface User {
  name: string;
  role: string;
  year: number;
}

const candidate: User = {
  name: "Sourav",
  role: "Software Developer",
  year: 2026,
};

console.log("Candidate:", candidate.name);
console.log("Role:", candidate.role);
`,
    templates: {
      default: `console.log("⚡ TypeScript 5.6 sandbox ready.");
`,
      stdin: `import * as fs from 'fs';
const input: string = fs.readFileSync(0, 'utf-8').trim();
console.log("Input:", input || "No input in STDIN.");
`,
      algorithm: `function solve(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0);
}
console.log("Sum:", solve([10, 20, 30]));
`,
    },
  },
  {
    id: "main-go",
    name: "main.go",
    languageName: "Go",
    version: "v1.23",
    langId: "go",
    monaco: "go",
    iconType: "go",
    badgeColor: "text-[#00ADD8] bg-[#00ADD8]/15 border-[#00ADD8]/30",
    folder: "src",
    cmd: "go run main.go",
    defaultCode: `// Go 1.23 Sandbox
package main

import "fmt"

func main() {
    fmt.Println("⚡ Hello from Go 1.23 sandbox!")
    name := "Sourav"
    for _, ch := range name {
        fmt.Printf("%c\\n", ch)
    }
}
`,
    templates: {
      default: `package main
import "fmt"
func main() {
    fmt.Println("⚡ Go 1.23 Sandbox Ready.")
}
`,
      stdin: `package main
import (
    "bufio"
    "fmt"
    "os"
)
func main() {
    sc := bufio.NewScanner(os.Stdin)
    if sc.Scan() {
        fmt.Println("Read:", sc.Text())
    } else {
        fmt.Println("No input provided.")
    }
}
`,
      algorithm: `package main
import "fmt"
func main() {
    nums := []int{2, 7, 11, 15}
    fmt.Println("Array:", nums)
}
`,
    },
  },
  {
    id: "main-rs",
    name: "main.rs",
    languageName: "Rust",
    version: "v1.85",
    langId: "rust",
    monaco: "rust",
    iconType: "rust",
    badgeColor: "text-[#dea584] bg-[#dea584]/15 border-[#dea584]/30",
    folder: "src",
    cmd: "rustc main.rs ; ./main",
    defaultCode: `// Rust 1.85 Sandbox
fn main() {
    println!("⚡ Hello from Rust 1.85 sandbox!");
    let name = "Sourav";
    for c in name.chars() {
        println!("{}", c);
    }
}
`,
    templates: {
      default: `fn main() {
    println!("⚡ Rust 1.85 Sandbox Ready.");
}
`,
      stdin: `use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    if io::stdin().read_to_string(&mut s).is_ok() && !s.trim().is_empty() {
        println!("Input: {}", s.trim());
    } else {
        println!("No input in STDIN.");
    }
}
`,
      algorithm: `fn main() {
    let nums = vec![2, 7, 11, 15];
    println!("Array: {:?}", nums);
}
`,
    },
  },
  {
    id: "input-txt",
    name: "input.txt",
    languageName: "Custom STDIN",
    version: "Text",
    langId: null, // text file
    monaco: "plaintext",
    iconType: "txt",
    badgeColor: "text-[#858585] bg-[#858585]/15 border-[#858585]/30",
    folder: "src",
    cmd: "cat input.txt",
    defaultCode: `10 20
hello from input.txt`,
    templates: {
      default: `10 20\nhello from input.txt`,
      stdin: `5\n1 2 3 4 5`,
      algorithm: `9\n2 7 11 15`,
    },
  },
];

// Helper to render VS Code file icons
const FileIconBadge = ({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case "python":
      return <span className="text-[#3572A5] font-bold text-xs select-none">🐍</span>;
    case "javascript":
      return (
        <span className="text-[#e5a00d] font-bold text-[9px] bg-[#F7DF1E]/15 px-1 py-0.5 rounded select-none font-mono">
          JS
        </span>
      );
    case "typescript":
      return (
        <span className="text-[#3178C6] font-bold text-[9px] bg-[#3178C6]/15 px-1 py-0.5 rounded select-none font-mono">
          TS
        </span>
      );
    case "java":
      return <span className="text-[#b07219] font-bold text-xs select-none">☕</span>;
    case "cpp":
      return (
        <span className="text-[#00599c] font-bold text-[9px] bg-[#00599c]/15 px-1 py-0.5 rounded select-none font-mono">
          C++
        </span>
      );
    case "c":
      return (
        <span className="text-[#555555] font-bold text-[9px] bg-neutral-500/15 px-1 py-0.5 rounded select-none font-mono">
          C
        </span>
      );
    case "go":
      return (
        <span className="text-[#00ADD8] font-bold text-[9px] bg-[#00ADD8]/15 px-1 py-0.5 rounded select-none font-mono">
          GO
        </span>
      );
    case "rust":
      return (
        <span className="text-[#dea584] font-bold text-[9px] bg-[#dea584]/15 px-1 py-0.5 rounded select-none font-mono">
          RS
        </span>
      );
    case "txt":
      return <FileText className={`${className} text-[#858585]`} />;
    default:
      return <FileText className={`${className} text-[#858585]`} />;
  }
};

// Diagnostic parser for compiler error tracebacks
const parseDiagnostics = (rawError) => {
  if (!rawError) return null;
  const lines = rawError.split("\n");
  let lineNum = null;
  let colNum = null;
  let message = null;

  const cppRegex = /(?:main\.\w+|[a-zA-Z0-9_\-\.]+):(\d+)(?::(\d+))?:\s*(error|warning|fatal error):\s*(.*)/i;
  const pyRegex = /File\s+"[^"]*",\s*line\s*(\d+)/i;
  const javaRegex = /Main\.java:(\d+):\s*error:\s*(.*)/i;

  for (const line of lines) {
    const cppMatch = line.match(cppRegex);
    if (cppMatch) {
      lineNum = cppMatch[1];
      colNum = cppMatch[2] || "1";
      message = cppMatch[4];
      break;
    }
    const pyMatch = line.match(pyRegex);
    if (pyMatch) {
      lineNum = pyMatch[1];
      message = lines[lines.length - 1] || "Python Exception";
      break;
    }
    const javaMatch = line.match(javaRegex);
    if (javaMatch) {
      lineNum = javaMatch[1];
      message = javaMatch[2];
      break;
    }
  }

  let tip = null;
  const lower = rawError.toLowerCase();
  if (lower.includes("not declared in this scope") || lower.includes("cannot find symbol") || lower.includes("is not defined")) {
    tip = "Undeclared identifier: check variable name spelling or imports.";
  } else if (lower.includes("expected ';'") || lower.includes("';' expected")) {
    tip = "Missing semicolon ';': ensure all statement lines end with a semicolon.";
  } else if (lower.includes("nosuchelementexception")) {
    tip = "Scanner EOF: tried to read stdin without input. Enter text in input.txt.";
  } else if (lower.includes("zerodivisionerror") || lower.includes("/ by zero")) {
    tip = "Division by zero: ensure divisor values are non-zero.";
  } else if (lower.includes("time limit exceeded")) {
    tip = "Time Limit Exceeded (>15s): check for infinite loops (e.g. while(true)).";
  }

  return { lineNum, colNum, message, tip };
};

// Helper to detect input prompts from source code (e.g. Python input(), C++ cin, Java Scanner)
const extractPromptsFromCode = (code, language) => {
  if (!code) return [];
  const lang = (language || "").toLowerCase();

  // Python: input("prompt") or input('prompt') or input()
  if (lang.includes("python") || lang === "py") {
    // Strip comments line by line so commented out code like `# marks = int(input(...))` is ignored
    const cleanLines = code.split("\n").map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#")) return "";
      const hashIdx = line.indexOf("#");
      if (hashIdx !== -1) {
        // check if # is inside string
        const before = line.slice(0, hashIdx);
        const singleQuotes = (before.match(/'/g) || []).length;
        const doubleQuotes = (before.match(/"/g) || []).length;
        if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
          return before;
        }
      }
      return line;
    });
    const cleanCode = cleanLines.join("\n");

    const inputRegex = /input\s*\(\s*(?:f?(['"])(.*?)\1)?\s*\)/g;
    const prompts = [];
    let match;
    while ((match = inputRegex.exec(cleanCode)) !== null) {
      prompts.push(match[2] !== undefined ? match[2] : "");
    }
    return prompts;
  }

  // C++: cin >> var or getline(cin, var)
  if (lang.includes("c++") || lang.includes("cpp")) {
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    const cinCount = (cleanCode.match(/(?:cin\s*>>|getline\s*\(\s*cin)/g) || []).length;
    if (cinCount > 0) {
      const coutRegex = /cout\s*<<\s*["']([^"']*)["']/g;
      const couts = [];
      let m;
      while ((m = coutRegex.exec(cleanCode)) !== null) {
        couts.push(m[1]);
      }
      const prompts = [];
      for (let i = 0; i < cinCount; i++) {
        prompts.push(couts[i] || "");
      }
      return prompts;
    }
    return [];
  }

  // Java: sc.next() or sc.nextLine()
  if (lang.includes("java")) {
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    const scCount = (cleanCode.match(/sc\.(?:next|nextLine|nextInt|nextDouble|nextLong)\s*\(\)/g) || []).length;
    if (scCount > 0) {
      const printRegex = /System\.out\.print(?:ln)?\s*\(\s*["']([^"']*)["']\s*\)/g;
      const prints = [];
      let m;
      while ((m = printRegex.exec(cleanCode)) !== null) {
        prints.push(m[1]);
      }
      const prompts = [];
      for (let i = 0; i < scCount; i++) {
        prompts.push(prints[i] || "");
      }
      return prompts;
    }
    return [];
  }

  // C: scanf("%d", &x)
  if (lang === "c") {
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    const scanfCount = (cleanCode.match(/scanf\s*\(/g) || []).length;
    if (scanfCount > 0) {
      const printfRegex = /printf\s*\(\s*["']([^"']*)["']\s*\)/g;
      const printfs = [];
      let m;
      while ((m = printfRegex.exec(cleanCode)) !== null) {
        printfs.push(m[1]);
      }
      const prompts = [];
      for (let i = 0; i < scanfCount; i++) {
        prompts.push(printfs[i] || "");
      }
      return prompts;
    }
    return [];
  }

  return [];
};

const CodeEditor = () => {
  // Global App Theme
  const { isDark, toggleTheme } = useTheme();

  // File System State
  const [fileCodes, setFileCodes] = useState(() => {
    const init = {};
    PROJECT_FILES.forEach((f) => {
      init[f.id] = f.defaultCode;
    });
    return init;
  });

  const [activeFileId, setActiveFileId] = useState("main-py");
  // Default to only the selected language open instead of cluttering all 5 files
  const [openTabs, setOpenTabs] = useState(["main-py"]);

  // Sidebar & Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("explorer"); // "explorer" | "search" | "git" | "templates" | "settings"
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalTab, setTerminalTab] = useState("terminal"); // "terminal" | "problems" | "output" | "debug" | "stdin"
  const [terminalHeight, setTerminalHeight] = useState(250); // pixels
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
  const dragStartYRef = useRef(0);
  const startHeightRef = useRef(250);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editor cursor & options
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(true);

  // ================= REAL INTERACTIVE TERMINAL STATE =================
  const [terminalHistory, setTerminalHistory] = useState([
    { id: 1, type: "system", text: "Windows PowerShell [PlaceMentor Secure Execution Sandbox v2.4]" },
    { id: 2, type: "idle", text: "PS C:\\sandbox-project>" },
  ]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activePrompts, setActivePrompts] = useState([]);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [currentPromptText, setCurrentPromptText] = useState("");
  const [inputLineValue, setInputLineValue] = useState("");
  const [collectedInputs, setCollectedInputs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const interactiveInputRef = useRef(null);
  const terminalEndRef = useRef(null);
  const editorRef = useRef(null);

  const activeFile = PROJECT_FILES.find((f) => f.id === activeFileId) || PROJECT_FILES[0];
  const activeCode = fileCodes[activeFileId] || "";

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory, isInteracting, currentPromptText]);

  // Focus interactive input when active
  useEffect(() => {
    if (isInteracting) {
      interactiveInputRef.current?.focus();
    }
  }, [isInteracting, currentPromptText]);

  // Compiler hook
  const { executeCode, clearResult, result, isLoading, error } = useCompiler();

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
      toast.success("Entered Fullscreen VS Code Studio (Press Esc or F11 to exit)");
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      toast.info("Exited Fullscreen mode");
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        toggleFullscreen();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, activeFileId, fileCodes]);

  // Draggable terminal resize handling
  const handleStartResize = (e) => {
    e.preventDefault();
    setIsDraggingTerminal(true);
    dragStartYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;
  };

  useEffect(() => {
    if (!isDraggingTerminal) return;

    const handleMouseMove = (e) => {
      // Dragging upward increases terminal height, downward decreases
      const deltaY = dragStartYRef.current - e.clientY;
      const newHeight = Math.min(
        Math.max(startHeightRef.current + deltaY, 90),
        Math.max(window.innerHeight - 160, 200)
      );
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDraggingTerminal(false);
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingTerminal]);

  const handleFileClick = (fileId) => {
    setActiveFileId(fileId);
    // User specifically asked: when a language is selected, only that language tab is open!
    setOpenTabs([fileId]);
  };

  const handleCloseTab = (e, fileId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((id) => id !== fileId);
    if (newTabs.length > 0) {
      setOpenTabs(newTabs);
      if (activeFileId === fileId) {
        setActiveFileId(newTabs[newTabs.length - 1]);
      }
    } else {
      setActiveFileId("main-py");
      setOpenTabs(["main-py"]);
    }
  };

  const handleCodeChange = (val) => {
    setFileCodes((prev) => ({ ...prev, [activeFileId]: val || "" }));
  };

  const handleClearTerminal = () => {
    setTerminalHistory([
      { id: 1, type: "system", text: "Windows PowerShell [PlaceMentor Secure Execution Sandbox v2.4]" },
      { id: 2, type: "idle", text: "PS C:\\sandbox-project>" },
    ]);
    setIsInteracting(false);
    setCurrentPromptText("");
    setInputLineValue("");
    setCollectedInputs([]);
    clearResult();
  };

  const handleRun = async () => {
    if (isLoading || isExecuting || isInteracting) return;

    let targetFile = activeFile;
    if (!targetFile.langId) {
      const runnable = PROJECT_FILES.find((f) => openTabs.includes(f.id) && f.langId);
      targetFile = runnable || PROJECT_FILES[0];
    }

    const targetCode = fileCodes[targetFile.id] || targetFile.defaultCode;

    setIsTerminalOpen(true);
    setTerminalTab("terminal");

    // Add command line entry to terminal history
    const cmdLine = `● PS C:\\sandbox-project> ${targetFile.cmd}`;
    setTerminalHistory((prev) => [
      ...prev,
      { id: Date.now(), type: "cmd", text: cmdLine },
    ]);

    // Check if code has interactive input prompts
    const prompts = extractPromptsFromCode(targetCode, targetFile.langId);

    if (prompts.length > 0) {
      // Enter interactive terminal prompt mode
      setActivePrompts(prompts);
      setActivePromptIndex(0);
      setCurrentPromptText(prompts[0]);
      setInputLineValue("");
      setCollectedInputs([]);
      setIsInteracting(true);
      setTimeout(() => interactiveInputRef.current?.focus(), 50);
    } else {
      // Direct execution without inputs
      setIsExecuting(true);
      try {
        const stdinInput = fileCodes["input-txt"] || "";
        const res = await executeCode(targetCode, targetFile.langId, stdinInput);
        if (res) {
          if (res.stdout) {
            setTerminalHistory((prev) => [
              ...prev,
              { id: Date.now() + 1, type: "output", text: res.stdout },
            ]);
          }
          if (res.compile_output || res.stderr) {
            setTerminalHistory((prev) => [
              ...prev,
              { id: Date.now() + 2, type: "error", text: res.compile_output || res.stderr },
            ]);
          }
          if (!res.stdout && !res.compile_output && !res.stderr && res.output) {
            setTerminalHistory((prev) => [
              ...prev,
              { id: Date.now() + 3, type: res.hasError ? "error" : "output", text: res.output },
            ]);
          }
        }
      } catch (err) {
        setTerminalHistory((prev) => [
          ...prev,
          { id: Date.now() + 2, type: "error", text: err?.message || "Execution error" },
        ]);
      } finally {
        setIsExecuting(false);
        setTerminalHistory((prev) => [
          ...prev,
          { id: Date.now() + 4, type: "idle", text: "◇ PS C:\\sandbox-project>" },
        ]);
      }
    }
  };

  // Handle typing input line in interactive terminal and pressing Enter
  const handleInteractiveKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputLineValue;
      setInputLineValue("");

      // Record this line in terminal history (matching VS Code format)
      const completedText = `${currentPromptText}${val}`;
      setTerminalHistory((prev) => [
        ...prev,
        { id: Date.now(), type: "interactive-line", text: completedText },
      ]);

      const newInputs = [...collectedInputs, val];
      setCollectedInputs(newInputs);

      const nextIndex = activePromptIndex + 1;
      if (nextIndex < activePrompts.length) {
        // Move to next prompt
        setActivePromptIndex(nextIndex);
        setCurrentPromptText(activePrompts[nextIndex]);
        setTimeout(() => interactiveInputRef.current?.focus(), 50);
      } else {
        // All prompts collected! Execute the program with these inputs!
        setIsInteracting(false);
        setCurrentPromptText("");

        const finalStdin = newInputs.join("\n");
        setFileCodes((prev) => ({ ...prev, "input-txt": finalStdin }));

        let targetFile = activeFile;
        if (!targetFile.langId) {
          const runnable = PROJECT_FILES.find((f) => openTabs.includes(f.id) && f.langId);
          targetFile = runnable || PROJECT_FILES[0];
        }
        const targetCode = fileCodes[targetFile.id] || targetFile.defaultCode;

        setIsExecuting(true);
        try {
          const res = await executeCode(targetCode, targetFile.langId, finalStdin);

          if (res) {
            let cleanOut = res.stdout || res.output || "";
            // Strip any echoed prompt text so only actual program output is printed
            for (const p of activePrompts) {
              if (p) {
                cleanOut = cleanOut.split(p).join("");
              }
            }
            cleanOut = cleanOut.replace(/^\n+/, "").replace(/\n+$/, "");

            if (cleanOut) {
              setTerminalHistory((prev) => [
                ...prev,
                { id: Date.now() + 1, type: "output", text: cleanOut },
              ]);
            }
            if (res.hasError && (res.compile_output || res.stderr)) {
              setTerminalHistory((prev) => [
                ...prev,
                { id: Date.now() + 2, type: "error", text: res.compile_output || res.stderr },
              ]);
            }
          }
        } catch (err) {
          setTerminalHistory((prev) => [
            ...prev,
            { id: Date.now() + 2, type: "error", text: err?.message || "Execution error" },
          ]);
        } finally {
          setIsExecuting(false);
          setTerminalHistory((prev) => [
            ...prev,
            { id: Date.now() + 3, type: "idle", text: "◇ PS C:\\sandbox-project>" },
          ]);
        }
      }
    } else if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      // Ctrl+C to cancel interactive input
      e.preventDefault();
      setIsInteracting(false);
      setCurrentPromptText("");
      setInputLineValue("");
      setTerminalHistory((prev) => [
        ...prev,
        { id: Date.now(), type: "error", text: "^C" },
        { id: Date.now() + 1, type: "idle", text: "◇ PS C:\\sandbox-project>" },
      ]);
    }
  };

  const handleApplyTemplate = (type) => {
    if (activeFile.templates && activeFile.templates[type]) {
      setFileCodes((prev) => ({ ...prev, [activeFileId]: activeFile.templates[type] }));
      toast.success(`Loaded ${type} template in ${activeFile.languageName}`);
    }
  };

  const handleResetActiveFile = () => {
    setFileCodes((prev) => ({ ...prev, [activeFileId]: activeFile.defaultCode }));
    toast.info(`Reset ${activeFile.languageName} (${activeFile.name}) to default`);
  };

  const diagnostic = parseDiagnostics(
    result?.compile_output || result?.stderr || (result?.hasError ? result?.output : "")
  );

  const errorCount = result?.hasError ? 1 : 0;

  // Theme-specific styles
  const t = {
    bgTitle: isDark ? "bg-[#181818] border-[#2b2b2b] text-[#cccccc]" : "bg-[#e8e8e8] border-[#d4d4d4] text-[#222222]",
    bgActivity: isDark ? "bg-[#181818] border-[#2b2b2b]" : "bg-[#f0f0f0] border-[#d4d4d4]",
    bgSidebar: isDark ? "bg-[#181818] border-[#2b2b2b] text-[#cccccc]" : "bg-[#f8f8f8] border-[#d4d4d4] text-[#24292f]",
    bgTabsBar: isDark ? "bg-[#252526] border-[#181818]" : "bg-[#ececec] border-[#d4d4d4]",
    tabActive: isDark ? "bg-[#1e1e1e] text-[#ffffff]" : "bg-[#ffffff] text-[#111111] shadow-2xs",
    tabInactive: isDark ? "bg-[#2d2d2d] text-[#969696] hover:bg-[#202020]" : "bg-[#e0e0e0] text-[#555555] hover:bg-[#e8e8e8]",
    tabBorder: isDark ? "border-[#181818]" : "border-[#d4d4d4]",
    bgBreadcrumbs: isDark ? "bg-[#1e1e1e] border-[#252526] text-[#858585]" : "bg-[#ffffff] border-[#e5e5e5] text-[#57606a]",
    bgTerminal: isDark ? "bg-[#181818] border-[#2b2b2b] text-[#cccccc]" : "bg-[#fbfbfb] border-[#d4d4d4] text-[#1f2328]",
    terminalPromptText: isDark ? "text-[#cccccc]" : "text-[#222222]",
    terminalCmdText: isDark ? "text-[#dcdcaa]" : "text-[#098658]",
    terminalBorder: isDark ? "border-[#2b2b2b]" : "border-[#e0e0e0]",
    terminalActiveTab: isDark ? "border-[#007acc] text-[#ffffff]" : "border-[#007acc] text-[#000000] font-bold",
    cardBg: isDark ? "bg-[#252526] border-[#3c3c3c]" : "bg-[#ffffff] border-[#e0e0e0] shadow-xs",
    editorTheme: isDark ? "vs-dark" : "light",
  };

  return (
    <>
      {!isFullscreen && <Navbar />}

      <div
        className={
          isFullscreen
            ? `fixed inset-0 z-[100] ${isDark ? "bg-[#181818]" : "bg-[#f3f3f3]"} flex flex-col h-screen w-screen overflow-hidden font-sans select-none`
            : `min-h-screen ${isDark ? "bg-bg text-[#cccccc]" : "bg-[#f7f8fa] text-[#24292f]"} pt-16 lg:pl-64 flex flex-col transition-colors duration-200`
        }
      >
        {/* ================= VS CODE FRAME CONTAINER ================= */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            isDark ? "bg-[#181818]" : "bg-[#ffffff]"
          } ${!isFullscreen ? "min-h-[calc(100vh-80px)] border-t " + t.bgTitle.split(" ")[1] : "h-screen"}`}
        >
          {/* ================= 1. VS CODE TITLE BAR ================= */}
          <header className={`h-11 ${t.bgTitle} flex items-center justify-between px-3 text-[12px] select-none shrink-0 border-b gap-2`}>
            {/* Left: Branding & Language Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Code2 className="w-4 h-4 text-[#007acc]" />
                <span className="hidden sm:inline">VS Code Studio</span>
              </div>

              {/* CLEAR LANGUAGE SELECTOR DROPDOWN */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-current/20">
                <label className="text-[11px] font-semibold opacity-75 hidden md:block">
                  Language:
                </label>
                <select
                  value={activeFileId}
                  onChange={(e) => handleFileClick(e.target.value)}
                  className={`text-xs font-semibold px-2 py-1 rounded border cursor-pointer ${
                    isDark
                      ? "bg-[#252526] text-[#ffffff] border-[#3c3c3c] hover:border-[#007acc]"
                      : "bg-[#ffffff] text-[#111111] border-[#cccccc] hover:border-[#007acc] shadow-2xs"
                  }`}
                >
                  {PROJECT_FILES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.languageName} ({f.name}) - {f.version}
                    </option>
                  ))}
                </select>

                {/* Vivid Active Language Badge */}
                <div
                  className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold ${activeFile.badgeColor}`}
                >
                  <FileIconBadge type={activeFile.iconType} />
                  <span>{activeFile.languageName}</span>
                </div>
              </div>
            </div>

            {/* Center: Command Palette / Title Search Bar */}
            <div className="flex-1 max-w-sm mx-2 hidden sm:block">
              <div
                className={`flex items-center justify-center gap-2 py-1 px-3 rounded-md text-[11px] border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#252526] hover:bg-[#2a2d2e] border-[#3c3c3c] text-[#cccccc]"
                    : "bg-[#ffffff] hover:bg-[#f0f0f0] border-[#cccccc] text-[#333333] shadow-2xs"
                }`}
              >
                <Search className="w-3 h-3 opacity-60" />
                <span className="font-semibold text-[#007acc]">{activeFile.languageName}</span>
                <span className="truncate opacity-75">({activeFile.name})</span>
                <span className="text-[10px] opacity-60 ml-auto hidden md:inline font-mono">
                  Ctrl+Enter
                </span>
              </div>
            </div>

            {/* Right: Controls (Theme Toggle, Fullscreen, Run) */}
            <div className="flex items-center gap-2">
              {/* THEME TOGGLE BUTTON (SUN / MOON) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode (☀️)" : "Switch to Dark Mode (🌙)"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#252526] hover:bg-[#2a2d2e] text-[#cccccc] border-[#3c3c3c]"
                    : "bg-[#ffffff] hover:bg-[#f5f5f5] text-[#222222] border-[#cccccc] shadow-2xs"
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen (Esc / F11)" : "Enter Fullscreen (F11)"}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  isFullscreen ? "text-[#007acc] border-[#007acc]" : isDark ? "border-[#3c3c3c] hover:bg-[#2a2d2e]" : "border-[#cccccc] hover:bg-[#f0f0f0]"
                }`}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Green Play Run Button */}
              <button
                type="button"
                onClick={handleRun}
                disabled={isLoading}
                title="Run Code (Ctrl + Enter)"
                className="flex items-center gap-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>Run</span>
              </button>
            </div>
          </header>

          {/* ================= 2. MAIN VS CODE WORKSPACE ================= */}
          <div className="flex-1 flex overflow-hidden">
            {/* ================= 2A. LEFT ACTIVITY BAR (48px) ================= */}
            <aside className={`w-12 ${t.bgActivity} border-r flex flex-col items-center justify-between py-2 shrink-0 select-none`}>
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Explorer Icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarTab === "explorer" && isSidebarOpen) {
                      setIsSidebarOpen(false);
                    } else {
                      setSidebarTab("explorer");
                      setIsSidebarOpen(true);
                    }
                  }}
                  title="Explorer (Files)"
                  className={`w-full flex justify-center py-2 relative cursor-pointer ${
                    sidebarTab === "explorer" && isSidebarOpen
                      ? "text-[#007acc]"
                      : isDark ? "text-[#858585] hover:text-[#cccccc]" : "text-[#666666] hover:text-[#000000]"
                  }`}
                >
                  {sidebarTab === "explorer" && isSidebarOpen && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                  )}
                  <Files className="w-5 h-5" />
                </button>

                {/* Templates & Starters */}
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarTab === "templates" && isSidebarOpen) {
                      setIsSidebarOpen(false);
                    } else {
                      setSidebarTab("templates");
                      setIsSidebarOpen(true);
                    }
                  }}
                  title="Code Templates & Algorithms"
                  className={`w-full flex justify-center py-2 relative cursor-pointer ${
                    sidebarTab === "templates" && isSidebarOpen
                      ? "text-[#007acc]"
                      : isDark ? "text-[#858585] hover:text-[#cccccc]" : "text-[#666666] hover:text-[#000000]"
                  }`}
                >
                  {sidebarTab === "templates" && isSidebarOpen && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                  )}
                  <Sparkles className="w-5 h-5" />
                </button>

                {/* Run & Debug */}
                <button
                  type="button"
                  onClick={handleRun}
                  title="Run Code"
                  className={`w-full flex justify-center py-2 cursor-pointer ${
                    isDark ? "text-[#858585] hover:text-[#cccccc]" : "text-[#666666] hover:text-[#000000]"
                  }`}
                >
                  <Play className="w-5 h-5" />
                </button>

                {/* Git Source Control */}
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarTab === "git" && isSidebarOpen) {
                      setIsSidebarOpen(false);
                    } else {
                      setSidebarTab("git");
                      setIsSidebarOpen(true);
                    }
                  }}
                  title="Source Control"
                  className={`w-full flex justify-center py-2 relative cursor-pointer ${
                    sidebarTab === "git" && isSidebarOpen
                      ? "text-[#007acc]"
                      : isDark ? "text-[#858585] hover:text-[#cccccc]" : "text-[#666666] hover:text-[#000000]"
                  }`}
                >
                  {sidebarTab === "git" && isSidebarOpen && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                  )}
                  <GitBranch className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Activity Icons */}
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Settings Gear */}
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarTab === "settings" && isSidebarOpen) {
                      setIsSidebarOpen(false);
                    } else {
                      setSidebarTab("settings");
                      setIsSidebarOpen(true);
                    }
                  }}
                  title="Settings & Font"
                  className={`w-full flex justify-center py-2 relative cursor-pointer ${
                    sidebarTab === "settings" && isSidebarOpen
                      ? "text-[#007acc]"
                      : isDark ? "text-[#858585] hover:text-[#cccccc]" : "text-[#666666] hover:text-[#000000]"
                  }`}
                >
                  {sidebarTab === "settings" && isSidebarOpen && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                  )}
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </aside>

            {/* ================= 2B. COLLAPSIBLE SIDEBAR / EXPLORER ================= */}
            {isSidebarOpen && (
              <div className={`w-64 ${t.bgSidebar} border-r flex flex-col shrink-0 select-none text-[12px]`}>
                {/* EXPLORER TAB */}
                {sidebarTab === "explorer" && (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wider uppercase opacity-75">
                      <span>EXPLORER (Languages)</span>
                      <button
                        type="button"
                        onClick={handleResetActiveFile}
                        title="Reset Current File"
                        className="hover:text-[#007acc] p-0.5 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Project Tree */}
                    <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
                      {/* Root Folder */}
                      <div className="px-2 py-1 flex items-center gap-1 font-bold text-[11px] opacity-80 cursor-pointer">
                        <ChevronDown className="w-3.5 h-3.5 text-[#007acc]" />
                        <FolderOpen className="w-3.5 h-3.5 text-[#dcb67a]" />
                        <span>SANDBOX-PROJECT</span>
                      </div>

                      {/* File Items with CLEAR LANGUAGE LABELS */}
                      <div className="pl-2 space-y-1">
                        {PROJECT_FILES.map((file) => {
                          const isActive = file.id === activeFileId;
                          return (
                            <div
                              key={file.id}
                              onClick={() => handleFileClick(file.id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                                isActive
                                  ? isDark
                                    ? "bg-[#37373d] text-[#ffffff] font-medium"
                                    : "bg-[#e2e2e2] text-[#000000] font-semibold shadow-2xs"
                                  : isDark
                                    ? "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-[#ffffff]"
                                    : "text-[#444444] hover:bg-[#eaeaea] hover:text-[#000000]"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileIconBadge type={file.iconType} />
                                <span className="font-semibold text-xs">{file.languageName}</span>
                                <span className="text-[11px] opacity-60 font-mono">({file.name})</span>
                              </div>
                              <span className="text-[10px] px-1 py-0.2 rounded font-mono opacity-70">
                                {file.version}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* OUTLINE & TIMELINE COLLAPSIBLE */}
                      <div className="mt-4 pt-2 border-t border-current/15 px-3 space-y-2 opacity-60 text-[11px]">
                        <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-semibold uppercase tracking-wider text-[10px]">
                            Outline
                          </span>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-semibold uppercase tracking-wider text-[10px]">
                            Timeline
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TEMPLATES TAB */}
                {sidebarTab === "templates" && (
                  <div className="p-3 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      Quick Starters
                    </div>
                    <p className="text-[11px] opacity-75">
                      Load curated interview templates into <strong>{activeFile.languageName}</strong>:
                    </p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate("default")}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] cursor-pointer ${
                          isDark ? "bg-[#252526] hover:bg-[#2a2d2e]" : "bg-[#ffffff] hover:bg-[#eaeaea] border border-[#d4d4d4]"
                        }`}
                      >
                        🚀 Standard Boilerplate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate("stdin")}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] cursor-pointer ${
                          isDark ? "bg-[#252526] hover:bg-[#2a2d2e]" : "bg-[#ffffff] hover:bg-[#eaeaea] border border-[#d4d4d4]"
                        }`}
                      >
                        📥 STDIN Reader Template
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate("algorithm")}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] cursor-pointer ${
                          isDark ? "bg-[#252526] hover:bg-[#2a2d2e]" : "bg-[#ffffff] hover:bg-[#eaeaea] border border-[#d4d4d4]"
                        }`}
                      >
                        🧠 Two Sum Algorithm
                      </button>
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {sidebarTab === "settings" && (
                  <div className="p-3 space-y-3 text-[11px]">
                    <div className="font-bold uppercase tracking-wider opacity-80">
                      Editor Settings
                    </div>
                    <div>
                      <label className="opacity-75 block mb-1">Font Size</label>
                      <div className="flex items-center gap-1">
                        {[12, 14, 16, 18].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFontSize(size)}
                            className={`px-2 py-1 rounded text-xs cursor-pointer ${
                              fontSize === size
                                ? "bg-[#007acc] text-white"
                                : isDark ? "bg-[#252526]" : "bg-[#ffffff] border border-[#d4d4d4]"
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMinimap}
                          onChange={(e) => setShowMinimap(e.target.checked)}
                          className="accent-[#007acc]"
                        />
                        <span>Enable Code Minimap</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* GIT TAB */}
                {sidebarTab === "git" && (
                  <div className="p-3 space-y-3 text-[11px]">
                    <div className="font-bold uppercase tracking-wider opacity-80">
                      Source Control
                    </div>
                    <p className="opacity-75">Repository: local sandbox</p>
                    <div className={`p-2 rounded font-mono ${isDark ? "bg-[#252526] text-[#4ec9b0]" : "bg-[#ffffff] text-[#098658] border border-[#d4d4d4]"}`}>
                      Branch: main (up to date)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= 2C. EDITOR & TERMINAL REGION ================= */}
            <div className={`flex-1 flex flex-col min-w-0 ${isDark ? "bg-[#1e1e1e]" : "bg-[#ffffff]"}`}>
              {/* ================= TABS HEADER WITH CLEAR LANGUAGE BADGES ================= */}
              <div className={`flex items-center justify-between ${t.bgTabsBar} border-b h-9 select-none overflow-x-auto shrink-0`}>
                <div className="flex items-center h-full">
                  {openTabs.map((tabId) => {
                    const file = PROJECT_FILES.find((f) => f.id === tabId);
                    if (!file) return null;
                    const isActive = file.id === activeFileId;
                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={`group flex items-center gap-2 px-3 h-full text-[12px] cursor-pointer border-r ${t.tabBorder} transition-colors relative whitespace-nowrap shrink-0 ${
                          isActive ? t.tabActive : t.tabInactive
                        }`}
                      >
                        {/* Blue active line on top of tab */}
                        {isActive && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#007acc]" />
                        )}
                        <FileIconBadge type={file.iconType} />
                        <span className="font-bold text-xs whitespace-nowrap">{file.languageName}</span>
                        <span className="text-[11px] opacity-60 whitespace-nowrap font-mono">({file.name})</span>
                        <button
                          type="button"
                          onClick={(e) => handleCloseTab(e, file.id)}
                          className="p-0.5 rounded hover:bg-black/20 opacity-60 hover:opacity-100 transition-colors cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Right Tab Bar Actions */}
                <div className="flex items-center gap-2 px-3 opacity-75">
                  <button
                    type="button"
                    onClick={handleRun}
                    title="Run active file"
                    className="hover:opacity-100 p-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#007acc]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeCode);
                      toast.success("Copied code to clipboard");
                    }}
                    title="Copy File Code"
                    className="hover:opacity-100 p-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ================= BREADCRUMBS BAR ================= */}
              <div className={`flex items-center gap-1.5 px-4 py-1 ${t.bgBreadcrumbs} border-b text-[11px] select-none shrink-0 font-mono`}>
                <span className="hover:underline cursor-pointer">sandbox-project</span>
                <span>&gt;</span>
                <span className="hover:underline cursor-pointer">{activeFile.folder}</span>
                <span>&gt;</span>
                <span className="flex items-center gap-1 font-bold text-[#007acc]">
                  <FileIconBadge type={activeFile.iconType} className="w-3 h-3" />
                  {activeFile.languageName} ({activeFile.name})
                </span>
                <span>&gt;</span>
                <span className="opacity-60">main()</span>
              </div>

              {/* ================= MONACO CODE EDITOR ================= */}
              <div className="flex-1 w-full min-h-[160px] overflow-hidden">
                <Editor
                  height="100%"
                  theme={t.editorTheme}
                  language={activeFile.monaco}
                  value={activeCode}
                  onChange={handleCodeChange}
                  onMount={(editor) => {
                    editorRef.current = editor;
                    editor.onDidChangeCursorPosition((e) => {
                      setCursorPos({
                        line: e.position.lineNumber,
                        col: e.position.column,
                      });
                    });
                  }}
                  options={{
                    minimap: { enabled: showMinimap },
                    fontSize: fontSize,
                    fontFamily: "Consolas, 'Courier New', Menlo, monospace",
                    fontLigatures: true,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 4,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    renderLineHighlight: "all",
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </div>

              {/* ================= 2D. VS CODE BOTTOM PANEL (TERMINAL / PROBLEMS) ================= */}
              {isTerminalOpen && (
                <>
                  {/* DRAGGABLE RESIZER SPLITTER (Hold & Drag up/down to resize terminal) */}
                  <div
                    onMouseDown={handleStartResize}
                    title="Drag up or down to resize terminal"
                    className={`h-1.5 w-full cursor-row-resize select-none shrink-0 transition-colors z-20 flex items-center justify-center group ${
                      isDraggingTerminal
                        ? "bg-[#007acc]"
                        : isDark
                          ? "bg-[#252526] hover:bg-[#007acc]"
                          : "bg-[#e5e5e5] hover:bg-[#007acc]"
                    }`}
                  >
                    <div className="w-12 h-0.5 rounded-full bg-current opacity-40 group-hover:opacity-100 group-hover:bg-white transition-opacity" />
                  </div>

                  <div
                    style={{ height: `${terminalHeight}px` }}
                    className={`${t.bgTerminal} border-t flex flex-col shrink-0 overflow-hidden ${
                      isDraggingTerminal ? "" : "transition-[height] duration-75"
                    }`}
                  >
                    {/* Terminal Tab Bar */}
                    <div className={`flex items-center justify-between px-3 border-b ${t.terminalBorder} text-[11px] select-none shrink-0`}>
                      <div className="flex items-center gap-4">
                        {/* PROBLEMS TAB */}
                        <button
                          type="button"
                          onClick={() => setTerminalTab("problems")}
                          className={`py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                            terminalTab === "problems" ? t.terminalActiveTab : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          <span>PROBLEMS</span>
                          {errorCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#f14c4c] text-white text-[10px] font-bold">
                              {errorCount}
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-60">0</span>
                          )}
                        </button>

                        {/* OUTPUT TAB */}
                        <button
                          type="button"
                          onClick={() => setTerminalTab("output")}
                          className={`py-2 border-b-2 font-medium cursor-pointer transition-colors ${
                            terminalTab === "output" ? t.terminalActiveTab : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          OUTPUT
                        </button>

                        {/* DEBUG CONSOLE */}
                        <button
                          type="button"
                          onClick={() => setTerminalTab("debug")}
                          className={`py-2 border-b-2 font-medium cursor-pointer transition-colors hidden sm:block ${
                            terminalTab === "debug" ? t.terminalActiveTab : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          DEBUG CONSOLE
                        </button>

                        {/* TERMINAL TAB */}
                        <button
                          type="button"
                          onClick={() => setTerminalTab("terminal")}
                          className={`py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                            terminalTab === "terminal" ? t.terminalActiveTab : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          <Terminal className="w-3 h-3 text-[#007acc]" />
                          <span>TERMINAL</span>
                        </button>

                        {/* STDIN INPUT TAB */}
                        <button
                          type="button"
                          onClick={() => setTerminalTab("stdin")}
                          className={`py-2 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                            terminalTab === "stdin" ? t.terminalActiveTab : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          <span>STDIN (input.txt)</span>
                          {fileCodes["input-txt"]?.trim() && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007acc]" />
                          )}
                        </button>
                      </div>

                      {/* Terminal Header Action Buttons */}
                      <div className="flex items-center gap-2 opacity-75">
                        <button
                          type="button"
                          onClick={handleClearTerminal}
                          title="Clear Terminal Output (Ctrl+L)"
                          className="p-1 rounded hover:bg-black/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTerminalHeight((prev) =>
                              prev > 360 ? 180 : prev < 240 ? 400 : 250
                            )
                          }
                          title="Toggle Panel Height (Small/Medium/Large)"
                          className="p-1 rounded hover:bg-black/10 cursor-pointer font-mono text-[10px]"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      <button
                        type="button"
                        onClick={() => setIsTerminalOpen(false)}
                        title="Close Panel"
                        className="p-1 rounded hover:bg-black/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Terminal Body Content */}
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                    {/* 1. REAL TERMINAL STREAM (VS CODE EMULATION) */}
                    {terminalTab === "terminal" && (
                      <div
                        className="h-full flex flex-col font-mono text-xs cursor-text space-y-1.5"
                        onClick={() => {
                          if (isInteracting) {
                            interactiveInputRef.current?.focus();
                          }
                        }}
                      >
                        {/* Terminal Stream History */}
                        <div className="space-y-1 leading-relaxed">
                          {terminalHistory.map((item) => {
                            if (item.type === "system") {
                              return (
                                <div key={item.id} className="opacity-60 text-[11px] select-none mb-1">
                                  {item.text}
                                </div>
                              );
                            }

                            if (item.type === "cmd") {
                              return (
                                <div key={item.id} className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
                                  <span className="text-[#007acc] text-xs font-bold select-none">●</span>
                                  <span className={`${t.terminalPromptText} font-semibold select-none`}>
                                    PS C:\sandbox-project&gt;
                                  </span>
                                  <span className={`${t.terminalCmdText} font-semibold`}>
                                    {item.text.replace(/^●\s*PS\s*C:\\sandbox-project>\s*/, "")}
                                  </span>
                                </div>
                              );
                            }

                            if (item.type === "interactive-line") {
                              return (
                                <div key={item.id} className="whitespace-pre-wrap font-mono">
                                  {item.text}
                                </div>
                              );
                            }

                            if (item.type === "output") {
                              return (
                                <div key={item.id} className="whitespace-pre-wrap font-mono py-0.5">
                                  {item.text}
                                </div>
                              );
                            }

                            if (item.type === "error") {
                              return (
                                <div key={item.id} className="text-[#f14c4c] whitespace-pre-wrap font-mono py-0.5">
                                  {item.text}
                                </div>
                              );
                            }

                            if (item.type === "idle") {
                              return (
                                <div key={item.id} className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
                                  <span className="opacity-60 text-xs font-bold select-none">◇</span>
                                  <span className={`${t.terminalPromptText} select-none`}>
                                    PS C:\sandbox-project&gt;
                                  </span>
                                  {!isInteracting && !isExecuting && !isLoading && (
                                    <span className="inline-block w-2 h-3.5 bg-current opacity-80 animate-pulse ml-0.5 align-middle" />
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div key={item.id} className="whitespace-pre-wrap font-mono">
                                {item.text}
                              </div>
                            );
                          })}

                          {/* ACTIVE INTERACTIVE PROMPT INPUT LINE (When code asks for input e.g. input("enter your name")) */}
                          {isInteracting && (
                            <div className="flex items-center flex-wrap pt-0.5 font-mono">
                              <span className="select-none">{currentPromptText}</span>
                              <input
                                ref={interactiveInputRef}
                                type="text"
                                value={inputLineValue}
                                onChange={(e) => setInputLineValue(e.target.value)}
                                onKeyDown={handleInteractiveKeyDown}
                                className="bg-transparent border-none outline-none focus:outline-none ring-0 focus:ring-0 p-0 m-0 font-mono text-xs flex-1 min-w-[60px] text-inherit caret-[#007acc] selection:bg-[#264f78]"
                                autoFocus
                                spellCheck={false}
                              />
                            </div>
                          )}

                          {/* Executing Spinner Indicator */}
                          {(isExecuting || isLoading) && (
                            <div className="text-amber-500 flex items-center gap-2 py-1 font-semibold text-xs font-mono">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Executing in sandbox...</span>
                            </div>
                          )}

                          {/* Scroll anchor */}
                          <div ref={terminalEndRef} />
                        </div>
                      </div>
                    )}

                    {/* 2. PROBLEMS TAB (COMPILER ERRORS) */}
                    {terminalTab === "problems" && (
                      <div className="space-y-3 font-sans text-xs">
                        {errorCount > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[#f14c4c] font-semibold text-xs">
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                {activeFile.languageName} ({activeFile.name}) — 1 error detected
                              </span>
                            </div>

                            <div className={`p-2.5 rounded border border-[#f14c4c]/30 font-mono text-xs text-[#f14c4c] space-y-1 ${t.cardBg}`}>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#f14c4c]" />
                                <strong>
                                  {diagnostic?.message ||
                                    result?.errorCategory ||
                                    result?.status?.description ||
                                    "Compilation Error"}
                                </strong>
                                {diagnostic?.lineNum && (
                                  <span className="opacity-60">
                                    [Ln {diagnostic.lineNum}, Col {diagnostic.colNum || 1}]
                                  </span>
                                )}
                              </div>
                            </div>

                            {diagnostic?.tip && (
                              <div className={`p-2.5 rounded border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2 ${t.cardBg}`}>
                                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                  <strong>Diagnostic Tip:</strong> {diagnostic.tip}
                                </div>
                              </div>
                            )}

                            <div className={`p-2.5 rounded border ${isDark ? "bg-[#1e1e1e] border-[#3c3c3c]" : "bg-[#ffffff] border-[#d4d4d4]"}`}>
                              <pre className="text-[#f14c4c] font-mono text-xs whitespace-pre-wrap">
                                {result?.compile_output || result?.stderr || result?.output}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center opacity-60">
                            <CheckCircle2 className="w-6 h-6 text-[#007acc] mx-auto mb-1" />
                            <p className="text-xs">No problems have been detected in the workspace.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. OUTPUT TAB */}
                    {terminalTab === "output" && (
                      <div className="space-y-2 font-mono text-xs">
                        <div className="opacity-60 text-[11px]">[PlaceMentor Sandbox Output Channel]</div>
                        <pre className="whitespace-pre-wrap">
                          {result?.output || "No output generated yet."}
                        </pre>
                      </div>
                    )}

                    {/* 4. DEBUG CONSOLE */}
                    {terminalTab === "debug" && (
                      <div className="opacity-60 text-xs font-mono space-y-1">
                        <p>&gt; Debugger attached to sandbox execution environment.</p>
                        <p>&gt; Memory sandbox limit: 256MB</p>
                        <p>&gt; Execution timeout limit: 15.0s</p>
                      </div>
                    )}

                    {/* 5. STDIN TAB (INPUT.TXT) */}
                    {terminalTab === "stdin" && (
                      <div className="space-y-2 font-sans text-xs">
                        <div className="flex items-center justify-between opacity-75">
                          <span>Standard Input passed into stdin for cin, Scanner, sys.stdin</span>
                          <span className="font-mono text-[11px] text-[#007acc] font-bold">
                            Syncs with input.txt
                          </span>
                        </div>
                        <textarea
                          value={fileCodes["input-txt"] || ""}
                          onChange={(e) =>
                            setFileCodes((prev) => ({ ...prev, "input-txt": e.target.value }))
                          }
                          placeholder="Type stdin values here (e.g. 10 20)..."
                          rows={5}
                          className={`w-full p-2.5 rounded border font-mono text-xs focus:outline-none focus:border-[#007acc] resize-y ${
                            isDark ? "bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc]" : "bg-[#ffffff] border-[#cccccc] text-[#111111]"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            </div>
          </div>

          {/* ================= 3. VS CODE ICONIC STATUS BAR ================= */}
          <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] font-sans select-none shrink-0">
            {/* Left Status Bar Items */}
            <div className="flex items-center gap-3">
              {/* Remote Sandbox Indicator */}
              <div className="flex items-center gap-1 bg-[#16825d] px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold">
                <span>&gt;&lt;</span>
                <span>sandbox</span>
              </div>

              {/* Git Branch */}
              <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded">
                <GitBranch className="w-3 h-3" />
                <span>main*</span>
              </div>

              {/* Error / Problems Counter */}
              <div
                onClick={() => {
                  setTerminalTab("problems");
                  setIsTerminalOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded"
              >
                <span className="flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3 text-[#ffcccc]" />
                  <span>{errorCount}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 text-[#fff2a8]" />
                  <span>0</span>
                </span>
              </div>
            </div>

            {/* Right Status Bar Items */}
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="hidden sm:inline">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span className="hidden md:inline">Spaces: 4</span>
              <span className="hidden lg:inline">UTF-8</span>
              <span className="hidden lg:inline">LF</span>
              {/* Clear active language chip in status bar */}
              <span
                onClick={() => setIsSidebarOpen(true)}
                className="font-bold px-1.5 py-0.5 rounded hover:bg-white/15 cursor-pointer bg-white/10"
              >
                &#123; &#125; {activeFile.languageName}
              </span>
              <span className="hidden sm:flex items-center gap-1 hover:bg-white/10 px-1 py-0.5 rounded cursor-pointer">
                <Check className="w-3 h-3" />
                Prettier
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hover:bg-white/15 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1"
                title="Toggle Fullscreen (F11)"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span className="hidden md:inline">
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default CodeEditor;
