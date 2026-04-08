import axios from "axios";
import { SERVER_URL } from "../config/api";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // ✅ only this needed
});

export default api;