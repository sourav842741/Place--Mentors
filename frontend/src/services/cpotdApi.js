
import api from "./api";

export const fetchCpotdApi = async () => {
  const res = await api.get("/api/cpotd");
  return res.data;
};

export const submitCpotdApi = async (data) => {
  const res = await api.post("/api/cpotd/submit", data);
  return res.data;
};