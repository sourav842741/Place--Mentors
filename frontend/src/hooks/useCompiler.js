import { useRunCodeMutation } from "../redux/compilerSlice";

const useCompiler = () => {
  const [runCode, { data, isLoading, error, isSuccess }] = useRunCodeMutation();

  const executeCode = async (code, language) => {
    try {
      const result = await runCode({ code, language }).unwrap();
      return result;
    } catch (err) {
      console.error("Code execution error:", err);
      throw err;
    }
  };

  return {
    executeCode,
    isLoading,
    error,
    isSuccess,
    result: data
  };
};

export default useCompiler;

