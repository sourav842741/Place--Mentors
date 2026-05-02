import api from './api.js';

export const chatWithAI = (data) => api.post('/api/support/ai-chat', data);
export const escalateTicket = (formData) =>
  api.post('/api/support/escalate-ticket', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
