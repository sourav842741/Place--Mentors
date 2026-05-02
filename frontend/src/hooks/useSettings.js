import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export default function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/public-settings");
      return data;
    },

    staleTime: 5 * 60 * 1000, // 5 min fresh
    gcTime: 10 * 60 * 1000,

    retry: 1,

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
