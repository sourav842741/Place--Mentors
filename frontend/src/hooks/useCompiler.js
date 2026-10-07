import { useRunCodeMutation } from "../redux/compilerSlice";
import { useState } from "react";

const useCompiler = () => {
  const [runCode, { isLoading, error }] = useRunCodeMutation();
  const [result, setResult] = useState(null);

  const executeCode = async (code, language, input = "") => {
    try {
      const res = await runCode({
        code,
        language,
        input,
      }).unwrap();

      setResult(res);
      return res;
    } catch (err) {
      console.error("Code execution error:", err);
      const errResponse = {
        success: false,
        hasError: true,
        errorCategory: "Execution Failed",
        status: { id: -1, description: "Execution Error" },
        output: err?.data?.message || err?.data?.error || err?.message || "Execution request failed",
        stderr: err?.data?.error || err?.message || "",
        compile_output: "",
        stdout: "",
        time: "0.00s",
        memory: "N/A",
      };
      setResult(errResponse);
      return errResponse;
    }
  };

  const clearResult = () => setResult(null);

  return {
    executeCode,
    clearResult,
    isLoading,
    error,
    result,
    setResult,
  };
};

export default useCompiler;
