import api from "../services/api";

const useInterview = () => {
  //  Generate Questions (START INTERVIEW)
  const generateQuestions = async (data) => {
    try {
      const res = await api.post("/api/interview/generate-questions", data);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  //  Submit Answer
  const submitAnswer = async (data) => {
    try {
      const res = await api.post("/api/interview/submit-answer", data);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  //  Finish Interview
  const finishInterview = async (interviewId) => {
    try {
      const res = await api.post("/api/interview/finish", { interviewId });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  //  Get Report
  const getReport = async (id) => {
    try {
      const res = await api.get(`/api/interview/report/${id}`);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  return {
    generateQuestions,
    submitAnswer,
    finishInterview,
    getReport,
  };
};

export default useInterview;
