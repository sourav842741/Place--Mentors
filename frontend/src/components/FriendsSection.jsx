import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "../hooks/useFriends";
import { loadFriends } from "../redux/userSlice";
import { Users, UserPlus, User } from "lucide-react";

//  FRIEND CARD (CLEAN UI)
const FriendCard = ({
  friend,
  isRequest = false,
  onAccept,
  onReject,
  onSend,
}) => {
  return (
    <Card className="w-full p-4 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300">

      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
          <AvatarImage src={friend.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
            {friend.fullName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {friend.fullName}
          </h3>

          <p className="text-xs text-gray-500">
            XP: {friend.xp?.toLocaleString()}
          </p>

          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              Lv {friend.level}
            </span>

            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              {friend.streakCount}🔥
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4">
        {isRequest && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600 text-xs"
              onClick={onAccept}
            >
              Accept
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        )}

        {!isRequest && onSend && (
          <Button
            size="sm"
            className="w-full text-xs bg-gradient-to-r from-blue-500 to-purple-500"
            onClick={onSend}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add Friend
          </Button>
        )}
      </div>
    </Card>
  );
};

//  MAIN COMPONENT
export default function FriendsSection() {
  const dispatch = useDispatch();
  const { friends, friendRequests } = useSelector((state) => state.user);

  const { data, isLoading } = useFriends();

  const sendFriendRequest = useSendFriendRequest();
  const acceptFriendRequest = useAcceptFriendRequest();
  const rejectFriendRequest = useRejectFriendRequest();

  useEffect(() => {
    if (data) {
      dispatch(loadFriends(data));
    }
  }, [data, dispatch]);

  if (isLoading) {
    return <div className="mt-10 text-center">Loading...</div>;
  }

  return (
    <div className="mt-10 space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold">Friends</h2>
          <p className="text-sm text-gray-500">
            {friends.length} friends • {friendRequests.received.length} requests
          </p>
        </div>
      </div>

      {/* FRIEND LIST */}
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend._id} friend={friend} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-6">
          No friends yet 😅
        </div>
      )}

      {/* REQUESTS */}
      {friendRequests.received.length > 0 && (
        <>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User /> Requests
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {friendRequests.received.map((req) => (
              <FriendCard
                key={req._id}
                friend={req}
                isRequest
                onAccept={() =>
                  acceptFriendRequest.mutate(req._id)
                }
                onReject={() =>
                  rejectFriendRequest.mutate(req._id)
                }
              />
            ))}
          </div>
        </>
      )}

      {/* SUGGESTED USERS */}
      {data?.suggestedUsers?.length > 0 && (
        <>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus /> Add Friends
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {data.suggestedUsers.map((user) => (
              <FriendCard
                key={user._id}
                friend={user}
                onSend={() =>
                  sendFriendRequest.mutate(user._id)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}