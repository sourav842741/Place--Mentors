import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Calendar,
  Shield,
  User,
  DollarSign,
  Star,
  Ban,
  Clock3,
  Mail,
} from "lucide-react";

import { formatDistanceToNow, format } from "date-fns";

const UserProfileModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  /* STATUS */
  const getStatusBadge = () => {
    if (user.isBanned) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          BANNED
        </Badge>
      );
    }

    if (user.isOnline) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          ACTIVE NOW
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className="dark:bg-gray-800 dark:text-gray-200"
      >
        OFFLINE
      </Badge>
    );
  };

  /* LAST SEEN */
  const getLastSeenText = () => {
    if (user.isOnline) return "Active now";
    if (!user.lastSeen) return "Never active";

    try {
      return `Last seen ${formatDistanceToNow(
        new Date(user.lastSeen),
        { addSuffix: true }
      )}`;
    } catch {
      return "Unknown";
    }
  };

  /* DATE */
  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Unknown";
    }
  };

  const initials = (user.fullName || user.name || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-[95vw] max-h-[92vh] overflow-y-auto p-0
        rounded-3xl border-0 shadow-2xl
        bg-white dark:bg-gray-950"
      >
        {/* HEADER */}
        <DialogHeader
          className="relative px-6 sm:px-8 py-8 border-b
          bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
          text-white"
        >
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            {/* AVATAR */}
            <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl font-bold bg-white text-indigo-700">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* INFO */}
            <div className="space-y-1">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">
                {user.fullName || user.name || "User"}
              </DialogTitle>

              <DialogDescription className="text-blue-100 text-sm sm:text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </DialogDescription>

              <div className="pt-2">{getStatusBadge()}</div>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={Shield}
              label="Role"
              value={user.role?.toUpperCase() || "USER"}
              color="from-emerald-500 to-teal-600"
            />

            <StatCard
              icon={Star}
              label="Level"
              value={`Lv ${user.level || 1}`}
              color="from-blue-500 to-indigo-600"
            />

            <StatCard
              icon={DollarSign}
              label="Credits"
              value={user.credits || 0}
              color="from-amber-500 to-orange-500"
            />
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={Calendar}
              title="Joined Date"
              value={formatDate(user.createdAt)}
            />

            <InfoCard
              icon={Clock3}
              title="Activity"
              value={getLastSeenText()}
            />
          </div>

          {/* BANNED BOX */}
          {user.isBanned && (
            <div
              className="rounded-2xl border border-red-200 dark:border-red-900
              bg-red-50 dark:bg-red-950/30 p-5"
            >
              <div className="flex gap-3">
                <Ban className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-300">
                    Currently Banned
                  </h3>

                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Reason: {user.banReason || "No reason provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BAN HISTORY */}
          {user.banHistory?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" />
                Ban History
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {user.banHistory.map((ban, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border p-4
                    bg-gray-50 dark:bg-gray-900
                    border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {ban.reason}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(ban.bannedAt)} •{" "}
                          {formatDistanceToNow(
                            new Date(ban.bannedAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>

                      <Badge className="bg-red-500 text-white w-fit">
                        BANNED
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Button
              variant="outline"
              className="rounded-xl h-11 dark:border-gray-700"
            >
              <User className="w-4 h-4 mr-2" />
              View Profile
            </Button>

            {!user.isBanned && (
              <Button
                variant="destructive"
                className="rounded-xl h-11"
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </Button>
            )}

            <Button
              variant="outline"
              className="rounded-xl h-11 dark:border-gray-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Adjust Credits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* STAT CARD */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800
      bg-white dark:bg-gray-900 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color}
          text-white flex items-center justify-center shadow-md`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </p>

          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* INFO CARD */
function InfoCard({ icon: Icon, title, value }) {
  return (
    <div
      className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800
      bg-gray-50 dark:bg-gray-900"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-indigo-600 mt-0.5" />

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="font-semibold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;