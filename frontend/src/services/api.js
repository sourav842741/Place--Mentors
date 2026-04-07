import axios from "axios";
import { SERVER_URL } from "../config/api";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

// ✅ Add interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;