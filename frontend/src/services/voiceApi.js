import api from './api.js';

// Voice call APIs
export const startVoiceCall = (data) => api.post('/api/voice/start-call', data);
export const getVoiceHistory = () => api.get('/api/voice/history');
export const getVoiceReport = (callId) => api.get(`/api/voice/report/${callId}`);
export const updateVoiceStatus = (data) => api.post('/api/voice/status', data);

// Export default for convenience
export default {
  startVoiceCall,
  getVoiceHistory,
  getVoiceReport,
  updateVoiceStatus,
};
