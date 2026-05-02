import { useRunCodeMutation } from '../redux/compilerSlice';
import { useState } from 'react';

const useCompiler = () => {
  const [runCode, { isLoading, error }] = useRunCodeMutation();
  const [result, setResult] = useState(null);

  const executeCode = async (code, language, input = '') => {
    try {
      const res = await runCode({
        code,
        language,
        input,
      }).unwrap();

      setResult(res);
      return res;
    } catch (err) {
      console.error('Code execution error:', err);
      setResult({ error: 'Execution failed' });
    }
  };

  return {
    executeCode,
    isLoading,
    error,
    result,
  };
};

export default useCompiler;
