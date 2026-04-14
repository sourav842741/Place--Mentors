import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ============================
//  GET FRIENDS
// ============================
export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/friends');

        //  never undefined
        return res.data?.data || {
          friends: [],
          friendRequests: {
            received: [],
            sent: []
          },
          suggestedUsers: []
        };

      } catch (err) {
        console.log("Friends Fetch Error:", err);

        //  fallback (IMPORTANT)
        return {
          friends: [],
          friendRequests: {
            received: [],
            sent: []
          },
          suggestedUsers: []
        };
      }
    },
  });
};

// ============================
//  SEND REQUEST
// ============================
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId) => {
      try {
        const res = await api.post(`/api/friends/send/${friendId}`);
        return res.data;
      } catch (err) {
        console.log("Send Request Error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      //  refresh both
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['discoverUsers'] });
    },
  });
};

// ============================
//  ACCEPT REQUEST
// ============================
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId) => {
      try {
        const res = await api.post(`/api/friends/accept/${requesterId}`);
        return res.data;
      } catch (err) {
        console.log("Accept Error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

// ============================
//  REJECT REQUEST
// ============================
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId) => {
      try {
        const res = await api.post(`/api/friends/reject/${requesterId}`);
        return res.data;
      } catch (err) {
        console.log("Reject Error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};