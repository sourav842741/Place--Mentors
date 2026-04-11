import axios from "axios";
import { SERVER_URL } from "../config/api";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, 
});

export default api;

// POTD APIs
export const getPotdStatus = () => api.get('/api/potd/status');
export const completePotd = () => api.post('/api/potd/complete');

export const getCpotdStatus = () => api.get('/api/cpotd/status');
export const completeCpotd = () => api.post('/api/cpotd/complete');


