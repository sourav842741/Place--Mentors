import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../services/api";
import { toast } from "sonner";

export default function useAdminSettings() {
  const queryClient =
    useQueryClient();

  /* ===========================
     GET ADMIN SETTINGS
  =========================== */
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "adminSettings",
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          "/api/admin/settings"
        );

      return data;
    },

    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* ===========================
     UPDATE SETTINGS
  =========================== */
  const updateMutation =
    useMutation({
      mutationFn: async (
        updates
      ) => {
        const { data } =
          await api.put(
            "/api/admin/settings",
            updates
          );

        return data;
      },

      onSuccess: (
        response
      ) => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "adminSettings",
            ],
          }
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "settings",
            ],
          }
        );

        toast.success(
          response?.message ||
            "Settings updated successfully!"
        );
      },

      onError: (
        error
      ) => {
        toast.error(
          error?.response
            ?.data?.message ||
            "Update failed"
        );
      },
    });

  /* ===========================
     RETURN
  =========================== */
  return {
    settings:
      settings?.data || {},

    isLoading,

    isError,

    error,

    refetch,

    updateSettings:
      updateMutation.mutate,

    updateSettingsAsync:
      updateMutation.mutateAsync,

    isUpdating:
      updateMutation.isPending,
  };
}