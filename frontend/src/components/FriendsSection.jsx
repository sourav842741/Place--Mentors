import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAcceptFriendRequest, useRejectFriendRequest } from '../hooks/useFriends';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { loadFriends } from '../redux/userSlice';
import { Users, User } from 'lucide-react';
import { toast } from 'sonner';

const FriendCard = ({
  friend,
  isRequest = false,
  onAccept,
  onReject,
  onChallenge,
  loading = false,
  challengeText = '⚔️ Challenge',
  disabledChallenge = false,
}) => {
  return (
    <Card className="w-full p-4 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={friend.avatar} />
          <AvatarFallback>{friend.fullName?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-sm">{friend.fullName}</h3>
          <p className="text-xs text-gray-500">XP: {friend.xp?.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {isRequest && (
          <>
            <Button
              size="sm"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={onAccept}
            >
              {loading ? 'Accepting...' : 'Accept'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              className="flex-1"
              onClick={onReject}
            >
              Reject
            </Button>
          </>
        )}

        {!isRequest && onChallenge && (
          <Button
            size="sm"
            disabled={loading || disabledChallenge}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={onChallenge}
          >
            {loading ? 'Sending...' : challengeText}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default function FriendsSection({ friendsData }) {
  const dispatch = useDispatch();

  const friends = friendsData?.friends || [];
  const friendRequests = friendsData?.friendRequests || {
    received: [],
    sent: [],
  };

  const [loadingId, setLoadingId] = useState(null);
  const [challengeLoadingId, setChallengeLoadingId] = useState(null);

  // 🔥 cooldown state
  const [cooldowns, setCooldowns] = useState({});

  const acceptFriend = useAcceptFriendRequest();
  const rejectFriend = useRejectFriendRequest();

  // 🔥 REFRESH SAFE TIMER
  useEffect(() => {
    const loadSavedCooldowns = () => {
      const active = {};

      friends.forEach((friend) => {
        const saved = localStorage.getItem(`challenge_${friend._id}`);

        if (saved) {
          const remaining = Math.floor((Number(saved) - Date.now()) / 1000);

          if (remaining > 0) {
            active[friend._id] = remaining;
          } else {
            localStorage.removeItem(`challenge_${friend._id}`);
          }
        }
      });

      setCooldowns(active);
    };

    loadSavedCooldowns();

    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((id) => {
          if (updated[id] > 1) {
            updated[id] -= 1;
          } else {
            delete updated[id];
            localStorage.removeItem(`challenge_${id}`);
          }
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [friends]);

  // SEND CHALLENGE
  const sendChallenge = useMutation({
    mutationFn: async (friendId) => {
      setChallengeLoadingId(friendId);
      return await api.post(`/api/friends/challenge/${friendId}`);
    },

    onSuccess: (_, friendId) => {
      toast.success('⚔️ Challenge sent!');
      setChallengeLoadingId(null);

      const expiresAt = Date.now() + 120000;

      localStorage.setItem(`challenge_${friendId}`, expiresAt.toString());

      setCooldowns((prev) => ({
        ...prev,
        [friendId]: 120,
      }));
    },

    onError: () => {
      toast.error('Failed to send challenge');
      setChallengeLoadingId(null);
    },
  });

  if (!friendsData) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="space-y-8 mt-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-500" />

        <div>
          <h2 className="text-lg font-semibold">Friends</h2>

          <p className="text-sm text-gray-500">
            {friends.length} friends • {friendRequests.received.length} requests
          </p>
        </div>
      </div>

      {/* FRIEND LIST */}
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => {
            const cooldown = cooldowns[friend._id] || 0;

            return (
              <FriendCard
                key={friend._id}
                friend={friend}
                loading={challengeLoadingId === friend._id}
                onChallenge={() => sendChallenge.mutate(friend._id)}
                disabledChallenge={cooldown > 0}
                challengeText={
                  cooldown > 0
                    ? `Wait ${Math.floor(cooldown / 60)}:${(cooldown % 60)
                        .toString()
                        .padStart(2, '0')}`
                    : '⚔️ Challenge'
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-400">No friends yet 😅</div>
      )}

      {/* REQUESTS */}
      {friendRequests.received.length > 0 && (
        <>
          <h3 className="flex items-center gap-2 font-semibold">
            <User /> Requests
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friendRequests.received.map((req) => (
              <FriendCard
                key={req._id}
                friend={req}
                isRequest
                loading={loadingId === req._id}
                onAccept={() => {
                  setLoadingId(req._id);

                  acceptFriend.mutate(req._id, {
                    onSuccess: () => {
                      toast.success('Friend accepted ✅');

                      dispatch(
                        loadFriends({
                          friends: [...friends, req],
                          friendRequests: {
                            ...friendRequests,
                            received: friendRequests.received.filter((r) => r._id !== req._id),
                          },
                        })
                      );

                      setLoadingId(null);
                    },

                    onError: () => {
                      toast.error('Failed to accept');
                      setLoadingId(null);
                    },
                  });
                }}
                onReject={() => {
                  setLoadingId(req._id);

                  rejectFriend.mutate(req._id, {
                    onSuccess: () => {
                      toast('Friend rejected');

                      dispatch(
                        loadFriends({
                          friends,
                          friendRequests: {
                            ...friendRequests,
                            received: friendRequests.received.filter((r) => r._id !== req._id),
                          },
                        })
                      );

                      setLoadingId(null);
                    },
                  });
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
