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

// Streak APIs
export const getStreak = () => api.get('/api/dashboard/streak');

// Email APIs
export const getEmailStats = () => api.get('/api/admin/email/stats');
export const getEmailLogs = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/admin/email/logs?${query}`);
};
export const sendSingleEmail = (data) => api.post('/api/admin/email/send-single', data);
export const sendBulkEmail = (data) => api.post('/api/admin/email/send-bulk', data);
export const testTemplate = (data) => api.post('/api/admin/email/test-template', data);

// ========== BAN/UNBAN USERS ==========
export const banUser = (userId, banReason) => api.patch(`/api/admin/users/${userId}/ban`, { banReason });
export const unbanUser = (userId) => api.patch(`/api/admin/users/${userId}/unban`);
