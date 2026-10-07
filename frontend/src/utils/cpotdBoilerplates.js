/**
 * Clean CPOTD Boilerplate & Driver Wrapper
 *
 * 1. getUserEditorBoilerplate: Returns ONLY the clean solution function skeleton (LeetCode style).
 *    No clutter, no fs.readFileSync, no main(). Just the clean function!
 *
 * 2. wrapCodeWithDriver: Behind the scenes, wraps user's code with the stdin parser
 *    and runner before sending to Judge0 / Compiler.
 */

// Convert problem title to camelCase: "Two Sum" -> "twoSum"
export const getFunctionName = (title = "") => {
  if (!title) return "solution";
  const cleaned = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "solution";
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
};

// Convert camelCase to snake_case for Python: "twoSum" -> "two_sum"
export const toSnakeCase = (str = "") => {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
};

// Extract parameter names from question input format or sample test cases
export const extractParams = (question) => {
  if (!question) return ["input"];

  const sample = question.sampleTestCases?.[0]?.input || "";
  const format = question.inputFormat || "";

  // 1. Look for `varName = ` pattern, e.g. "nums = [2,7,11,15], target = 9"
  const sampleMatches = [...sample.matchAll(/([a-zA-Z_]\w*)\s*=/g)].map((m) => m[1]);
  if (sampleMatches.length > 0) {
    return [...new Set(sampleMatches)];
  }

  const formatMatches = [...format.matchAll(/([a-zA-Z_]\w*)\s*=/g)].map((m) => m[1]);
  if (formatMatches.length > 0) {
    return [...new Set(formatMatches)];
  }

  // Fallbacks
  const text = (sample + " " + format).toLowerCase();
  if (text.includes("nums") && text.includes("target")) return ["nums", "target"];
  if (text.includes("grid")) return ["grid"];
  if (text.includes("matrix")) return ["matrix"];
  if (text.includes("nums")) return ["nums"];
  if (text.includes("array") || text.includes("arr")) return ["arr"];
  if (text.includes("string") || text.includes("str")) return ["s"];

  return ["input"];
};

// -------------------------------------------------------------------
// 1. WHAT THE USER SEES IN THE EDITOR (Clean LeetCode Style)
// -------------------------------------------------------------------
export const getQuestionBoilerplate = (question, language = "javascript") => {
  if (!question) {
    return "// Select a problem to begin";
  }

  if (question.starterCode && question.starterCode[language]) {
    return question.starterCode[language];
  }

  const title = question.title || "Problem";
  const titleLower = title.toLowerCase();
  const inputFormat = question.inputFormat || "";
  const outputFormat = question.outputFormat || "";
  const fnName = getFunctionName(title);
  const pyFnName = toSnakeCase(fnName);
  const params = extractParams(question);
  const paramList = params.join(", ");
  const lang = (language || "javascript").toLowerCase();

  // JavaScript: Clean function only
  if (lang === "javascript") {
    return `/**
 * Problem: ${title}
 * Input: ${inputFormat}
 * Output: ${outputFormat}
 *
${params.map((p) => ` * @param {any} ${p}`).join("\n")}
 * @return {any}
 */
function ${fnName}(${paramList}) {
    // ✍️ Write your solution logic here
    
}`;
  }

  // Python 3: Clean def only
  if (lang === "python" || lang === "python3") {
    return `"""
Problem: ${title}
Input: ${inputFormat}
Output: ${outputFormat}
"""
def ${pyFnName}(${paramList}):
    # ✍️ Write your solution logic here
    pass
`;
  }

  // C++17: Clean Solution class
  if (lang === "c++" || lang === "cpp") {
    if (titleLower.includes("two sum")) {
      return `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // ✍️ Write your solution logic here
        
    }
};`;
    }

    if (titleLower.includes("island")) {
      return `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int numIslands(vector<vector<int>>& grid) {
        // ✍️ Write your solution logic here
        
    }
};`;
    }

    return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    // ✍️ Write your solution logic here
    
};`;
  }

  // Java 17: Clean Solution class
  if (titleLower.includes("two sum")) {
    return `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // ✍️ Write your solution logic here
        return new int[0];
    }
}`;
  }

  if (titleLower.includes("island")) {
    return `import java.util.*;

class Solution {
    public int numIslands(int[][] grid) {
        // ✍️ Write your solution logic here
        return 0;
    }
}`;
  }

  return `import java.util.*;

