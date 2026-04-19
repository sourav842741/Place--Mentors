import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get(
        '/api/admin/public-settings'
      );
      return data;
    },
    staleTime: 30000,
    refetchInterval: 5000,
  });
}