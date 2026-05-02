import api from './api';

export const askDoubtApi = (question) => api.post('/api/doubts/ask', { question });

export const getDoubtsApi = (page = 1) => api.get(`/api/doubts?page=${page}&limit=10`);

export const addReplyApi = (id, answer) => api.post(`/api/doubts/${id}/reply`, { answer });

export const getRepliesApi = (id) => api.get(`/api/doubts/${id}/replies`);
