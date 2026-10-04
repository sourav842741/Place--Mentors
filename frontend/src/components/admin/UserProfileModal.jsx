import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Calendar,
  Shield,
  User,
  DollarSign,
  Star,
  Ban,
  Clock3,
  Mail,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";

import { formatDistanceToNow, format } from "date-fns";
import { adjustUserCredits } from "../../redux/adminUserSlice";
import { toast } from "sonner";

const UserProfileModal = ({ user, isOpen, onClose }) => {
  const dispatch = useDispatch();

  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  if (!user) return null;

  /* STATUS */
  const getStatusBadge = () => {
    return user.isBanned ? (
      <Badge className="bg-red-500 text-white">BANNED</Badge>
    ) : (
      <Badge className="bg-green-600 text-white">ACTIVE</Badge>
    );
  };

  /* LAST SEEN */
  const getLastSeenText = () => {
    if (user.isOnline) return "Active now";
    if (!user.lastSeen) return "Never active";

    try {
      return `Last seen ${formatDistanceToNow(new Date(user.lastSeen), {
        addSuffix: true,
      })}`;
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

  const handleCreditAction = async (type) => {
    const amount = Number(creditAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      toast.error("Please enter a valid positive integer amount");
      return;
    }

    setCreditLoading(true);
    try {
      await dispatch(adjustUserCredits({ userId: user._id, amount, type })).unwrap();
      toast.success(`Successfully ${type === "add" ? "added" : "removed"} ${amount} credits`);
      setCreditDialogOpen(false);
      setCreditAmount("");
    } catch (err) {
      toast.error(err?.message || "Failed to adjust credits");
    } finally {
      setCreditLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-3xl w-[95vw] max-h-[92vh] overflow-y-auto p-0
          rounded-3xl border border-border shadow-2xl
          bg-surface text-text"
        >
          {/* HEADER */}
          <DialogHeader
            className="relative px-6 sm:px-8 py-8 border-b border-border/40
            bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600
            text-white"
          >
            <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
              {/* AVATAR */}
              <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xl font-bold bg-white text-emerald-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* INFO */}
              <div className="space-y-1">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">
                  {user.fullName || user.name || "User"}
                </DialogTitle>

                <DialogDescription className="text-emerald-100 text-sm sm:text-base flex items-center gap-2">
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
              <InfoCard icon={Calendar} title="Joined Date" value={formatDate(user.createdAt)} />

              <InfoCard icon={Clock3} title="Activity" value={getLastSeenText()} />

              <InfoCard icon={User} title="Friends" value={user.friends?.length || 0} />

              <InfoCard icon={Star} title="Achievements" value={user.badges?.length || 0} />
            </div>

            {/* BANNED BOX */}
            {user.isBanned && (
              <div
                className="rounded-2xl border border-red-500/30
                bg-red-500/10 p-5"
              >
                <div className="flex gap-3">
                  <Ban className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400">
                      Currently Banned
                    </h3>

                    <p className="text-sm text-red-500/90 mt-1">
                      Reason: {user.banReason || "No reason provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BAN HISTORY */}
            {user.banHistory?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  Ban History
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {user.banHistory.map((ban, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border p-4
                      bg-surface-2
                      border-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">
                            {ban.reason}
                          </p>

                          <p className="text-sm text-text-muted mt-1">
                            {formatDate(ban.bannedAt)} •{" "}
                            {formatDistanceToNow(new Date(ban.bannedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        <Badge className="bg-red-500 text-white w-fit">BANNED</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.badges?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-text mb-3">
                  Achievements
                </h3>

                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge, i) => (
                    <Badge key={i} variant="outline" className="bg-surface-2 border-border text-text">
                      {badge.name || badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <Button variant="outline" className="rounded-xl h-11 border-border text-text hover:bg-surface-2">
                <User className="w-4 h-4 mr-2 text-primary" />
                View Profile
              </Button>

              <Button
                variant="outline"
                className={`rounded-xl h-11 ${
                  user.isBanned ? "border-red-500/50 text-red-600 bg-red-500/10 hover:bg-red-500/20" : "border-emerald-500/50 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                }`}
              >
                <Ban className="w-4 h-4 mr-2" />
                {user.isBanned ? "BANNED" : "ACTIVE"}
              </Button>

              <Button
                variant="outline"
                className="rounded-xl h-11 border-border text-text hover:bg-surface-2 cursor-pointer"
                onClick={() => setCreditDialogOpen(true)}
              >
                <DollarSign className="w-4 h-4 mr-2 text-amber-500" />
                Adjust Credits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADJUST CREDITS DIALOG */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="max-w-md w-[92vw] rounded-2xl border border-border shadow-2xl bg-surface text-text">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-text flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Adjust Credits
            </DialogTitle>
            <DialogDescription className="text-text-muted">
              Current credits:{" "}
              <span className="font-bold text-text">{user.credits || 0}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label
                htmlFor="creditAmount"
                className="text-sm font-medium text-text"
              >
                Amount
              </Label>
              <Input
                id="creditAmount"
                type="number"
                min={1}
                step={1}
                placeholder="Enter amount..."
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="h-12 rounded-xl bg-surface-2 border-border text-text focus-visible:ring-primary"
                disabled={creditLoading}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreditDialogOpen(false);
                setCreditAmount("");
              }}
              disabled={creditLoading}
              className="rounded-xl h-11 border-border text-text hover:bg-surface-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={creditLoading || !creditAmount}
              onClick={() => handleCreditAction("remove")}
              className="rounded-xl h-11 gap-2"
            >
              {creditLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              Remove
            </Button>
            <Button
              disabled={creditLoading || !creditAmount}
              onClick={() => handleCreditAction("add")}
              className="rounded-xl h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {creditLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* STAT CARD */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-5 border border-border
      bg-surface text-text shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color}
          text-white flex items-center justify-center shadow-md`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="text-sm text-text-muted">{label}</p>

          <p className="text-xl font-bold text-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* INFO CARD */
function InfoCard({ icon: Icon, title, value }) {
  return (
    <div
      className="rounded-2xl p-5 border border-border
      bg-surface-2 text-text"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary mt-0.5" />

        <div>
          <p className="text-sm text-text-muted">{title}</p>

          <p className="font-semibold text-text mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