class Solution {
    // ✍️ Write your solution logic here
    
}`;
};

// -------------------------------------------------------------------
// 2. BEHIND-THE-SCENES DRIVER WRAPPER (Invisible to the user)
// -------------------------------------------------------------------
export const wrapCodeWithDriver = (userCode = "", question, language = "javascript") => {
  if (!userCode || !userCode.trim()) return userCode;

  const lang = (language || "javascript").toLowerCase();
  const title = question?.title || "Problem";
  const titleLower = title.toLowerCase();
  const fnName = getFunctionName(title);
  const pyFnName = toSnakeCase(fnName);
  const params = extractParams(question);

  // If user wrote their own complete script with stdin / main, do not wrap
  if (
    userCode.includes("fs.readFileSync") ||
    userCode.includes("process.stdin") ||
    userCode.includes("sys.stdin") ||
    userCode.includes("int main") ||
    userCode.includes("public static void main")
  ) {
    return userCode;
  }

  // =================================================================
  // JS WRAPPER (Appends input parser & invocation to user code)
  // =================================================================
  if (lang === "javascript") {
    const argsPassing = params
      .map((p) => `parsed['${p}'] !== undefined ? parsed['${p}'] : parsed.input`)
      .join(", ");

    return `${userCode}

// --- HIDDEN RUNTIME HARNESS ---
const fs = require('fs');
function _parseInput(raw) {
    if (!raw || !raw.trim()) return {};
    const text = raw.trim();
    const result = {};
    const regex = /([a-zA-Z_]\\w*)\\s*=\\s*(\\[[^\\]]*\\]|\\{[^\\}]*\\}|"[^"]*"|'[^']*'|-?\\d+(?:\\.\\d+)?|true|false|[^\\n,]+)/g;
    let match;
    let hasMatches = false;
    while ((match = regex.exec(text)) !== null) {
        hasMatches = true;
        const key = match[1];
        let valStr = match[2].trim();
        try {
            result[key] = JSON.parse(valStr.replace(/'/g, '"'));
        } catch {
            result[key] = isNaN(valStr) ? valStr : Number(valStr);
        }
    }
    if (hasMatches) return result;
    try {
        return { input: JSON.parse(text) };
    } catch {
        return { input: text };
    }
}

try {
    const raw = fs.readFileSync(0, 'utf-8');
    const parsed = _parseInput(raw);
    const fn = typeof ${fnName} === 'function' ? ${fnName} : (typeof solution === 'function' ? solution : null);
    if (!fn) throw new Error("Function '${fnName}' not found");
    const result = fn(${argsPassing});
    if (result !== undefined) {
        console.log(typeof result === 'object' ? JSON.stringify(result) : result);
    }
} catch (err) {
    console.error("Execution Error:", err.message);
}`;
  }

  // =================================================================
  // PYTHON 3 WRAPPER
  // =================================================================
  if (lang === "python" || lang === "python3") {
    const pyArgsFetch = params
      .map((p) => `_${p} = _parsed.get("${p}", _parsed.get("input"))`)
      .join("\n    ");
    const pyArgsList = params.map((p) => `_${p}`).join(", ");

    return `${userCode}

# --- HIDDEN RUNTIME HARNESS ---
import sys
import json
import re

def _parse_input(raw):
    raw = raw.strip()
    if not raw:
        return {}
    parsed = {}
    pattern = r'([a-zA-Z_]\\w*)\\s*=\\s*(\\[[^\\]]*\\]|\\{[^\\}]*\\}|"[^"]*"|\\\'[^\\\']*\\\'|-?\\d+(?:\\.\\d+)?|True|False|[^\\n,]+)'
    for key, val_str in re.findall(pattern, raw):
        val_str = val_str.strip()
        try:
            val_clean = val_str.replace("True", "true").replace("False", "false")
            parsed[key] = json.loads(val_clean)
        except Exception:
            try:
                parsed[key] = int(val_str) if val_str.isdigit() else float(val_str)
            except Exception:
                parsed[key] = val_str
    if parsed:
        return parsed
    try:
        return {"input": json.loads(raw)}
    except Exception:
        return {"input": raw}

try:
    _raw = sys.stdin.read()
    _parsed = _parse_input(_raw)
    ${pyArgsFetch}
    _fn = locals().get('${pyFnName}') or locals().get('solution')
    if not _fn:
        raise Exception("Function '${pyFnName}' not found")
    _res = _fn(${pyArgsList})
    if _res is not None:
        if isinstance(_res, (list, dict, tuple)):
            print(json.dumps(_res, separators=(',', ':')))
        else:
            print(_res)
except Exception as _e:
    sys.stderr.write(f"Execution Error: {_e}\\n")`;
  }

  // =================================================================
  // C++17 WRAPPER
  // =================================================================
  if (lang === "c++" || lang === "cpp") {
    if (titleLower.includes("two sum")) {
      return `${userCode}

#include <sstream>
#include <regex>

vector<int> _parseArray(const string& str) {
    vector<int> res;
    stringstream ss(str);
    char ch;
    int num;
    while (ss >> ch) {
        if (isdigit(ch) || ch == '-') {
            ss.putback(ch);
            if (ss >> num) res.push_back(num);
        }
    }
    return res;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string fullInput, line;
    while (getline(cin, line)) fullInput += line + "\\n";
    if (fullInput.empty()) return 0;

    Solution sol;
    smatch match;
    regex arrRegex(R"(\\[([0-9,\\s-]+)\\])");
    regex numRegex(R"(target\\s*=\\s*(-?\\d+))");

    vector<int> nums;
    if (regex_search(fullInput, match, arrRegex)) nums = _parseArray(match[0].str());
    int target = 0;
    if (regex_search(fullInput, match, numRegex)) target = stoi(match[1].str());

    auto res = sol.twoSum(nums, target);
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i + 1 < res.size() ? "," : "");
    cout << "]" << endl;
    return 0;
}`;
    }

    if (titleLower.includes("island")) {
      return `${userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string fullInput, line;
    while (getline(cin, line)) fullInput += line + "\\n";

    vector<vector<int>> grid;
    vector<int> currRow;
    bool inRow = false;
    int num = 0;
    bool hasNum = false;

    for (size_t i = 0; i < fullInput.size(); i++) {
        char ch = fullInput[i];
        if (ch == '[') {
            if (i > 0 && fullInput[i - 1] == '[') {}
            else { inRow = true; currRow.clear(); }
        } else if (isdigit(ch)) {
            num = ch - '0';
            hasNum = true;
        } else if (ch == ',' || ch == ']') {
            if (hasNum) { currRow.push_back(num); hasNum = false; }
            if (ch == ']' && inRow) { grid.push_back(currRow); inRow = false; }
        }
    }

    Solution sol;
    cout << sol.numIslands(grid) << endl;
    return 0;
}`;
    }

    return userCode;
  }

  // =================================================================
  // JAVA 17 WRAPPER
  // =================================================================
  if (lang === "java") {
    if (titleLower.includes("two sum")) {
      return `${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (sc.hasNextLine()) sb.append(sc.nextLine()).append("\\n");
        String input = sb.toString().trim();
        if (input.isEmpty()) return;

        Solution sol = new Solution();
        java.util.regex.Pattern arrPat = java.util.regex.Pattern.compile("\\[([0-9,\\\\s-]+)\\]");
        java.util.regex.Matcher arrMat = arrPat.matcher(input);
        List<Integer> list = new ArrayList<>();
        if (arrMat.find()) {
            String[] parts = arrMat.group(1).split(",");
            for (String p : parts) {
                if (!p.trim().isEmpty()) list.add(Integer.parseInt(p.trim()));
            }
        }
        int[] nums = list.stream().mapToInt(i -> i).toArray();

        java.util.regex.Pattern targetPat = java.util.regex.Pattern.compile("target\\\\s*=\\\\s*(-?\\\\d+)");
        java.util.regex.Matcher targetMat = targetPat.matcher(input);
        int target = 0;
        if (targetMat.find()) target = Integer.parseInt(targetMat.group(1));

        int[] res = sol.twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < res.length; i++) System.out.print(res[i] + (i + 1 < res.length ? "," : ""));
        System.out.println("]");
    }
}`;
    }

    if (titleLower.includes("island")) {
      return `${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (sc.hasNextLine()) sb.append(sc.nextLine()).append("\\n");
        String input = sb.toString().trim();
        if (input.isEmpty()) return;

        List<List<Integer>> rowsList = new ArrayList<>();
        java.util.regex.Pattern rowPat = java.util.regex.Pattern.compile("\\[([0-9,\\\\s]+)\\]");
        java.util.regex.Matcher rowMat = rowPat.matcher(input);
        while (rowMat.find()) {
            String[] parts = rowMat.group(1).split(",");
            List<Integer> row = new ArrayList<>();
            for (String n : parts) {
                if (!n.trim().isEmpty()) row.add(Integer.parseInt(n.trim()));
            }
            if (!row.isEmpty()) rowsList.add(row);
        }

        if (rowsList.isEmpty()) { System.out.println(0); return; }

        int[][] grid = new int[rowsList.size()][rowsList.get(0).size()];
        for (int i = 0; i < rowsList.size(); i++) {
            for (int j = 0; j < rowsList.get(i).size(); j++) {
                grid[i][j] = rowsList.get(i).get(j);
            }
        }

        Solution sol = new Solution();
        System.out.println(sol.numIslands(grid));
    }
}`;
    }

    return userCode;
  }

  return userCode;
};

// -------------------------------------------------------------------
// 3. HUMAN-FRIENDLY SPECIFICATION & EXAMPLES PARSERS
// -------------------------------------------------------------------
export const parseFormatDetails = (inputFormat = "", outputFormat = "", question = null) => {
  const title = (question?.title || "").toLowerCase();
  const params = [];

  // Specialized known problems
  if (title.includes("two sum")) {
    return {
      params: [
        { name: "nums", type: "int[]", desc: "Array of integers" },
        { name: "target", type: "int", desc: "Target sum integer" },
      ],
      returnType: "int[]",
      returnDesc: "Indices [i, j] of the two numbers that add up to target",
    };
  }

  if (title.includes("island")) {
    return {
      params: [
        { name: "grid", type: "int[][]", desc: "2D binary grid (1s for land, 0s for water)" },
      ],
      returnType: "int",
      returnDesc: "Count of connected islands",
    };
  }

  // Generic dynamic parser for ANY question
  const regex = /([a-zA-Z_]\w*)\s*=\s*([^,]+)/g;
  let match;
  while ((match = regex.exec(inputFormat)) !== null) {
    const name = match[1].trim();
    const rawType = match[2].trim();
    let friendlyType = rawType;
    let desc = "";

    const lower = rawType.toLowerCase();
    if (lower.includes("int array") || lower.includes("array of int")) {
      friendlyType = "int[]";
      desc = "Array of integers";
    } else if (lower.includes("2d array") || lower.includes("grid") || lower.includes("matrix")) {
      friendlyType = "int[][]";
      desc = "2D matrix / grid";
    } else if (lower.includes("string") || lower.includes("str")) {
      friendlyType = "string";
      desc = "Input string";
    } else if (lower.includes("int") || lower.includes("number")) {
      friendlyType = "int";
      desc = "Integer number";
    } else {
      friendlyType = rawType;
      desc = "Input parameter";
    }

    params.push({ name, type: friendlyType, desc });
  }

  if (params.length === 0) {
    params.push({
      name: "input",
      type: "any",
      desc: inputFormat || "Input data",
    });
  }

  let returnType = "any";
  let returnDesc = outputFormat || "Computed result";
  const outLower = (outputFormat || "").toLowerCase();
  if (outLower.includes("return indices") || outLower.includes("[i, j]") || outLower.includes("array")) {
    returnType = "int[]";
    returnDesc = "Array of indices [i, j]";
  } else if (outLower.includes("return integer") || outLower.includes("count") || outLower.includes("int")) {
    returnType = "int";
    returnDesc = "Computed integer result";
  } else if (outLower.includes("boolean") || outLower.includes("true")) {
    returnType = "boolean";
    returnDesc = "Boolean result (true / false)";
  }

  return { params, returnType, returnDesc };
};

export const getConstraintList = (constraintsStr = "") => {
  if (!constraintsStr) return ["Standard problem constraints apply."];
  const split = constraintsStr
    .split(/[\n,;]|•/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "•");

  return split.length > 0 ? split : [constraintsStr.trim()];
};

export const getFormattedExamples = (question) => {
  if (!question) return [];

  const title = (question.title || "").toLowerCase();
  const samples = question.sampleTestCases || [];
  const hidden = question.hiddenTestCases || [];

  // Pool all test cases, prioritizing sample cases
  const allCases = [...samples, ...(samples.length < 2 ? hidden.slice(0, 2 - samples.length) : [])];

  return allCases.map((tc, idx) => {
    let explanation = "";
    if (idx === 0 && question.solutionExplanation) {
      explanation = question.solutionExplanation;
    }

    if (title.includes("two sum") && idx === 0) {
      explanation = "Because nums[0] + nums[1] == 9, we return indices [0, 1].";
    } else if (title.includes("island") && idx === 0) {
      explanation = "Connected 1s vertically or horizontally form 2 distinct land masses.";
    }

    return {
      input: tc.input || "",
      expectedOutput: tc.expectedOutput || "",
      explanation,
    };
  });
};

