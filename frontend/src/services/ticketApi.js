import api from "./api.js";

// User APIs
export const createTicket = (formData) => api.post("/api/tickets", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const getMyTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/tickets/my?${query}`);
};

export const getTicketDetail = (id) => api.get(`/api/tickets/${id}`);
export const replyToTicket = (id, data) => api.post(`/api/tickets/${id}/reply`, data);
export const reopenTicket = (id) => api.patch(`/api/tickets/${id}/reopen`);

// Admin APIs
export const getAllTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/tickets/admin/all?${query}`);
};

export const getTicketStats = () => api.get("/api/tickets/admin/stats");
export const updateTicketStatus = (id, status) =>
  api.patch(`/api/tickets/admin/${id}/status`, {
    status,
  });

export const deleteTicket = (id) => api.delete(`/api/tickets/admin/${id}`);

export default api;

