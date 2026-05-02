import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ================= DASHBOARD =================
export const useMaintenanceDashboard = () => {
  return useQuery({
    queryKey: ['maintenance-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/maintenance/dashboard');
      return res.data.data || {};
    },
    staleTime: 30 * 1000,
  });
};

// ================= RANDOM QUESTION =================
export const useRandomQuestion = (type) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['maintenance-random', type],
    queryFn: async () => {
      const res = await api.get(`/api/maintenance/random/${type}`);
      return res.data.data || null;
    },
    enabled: !!type,
    staleTime: 0,
  });
};

// ================= ALL TYPES =================
export const useAllTypes = () => {
  return useQuery({
    queryKey: ['maintenance-types'],
    queryFn: async () => {
      const res = await api.get('/api/maintenance/all-types');
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ================= REFRESH QUESTION =================
export const useRefreshQuestion = (type) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ['maintenance-random', type],
    });
  };
};

// ================= PREFETCH =================
export const prefetchDashboard = (queryClient) => {
  queryClient.prefetchQuery({
    queryKey: ['maintenance-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/maintenance/dashboard');
      return res.data.data || {};
    },
  });
};
