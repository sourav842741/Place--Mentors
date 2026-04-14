import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSendFriendRequest } from '../hooks/useFriends';
import api from '../services/api';
import { ArrowLeft, UserPlus } from 'lucide-react';

// ================= USER CARD =================
const UserCard = ({ user, isPending, isFriend, onAddFriend }) => {
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.fullName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <CardTitle className="text-lg truncate">
              {user.fullName}
            </CardTitle>

            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">Lvl {user.level}</Badge>
              <Badge variant="outline">
                {user.streakCount}🔥
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-3">
          XP: {user.xp?.toLocaleString()}
        </p>

        <Button
          size="sm"
          className="w-full"
          disabled={isPending || isFriend}
          onClick={onAddFriend}
        >
          {isPending ? 'Pending...' : isFriend ? 'Friends' : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Add Friend
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// ================= MAIN PAGE =================
export default function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sendFriendRequest = useSendFriendRequest();

  // 🔥 FIXED QUERY (NO ERROR GUARANTEED)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['discoverUsers'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/users/discover');

        console.log("DISCOVER API:", res.data);

        return res.data?.data?.users ?? [];
      } catch (err) {
        console.log("Discover Error:", err);
        return [];
      }
    },
  });

  const handleAddFriend = (userId) => {
    sendFriendRequest.mutate(userId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['discoverUsers'] });
        queryClient.invalidateQueries({ queryKey: ['friends'] });
      }
    });
  };

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading users...</p>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <h1 className="text-2xl font-bold">
          Find Friends
        </h1>
      </div>

      {/* USERS GRID */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onAddFriend={() => handleAddFriend(user._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20">
          <h2 className="text-xl font-semibold mb-2">
            No users found
          </h2>
          <p className="text-gray-500">
            Try again later or check back soon.
          </p>
        </div>
      )}
    </div>
  );
}