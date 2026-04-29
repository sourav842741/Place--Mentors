import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";

import {
  promoteUser,
  demoteUser,
  banUser,
  unbanUser,
} from "../../redux/adminUserSlice";

import { toast } from "sonner";
import { exportUsersCSV } from "../../services/api";
import UserProfileModal from "../../components/admin/UserProfileModal";
import { useAdminUsers } from "../../hooks/useAdminUsers";

/* CARD */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* TABLE */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* UI */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ICONS */
import {
  Users as UsersIcon,
  UserCheck,
  Shield,
  UserX,
  UserPlus,
  Filter,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

const Users = () => {
  const dispatch = useDispatch();
  const { data: allUsers, loading, error, refetch } = useAdminUsers();
  const currentUser = useSelector((state) => state.user.user);

  // Filter & Search State
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchDebounced] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const PER_PAGE = 10;

  const UserCard = ({ user }) => {
    const statusIcon = getStatusIcon(user);
    const roleLabel = user.isSuperAdmin
      ? "OWNER"
      : user.role === "admin"
        ? "ADMIN"
        : "USER";
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-white dark:ring-gray-800">
                {user.avatar || user.profilePic || user.photoURL ? (
                  <img
                    src={user.avatar || user.profilePic || user.photoURL}
                    alt={user.fullName || user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {(user.fullName || user.name || "U")
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="absolute -top-1 -right-1">{statusIcon}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {user.fullName || user.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                className={`${user.isSuperAdmin ? "bg-gradient-to-r from-purple-600 to-pink-600" : user.role === "admin" ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-emerald-500 to-teal-600"} text-white px-3 py-1 shadow-md`}
              >
                {roleLabel}
              </Badge>
              <div className="flex items-center gap-2">
                {statusIcon}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${user.isBanned ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : user.isOnline ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
                >
                  {user.isBanned
                    ? "BANNED"
                    : user.isOnline
                      ? "ONLINE"
                      : "OFFLINE"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Level</span>
                <div className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Lv {user.level || 1}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Credits
                </span>
                <div className="font-mono font-bold text-xl text-gray-900 dark:text-white">
                  {user.credits || 0}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Last seen: {timeAgo(user.lastSeen)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProfileModal({ open: true, user })}
                  className="h-9 px-3"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {currentUser?.isSuperAdmin && !user.isSuperAdmin ? (
                  user.role === "admin" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await dispatch(demoteUser(user._id)).unwrap();
                          toast.success("Demoted to User ✅");
                        } catch (err) {
                          toast.error(err?.message || "Failed to demote");
                        }
                      }}
                      className="h-9 px-3"
                    >
                      Demote
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await dispatch(promoteUser(user._id)).unwrap();
                          toast.success("Promoted to Admin 🚀");
                        } catch (err) {
                          toast.error(err?.message || "Failed to promote");
                        }
                      }}
                      className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Make Admin
                    </Button>
                  )
                ) : null}
                {user.isBanned ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setUnbanModal({
                        open: true,
                        userId: user._id,
                        userName: user.fullName || user.name,
                      })
                    }
                    className="h-9 px-3"
                  >
                    Unban
                  </Button>
                ) : (
                    currentUser?.isSuperAdmin
                      ? !user.isSuperAdmin && user._id !== currentUser?._id
                      : currentUser?.role === "admin" &&
                        user.role === "user" &&
                        !user.isSuperAdmin
                  ) ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setBanModal({
                        open: true,
                        userId: user._id,
                        userName: user.fullName || user.name,
                      })
                    }
                    className="h-9 px-3"
                  >
                    Ban
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 ml-auto"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats counts
  const totalUsers = allUsers?.length ?? 0;
  const onlineUsers = allUsers?.filter((u) => u.isOnline).length ?? 0;
  const adminUsers =
    allUsers?.filter((u) => u.role === "admin" || u.isSuperAdmin).length ?? 0;
  const bannedUsers = allUsers?.filter((u) => u.isBanned).length ?? 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Modal States
  const [profileModal, setProfileModal] = useState({ open: false, user: null });

  // Live user reference so the modal updates instantly when Redux state changes
  const liveProfileUser = useMemo(() => {
    if (!profileModal.user) return null;
    return (
      allUsers?.find((u) => u._id === profileModal.user._id) ||
      profileModal.user
    );
  }, [profileModal.user, allUsers]);

  const [banModal, setBanModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });
  const [unbanModal, setUnbanModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });
  const [banReason, setBanReason] = useState("");

  // Derived filtered users
  const filteredUsers = useMemo(() => {
    let filtered = allUsers || [];

    // Search
    if (searchDebounced) {
      const term = searchDebounced.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.fullName || user.name || "").toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term),
      );
    }

    // Filter
    if (filter === "admin")
      filtered = filtered.filter((u) => u.role === "admin" || u.isSuperAdmin);
    else if (filter === "user")
      filtered = filtered.filter((u) => u.role === "user" && !u.isSuperAdmin);
    else if (filter === "banned") filtered = filtered.filter((u) => u.isBanned);
    else if (filter === "online") filtered = filtered.filter((u) => u.isOnline);
    else if (filter === "offline")
      filtered = filtered.filter((u) => !u.isOnline && !u.isBanned);

    return filtered;
  }, [allUsers, searchDebounced, filter]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredUsers.slice(start, start + PER_PAGE);
  }, [filteredUsers, page]);

  const totalPages = Math.ceil(filteredUsers.length / PER_PAGE);

  // Time ago formatter
  const timeAgo = (dateStr) => {
    if (!dateStr) return "Never";
    try {
      const date = new Date(dateStr);
      const now = Date.now();
      const diff = Math.floor((now - date) / 1000);

      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
      if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
      return "Long ago";
    } catch {
      return "Unknown";
    }
  };

  const getStatusIcon = (user) => {
    if (user.isBanned)
      return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />;
    if (user.isOnline)
      return (
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      );
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const handleExport = async () => {
    try {
      const headers = [
        "Full Name",
        "Email",
        "Role",
        "Level",
        "Credits",
        "Status",
        "Last Seen",
        "Joined Date",
      ];

      const rows = filteredUsers.map((user) => [
        `"${user.fullName || user.name || ""}"`,
        `"${user.email || ""}"`,
        `"${user.isSuperAdmin ? "OWNER" : user.role || "USER"}"`,
        `"${user.level || 1}"`,
        `"${user.credits || 0}"`,
        `"${user.isBanned ? "BANNED" : user.isOnline ? "ACTIVE NOW" : "OFFLINE"}"`,
        `"${user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "Never"}"`,
        `"${
          user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : ""
        }"`,
      ]);

      const csvContent =
        headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");

      const blob = new Blob(
        ["\uFEFF" + csvContent], // UTF support
        { type: "text/csv;charset=utf-8;" },
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Excel exported successfully ");
    } catch (error) {
      toast.error("Export failed ");
    }
  };

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <UsersIcon className="w-20 h-20 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to load users
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
        <Button onClick={() => refetch()} className="w-48">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50/80 via-white/80 to-indigo-50/80 dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-8 lg:ml-64 relative">
        <div className="absolute inset-0 bg-[radial-gradient(var(--tw-gradient-stops))] from-indigo-200/30 to-transparent dark:from-indigo-900/20 pointer-events-none rounded-3xl blur-xl -z-10"></div>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent dark:from-white dark:to-gray-200 mb-2 drop-shadow-lg">
              User Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Advanced controls and real-time monitoring ({filteredUsers.length}{" "}
              shown)
            </p>
          </div>
          <Badge className="text-lg px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 border-0">
            {allUsers?.length || 0}{" "}
            <span className="ml-1 font-mono">Total Users</span>
          </Badge>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group border-0 shadow-xl hover:shadow-2xl rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 dark:from-indigo-500/20 dark:to-purple-600/20 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-indigo-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-xl" />
                ) : (
                  <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    {totalUsers}
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Total Users
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All registered accounts
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl hover:shadow-2xl rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-emerald-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-xl" />
                ) : (
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    {onlineUsers}
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Online Now
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active sessions
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl hover:shadow-2xl rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-orange-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-xl" />
                ) : (
                  <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                    {adminUsers}
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Admin Users
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Administrators & owners
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl hover:shadow-2xl rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-red-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                {loading ? (
                  <Skeleton className="w-20 h-8 rounded-xl" />
                ) : (
                  <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
                    {bannedUsers}
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Banned Users
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Restricted accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS BAR */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white/80 to-indigo-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 pr-4 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-0 shadow-lg ring-2 ring-transparent focus-visible:ring-indigo-500/50 focus-visible:shadow-xl transition-all"
                />
              </div>

              {/* Filters */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-0 shadow-lg">
                  <SelectValue placeholder="Filter users" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleExport}
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg h-12 px-6 rounded-2xl"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </Button>
                <Button className="h-12 px-6 rounded-2xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN TABLE */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="px-8 py-6 border-b bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <UsersIcon className="w-8 h-8" />
                {filteredUsers.length} Users • Page {page} of {totalPages}
              </CardTitle>
              {loading && (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 divide-y divide-gray-200 dark:divide-gray-800">
                <div className="pb-8 space-y-4">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-2xl" />
                    ))}
                  </div>
                </div>
                <div className="pt-8 space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="p-4 space-y-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="p-16 text-center">
                <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No users found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchDebounced || filter !== "all"
                    ? "Try adjusting your search or filter"
                    : "No users yet. Invite your first user!"}
                </p>
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : isMobile ? (
              <div className="p-6 space-y-4">
                {paginatedUsers.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm z-10">
                    <TableRow className="border-b-2 border-gray-200 dark:border-gray-800">
                      <TableHead className="font-bold text-gray-900 dark:text-white w-64">
                        User
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-28">
                        Role
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-20 text-center">
                        Level
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-24 text-right">
                        Credits
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-28">
                        Status
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-32">
                        Last Seen
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white w-48 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const statusIcon = getStatusIcon(user);
                      const roleLabel = user.isSuperAdmin
                        ? "OWNER"
                        : user.role === "admin"
                          ? "ADMIN"
                          : "USER";

                      return (
                        <TableRow
                          key={user._id}
                          className="group hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-200 border-b hover:border-indigo-200 dark:hover:border-indigo-800"
                        >
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-white dark:ring-gray-800">
                                  {user.avatar ||
                                  user.profilePic ||
                                  user.photoURL ? (
                                    <img
                                      src={
                                        user.avatar ||
                                        user.profilePic ||
                                        user.photoURL
                                      }
                                      alt={user.fullName || user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                                      {(user.fullName || user.name || "U")
                                        .split(" ")
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  {statusIcon}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400 truncate">
                                  {user.fullName || user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`${
                                user.isSuperAdmin
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                  : user.role === "admin"
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                              } text-white px-3 py-1 shadow-md`}
                            >
                              {roleLabel}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                              Lv {user.level || 1}
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-xl">
                            {user.credits || 0}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {statusIcon}
                              <Badge
                                className={`px-3 py-1 shadow-md ${
                                  user.isBanned
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : user.isOnline
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 shadow-emerald-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {user.isBanned
                                  ? "BANNED"
                                  : user.isOnline
                                    ? "ACTIVE NOW"
                                    : "OFFLINE"}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm">
                            <div className="font-medium">
                              {timeAgo(user.lastSeen)}
                            </div>
                            {user.lastSeen && (
                              <div className="text-xs text-gray-500">
                                {new Date(user.lastSeen).toLocaleString()}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setProfileModal({ open: true, user })
                                }
                                className="h-8 w-8 p-0"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {currentUser?.isSuperAdmin &&
                              !user.isSuperAdmin ? (
                                user.role === "admin" ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      try {
                                        await dispatch(
                                          demoteUser(user._id),
                                        ).unwrap();
                                        toast.success("Demoted to User ✅");
                                      } catch (err) {
                                        toast.error(
                                          err?.message || "Failed to demote",
                                        );
                                      }
                                    }}
                                    className="h-8 px-3"
                                  >
                                    Demote
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await dispatch(
                                          promoteUser(user._id),
                                        ).unwrap();
                                        toast.success("Promoted to Admin 🚀");
                                      } catch (err) {
                                        toast.error(
                                          err?.message || "Failed to promote",
                                        );
                                      }
                                    }}
                                    className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    Admin
                                  </Button>
                                )
                              ) : null}

                              {user.isBanned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setUnbanModal({
                                      open: true,
                                      userId: user._id,
                                      userName: user.fullName || user.name,
                                    })
                                  }
                                  className="h-8 px-3"
                                >
                                  Unban
                                </Button>
                              ) : (
                                  currentUser?.isSuperAdmin
                                    ? !user.isSuperAdmin &&
                                      user._id !== currentUser?._id
                                    : currentUser?.role === "admin" &&
                                      user.role === "user" &&
                                      !user.isSuperAdmin
                                ) ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setBanModal({
                                      open: true,
                                      userId: user._id,
                                      userName: user.fullName || user.name,
                                    })
                                  }
                                  className="h-8 px-3"
                                >
                                  Ban
                                </Button>
                              ) : null}

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * PER_PAGE + 1} to{" "}
                {Math.min(page * PER_PAGE, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-10 w-10 p-0 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(
                      1,
                      Math.min(totalPages, page - 2 + i),
                    );
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`h-10 px-4 rounded-xl font-mono min-w-[2.5rem] ${pageNum === page ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-10 w-10 p-0 rounded-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* PROFILE MODAL */}
      <UserProfileModal
        user={liveProfileUser}
        isOpen={profileModal.open}
        onClose={() => setProfileModal({ open: false, user: null })}
      />

      {/* BAN MODAL - PRESERVED */}
      <Dialog
        open={banModal.open}
        onOpenChange={(open) =>
          !open && setBanModal({ open: false, userId: null, userName: "" })
        }
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ban {banModal.userName}</DialogTitle>
            <DialogDescription>
              Enter reason for banning this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <Label htmlFor="banReason">Ban Reason</Label>
            <Textarea
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Spam / Abuse / Policy violation..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBanReason("");
                setBanModal({ open: false, userId: null, userName: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!banReason.trim()}
              onClick={async () => {
                try {
                  await dispatch(
                    banUser({
                      userId: banModal.userId,
                      banReason: banReason.trim(),
                    }),
                  ).unwrap();
                  toast.success("User banned 🚫");
                  setBanReason("");
                  setBanModal({ open: false, userId: null, userName: "" });
                } catch (err) {
                  toast.error(err?.message || "Failed to ban user");
                }
              }}
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UNBAN MODAL - PRESERVED */}
      <Dialog
        open={unbanModal.open}
        onOpenChange={(open) =>
          !open && setUnbanModal({ open: false, userId: null, userName: "" })
        }
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Unban {unbanModal.userName}</DialogTitle>
            <DialogDescription>Restore account access.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setUnbanModal({ open: false, userId: null, userName: "" })
              }
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                try {
                  await dispatch(unbanUser(unbanModal.userId)).unwrap();
                  toast.success("User unbanned ✅");
                  setUnbanModal({ open: false, userId: null, userName: "" });
                } catch (err) {
                  toast.error(err?.message || "Failed to unban user");
                }
              }}
            >
              Confirm Unban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
