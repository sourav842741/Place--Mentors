import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Swords, UserPlus } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { socket } from "../socket";
import { toast } from "sonner";
import { useCallback } from "react";

const NotificationPopup = ({ type = "challenge", data, onClose }) => {
  const { user } = useAuth();

  // ACCEPT HANDLER
  const handleAccept = useCallback(() => {
    if (type === "challenge" && user?._id && data?._id) {
      socket.emit("challenge:accept", {
        challengerId: data._id,
        challengedId: user._id,
      });

      toast.success("⚔️ Challenge accepted! Starting battle...");

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

  // REJECT HANDLER
  const handleReject = useCallback(() => {
    if (type === "challenge" && user?._id && data?._id) {
      socket.emit("challenge:reject", {
        challengerId: data._id,
        challengedId: user._id,
      });

      toast("Challenge dismissed");
    }

    if (type === "friend" && user?._id && data?._id) {
      socket.emit("friend:reject", {
        senderId: data._id,
        receiverId: user._id,
      });

      toast("Friend request dismissed");
    }

    onClose();
  }, [type, user, data, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-surface border border-border text-text shadow-card rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary-soft text-primary">
                {type === "challenge" ? <Swords className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </span>
              <h3 className="text-base font-bold text-text">
                {type === "challenge" ? "Battle Challenge" : "Friend Request"}
              </h3>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              className="h-8 w-8 p-0 rounded-lg hover:bg-danger-soft hover:text-danger text-text-subtle transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="text-center mb-6">
            {/* Avatar */}
            <div className="relative w-fit mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
              <img
                src={data?.avatar || data?.challenger?.avatar || "/default.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full mx-auto relative border-2 border-primary object-cover"
              />
            </div>

            {/* Name */}
            <p className="text-base font-bold text-text">
              {data?.fullName || data?.challenger?.fullName || "Candidate"}
            </p>

            {/* XP + Level */}
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-text-muted">
              <span>⭐ {data?.xp ?? data?.challenger?.xp ?? 0} XP</span>
              <span>•</span>
              <span>Level {data?.level ?? data?.challenger?.level ?? 1}</span>
            </div>

            {/* Message */}
            <p className="text-xs text-text-muted mt-2">
              {type === "challenge"
                ? "challenged you to a live code battle!"
                : "sent you a connection request!"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-border bg-surface-2 hover:bg-surface text-text font-medium h-10 cursor-pointer"
              onClick={handleReject}
            >
              Dismiss
            </Button>

            <Button
              className="flex-1 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-soft h-10 transition-transform active:scale-95 cursor-pointer"
              onClick={handleAccept}
            >
              {type === "challenge" ? "Accept Battle" : "Accept Request"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPopup;
