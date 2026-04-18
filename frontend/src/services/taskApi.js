import api from "./api.js";

// Task CRUD operations
export const createTask = (taskData) => api.post("/api/tasks/create", taskData);
export const getMyTasks = () => api.get("/api/tasks/my");
export const updateTask = (id, taskData) => api.put(`/api/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const toggleTask = (id) => api.patch(`/api/tasks/${id}/toggle`);
export const shareTask = (id) => api.post(`/api/tasks/${id}/share`);
export const getPublicTask = (shareId) => api.get(`/api/tasks/public/${shareId}`);
export const getTaskStats = () => api.get("/api/dashboard/task-stats");

// Re-export api for convenience
export default api;

