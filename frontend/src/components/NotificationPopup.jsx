import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { socket } from "../socket";
import { toast } from "sonner";
import { useCallback } from "react";

const NotificationPopup = ({ type = "challenge", data, onClose }) => {
  const { user } = useAuth();

  //  ACCEPT HANDLER (UNCHANGED + SAFE)
  const handleAccept = useCallback(() => {
    if (type === "challenge" && user?._id && data?._id) {
      socket.emit("challenge:accept", {
        challengerId: data._id,
        challengedId: user._id,
      });

      toast.success("⚔️ Challenge accepted! Starting battle...");

      // delay so battle:start aa sake
      setTimeout(() => {
        onClose();
      }, 1500);
    }

    if (type === "friend" && user?._id && data?._id) {
      socket.emit("friend:accept", {
        senderId: data._id,
        receiverId: user._id,
      });

      toast.success("Friend request accepted!");
      onClose();
    }
  }, [type, user, data, onClose]);

  //  NEW: REJECT HANDLER
  const handleReject = useCallback(() => {
    if (type === "challenge" && user?._id && data?._id) {
      socket.emit("challenge:reject", {
        challengerId: data._id,
        challengedId: user._id,
      });

      toast(" Challenge dismissed");
    }

    if (type === "friend" && user?._id && data?._id) {
      socket.emit("friend:reject", {
        senderId: data._id,
        receiverId: user._id,
      });

      toast(" Friend request dismissed");
    }

    onClose();
  }, [type, user, data, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl transform transition-all duration-300 scale-100 animate-popup">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-wide">
              {type === "challenge" ? "⚔️ Battle Challenge" : "👋 Friend Request"}
            </h3>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 transition"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="text-center mb-6">
            {/* Avatar with glow */}
            <div className="relative w-fit mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 blur-md opacity-60 animate-pulse"></div>

              <img
                src={data?.avatar || data?.challenger?.avatar || "/default.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full mx-auto relative border-2 border-white dark:border-gray-800"
              />
            </div>

            {/* Name */}
            <p className="text-lg font-semibold">
              {data?.fullName || data?.challenger?.fullName || "Unknown"}
            </p>

            {/* XP + Level */}
            <p className="text-sm text-gray-500">
              XP: {data?.xp ?? data?.challenger?.xp ?? 0} | Level:{" "}
              {data?.level ?? data?.challenger?.level ?? 1}
            </p>

            {/* Message */}
            <p className="text-sm text-gray-500 mt-1">
              {type === "challenge"
                ? "challenged you to code battle!"
                : "sent you a friend request!"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform duration-200 shadow-md"
              onClick={handleAccept}
            >
              {type === "challenge" ? "Accept Battle" : "Accept Friend"}
            </Button>

            <Button
              variant="outline"
              className="flex-1 hover:scale-105 transition-transform duration-200"
              onClick={handleReject}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPopup;
