import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  askDoubtApi,
  getDoubtsApi,
  addReplyApi,
  getRepliesApi,
  updateDoubtApi,
  deleteDoubtApi,
  updateReplyApi,
  deleteReplyApi,
} from "../services/doubtApi";

import { socket } from "../socket";
import { toast } from "sonner";
import {
  ThumbsUp,
  Send,
  MessageCircle,
  Bell,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
  Search,
  Flame,
  Users,
  Bot,
  ChevronDown,
  ChevronUp,
  Share2,
  Tag,
  Clock,
  CheckCircle2,
  HelpCircle,
  Zap,
  Copy,
} from "lucide-react";
import { useSelector } from "react-redux";
import api from "../services/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// ── Deterministic Gradient & Avatar initials ──
function getInitials(name = "") {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-rose-600",
  "from-emerald-500 to-teal-700",
  "from-blue-600 to-cyan-600",
  "from-fuchsia-600 to-pink-600",
  "from-purple-600 to-indigo-800",
  "from-orange-500 to-amber-600",
];

function getAvatarGradient(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function CommunityAvatar({ user, size = "md", className = "" }) {
  const [imgErr, setImgErr] = useState(false);
  const name = user?.fullName || user?.name || "Student";
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  const hasPhoto = Boolean(
    user?.avatar &&
    user.avatar !== "/default-avatar.png" &&
    !user.avatar.includes("ui-avatars.com") &&
    !imgErr
  );

  const sizeClasses = {
    sm: "w-7 h-7 text-xs font-bold",
    md: "w-9 h-9 text-xs sm:text-sm font-bold",
    lg: "w-11 h-11 text-base font-extrabold",
  }[size] || "w-9 h-9 text-xs sm:text-sm font-bold";

  if (hasPhoto) {
    return (
      <img
        src={user.avatar}
        alt={name}
        onError={() => setImgErr(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 select-none ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 tracking-wider shadow-inner select-none font-sans ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}

// Curated Popular Topics
const CURATED_TOPICS = [
  "All",
  "DSA",
  "Interview",
  "System Design",
  "Web Dev",
  "Resume",
  "Career",
  "HR",
];

// Quick Starter Questions for One-Click Inspiration
const PROMPT_INSPIRATIONS = [
  "How to optimize time complexity in dynamic programming?",
  "What are the top behavioral questions asked in Amazon SDE-1?",
  "Can someone review my database indexing strategy?",
  "How should I explain my final year project to an interviewer?",
];

export default function DoubtChatPage() {
  const [question, setQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("DSA");
  const [doubts, setDoubts] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [repliesMap, setRepliesMap] = useState({});
  const [openId, setOpenId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'trending' | 'ai-answered' | 'unanswered' | 'mine'
  const [activeTopic, setActiveTopic] = useState("All");

  // Doubt CRUD
  const [editingDoubtId, setEditingDoubtId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [deletingDoubtId, setDeletingDoubtId] = useState(null);
  const [deleteDoubtTarget, setDeleteDoubtTarget] = useState(null);

  // Reply CRUD
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [replyBusyId, setReplyBusyId] = useState(null);
  const [deleteReplyTarget, setDeleteReplyTarget] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [hasNewDoubts, setHasNewDoubts] = useState(false);

  const user = useSelector((state) => state.user.user);

  // Refs to avoid stale closures in socket callbacks
  const pageRef = useRef(page);
  const openIdRef = useRef(openId);
  const doubtsRef = useRef(doubts);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    openIdRef.current = openId;
  }, [openId]);

  useEffect(() => {
    doubtsRef.current = doubts;
  }, [doubts]);

  // ── Fetch doubts ──
  const fetchDoubts = useCallback(async (targetPage = pageRef.current, showLoader = false) => {
    try {
      if (showLoader) setFetching(true);
      setError(null);
      const res = await getDoubtsApi(targetPage);
      const payload = res.data?.data || {};
      const fetchedDoubts = Array.isArray(payload.doubts)
        ? payload.doubts
        : Array.isArray(payload)
          ? payload
          : [];
      setDoubts(fetchedDoubts);
      setPage(payload.page || targetPage);
      setPages(payload.pages || 1);
      setTotal(payload.total || 0);
    } catch (err) {
      setError("Failed to load doubts");
      toast.error("Failed to load doubts");
    } finally {
      if (showLoader) setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDoubts(1, true);
  }, [fetchDoubts]);

  useEffect(() => {
    if (page > 1) {
      fetchDoubts(page, true);
    }
  }, [page, fetchDoubts]);

  // ── Socket setup ──
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      socket.emit("join", user._id);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    const handleNewReply = ({ doubtId, reply }) => {
      if (openIdRef.current === doubtId && reply) {
        setRepliesMap((prev) => {
          const existing = prev[doubtId] || [];
          const already = existing.some((r) => r._id === reply._id);
          if (already) return prev;
          return { ...prev, [doubtId]: [...existing, reply] };
        });
      }
    };

    const handleDoubtUpdated = ({ doubt }) => {
      if (!doubt?._id) return;
      setDoubts((prev) => prev.map((d) => (d._id === doubt._id ? { ...d, ...doubt } : d)));
    };

    const handleDoubtDeleted = ({ doubtId }) => {
      if (!doubtId) return;
      setDoubts((prev) => prev.filter((d) => d._id !== doubtId));
      setRepliesMap((prev) => {
        const next = { ...prev };
        if (next[doubtId]) delete next[doubtId];
        return next;
      });
      if (openIdRef.current === doubtId) setOpenId(null);
    };

    const handleReplyUpdated = ({ doubtId, reply }) => {
      if (!doubtId || !reply?._id) return;
      setRepliesMap((prev) => {
        const existing = prev[doubtId] || [];
        const updatedReplies = existing.map((r) => (r._id === reply._id ? { ...r, ...reply } : r));
        return { ...prev, [doubtId]: updatedReplies };
      });
    };

    const handleReplyDeleted = ({ doubtId, replyId }) => {
      if (!doubtId || !replyId) return;

      let replyExisted = false;
      setRepliesMap((prev) => {
        const existing = prev[doubtId] || [];
        replyExisted = existing.some((r) => r._id === replyId);
        const nextReplies = existing.filter((r) => r._id !== replyId);
        return { ...prev, [doubtId]: nextReplies };
      });

      if (replyExisted) {
        setDoubts((prev) =>
          prev.map((d) => {
            if (d._id !== doubtId) return d;
            const nextCount = Math.max(0, (d.replyCount || 0) - 1);
            return { ...d, replyCount: nextCount };
          })
        );
      }
    };

    const handleNotification = (data) => {
      setNotifications((prev) => {
        const next = [data, ...prev];
        return next.slice(0, 50);
      });
      toast.success(data.message);
    };

    const handleOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    const handleNewDoubt = ({ doubt }) => {
      if (pageRef.current === 1) {
        setDoubts((prev) => {
          const already = prev.some((d) => d._id === doubt?._id);
          if (already) return prev;
          return [doubt, ...prev].slice(0, 10);
        });
        setTotal((prev) => prev + 1);
      } else {
        setHasNewDoubts(true);
      }
    };

    const handleReplyUpvote = ({ replyId, upvotesCount }) => {
      setRepliesMap((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((doubtId) => {
          updated[doubtId] = updated[doubtId].map((r) =>
            r._id === replyId ? { ...r, upvotesCount } : r
          );
        });
        return updated;
      });
    };

    socket.on("new_reply", handleNewReply);
    socket.on("notification", handleNotification);
    socket.on("online_users", handleOnlineUsers);
    socket.on("new_doubt", handleNewDoubt);
    socket.on("reply_upvote", handleReplyUpvote);

    socket.on("doubt_updated", handleDoubtUpdated);
    socket.on("doubt_deleted", handleDoubtDeleted);
    socket.on("reply_updated", handleReplyUpdated);
    socket.on("reply_deleted", handleReplyDeleted);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_reply", handleNewReply);
      socket.off("notification", handleNotification);
      socket.off("online_users", handleOnlineUsers);
      socket.off("new_doubt", handleNewDoubt);
      socket.off("reply_upvote", handleReplyUpvote);

      socket.off("doubt_updated", handleDoubtUpdated);
      socket.off("doubt_deleted", handleDoubtDeleted);
      socket.off("reply_updated", handleReplyUpdated);
      socket.off("reply_deleted", handleReplyDeleted);
    };
  }, [user?._id]);

  // ── Fetch replies when opening a doubt ──
  useEffect(() => {
    if (!openId) return;

    socket.emit("join_doubt", openId);
    fetchReplies(openId);
  }, [openId]);

  const fetchReplies = async (id) => {
    try {
      const res = await getRepliesApi(id);
      const payload = res.data?.data || {};
      const fetchedReplies = Array.isArray(payload.replies)
        ? payload.replies
        : Array.isArray(payload)
          ? payload
          : [];
      setRepliesMap((prev) => ({ ...prev, [id]: fetchedReplies }));
    } catch (err) {
      toast.error("Failed to load replies");
    }
  };

  // ── Handlers ──
  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    if (trimmed.length < 5) {
      toast.error("Question too short (minimum 5 characters)");
      return;
    }

    // Prefix question with tag if not already included
    const questionToPost = selectedCategory && selectedCategory !== "General"
      ? `[${selectedCategory}] ${trimmed}`
      : trimmed;

    try {
      setLoading(true);
      const res = await askDoubtApi(questionToPost);
      const newDoubt = res.data?.data;

      if (newDoubt) {
        setDoubts((prev) => {
          const already = prev.some((d) => d._id === newDoubt._id);
          if (already) return prev;
          return [newDoubt, ...prev].slice(0, 10);
        });
        setTotal((prev) => prev + 1);
        setPage(1);
        setHasNewDoubts(false);
      }

      setQuestion("");
      toast.success("Question posted to Community + AI!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post doubt");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    const trimmed = (replyInputs[id] || "").trim();

    if (!trimmed) return;
    if (trimmed.length < 2) {
      toast.error("Reply too short");
      return;
    }

    try {
      const res = await addReplyApi(id, trimmed);
      const newReply = res.data?.data;

      if (newReply) {
        setRepliesMap((prev) => {
          const existing = prev[id] || [];
          const already = existing.some((r) => r._id === newReply._id);
          if (already) return prev;
          return { ...prev, [id]: [...existing, newReply] };
        });
      }

      setDoubts((prev) =>
        prev.map((d) => (d._id === id ? { ...d, replyCount: (d.replyCount || 0) + 1 } : d))
      );

      setReplyInputs((prev) => ({
        ...prev,
        [id]: "",
      }));

      socket.emit("send_reply", { doubtId: id });
      toast.success("Reply posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    }
  };

  const handleUpdateDoubt = async (doubtId) => {
    const trimmed = editQuestion.trim();
    if (!trimmed) return;
    if (trimmed.length < 5) {
      toast.error("Question too short (min 5 chars)");
      return;
    }

    try {
      if (editingDoubtId !== doubtId) return;
      setDeletingDoubtId(null);
      const res = await updateDoubtApi(doubtId, trimmed);
      const updated = res.data?.data;

      if (updated) {
        setDoubts((prev) => prev.map((d) => (d._id === doubtId ? { ...d, ...updated } : d)));
      }

      setEditingDoubtId(null);
      setEditQuestion("");
      toast.success("Doubt updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update doubt");
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    try {
      setDeletingDoubtId(doubtId);

      setDoubts((prev) => prev.filter((d) => d._id !== doubtId));
      setTotal((prev) => Math.max(0, (prev || 0) - 1));
      if (openIdRef.current === doubtId) {
        setOpenId(null);
      }

      await deleteDoubtApi(doubtId);

      setRepliesMap((prev) => {
        const next = { ...prev };
        delete next[doubtId];
        return next;
      });
      toast.success("Doubt deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete doubt");
    } finally {
      setDeletingDoubtId(null);
      if (editingDoubtId === doubtId) {
        setEditingDoubtId(null);
        setEditQuestion("");
      }
    }
  };

  const handleUpdateReply = async (doubtId, replyId) => {
    const trimmed = editReplyText.trim();
    if (!trimmed) return;
    if (trimmed.length < 2) {
      toast.error("Reply too short (min 2 chars)");
      return;
    }

    try {
      setReplyBusyId(replyId);
      const res = await updateReplyApi(replyId, trimmed);
      const updated = res.data?.data;

      if (updated) {
        setRepliesMap((prev) => {
          const existing = prev[doubtId] || [];
          return {
            ...prev,
            [doubtId]: existing.map((r) => (r._id === replyId ? { ...r, ...updated } : r)),
          };
        });
      }

      setEditingReplyId(null);
      setEditReplyText("");
      toast.success("Reply updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update reply");
    } finally {
      setReplyBusyId(null);
    }
  };

  const handleDeleteReply = async (doubtId, replyId) => {
    try {
      setReplyBusyId(replyId);

      setRepliesMap((prev) => {
        const existing = prev[doubtId] || [];
        return { ...prev, [doubtId]: existing.filter((r) => r._id !== replyId) };
      });

      setDoubts((prev) =>
        prev.map((d) =>
          d._id === doubtId ? { ...d, replyCount: Math.max(0, (d.replyCount || 0) - 1) } : d
        )
      );

      await deleteReplyApi(replyId);
      toast.success("Reply deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete reply");
    } finally {
      setReplyBusyId(null);
      if (editingReplyId === replyId) {
        setEditingReplyId(null);
        setEditReplyText("");
      }
    }
  };

  const handleUpvote = async (replyId, doubtId) => {
    try {
      await api.post(`/api/doubts/reply/${replyId}/upvote`);
      fetchReplies(doubtId);
    } catch (err) {
      toast.error("Failed to upvote");
    }
  };

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleRefreshNewDoubts = () => {
    setPage(1);
    setHasNewDoubts(false);
    fetchDoubts(1, true);
  };

  const handleBellClick = () => {
    setShowNotif((prev) => !prev);
    if (showNotif) {
      setNotifications([]);
    }
  };

  const copyShareLink = (doubtId) => {
    const url = `${window.location.origin}/doubts#doubt-${doubtId}`;
    navigator.clipboard.writeText(url);
    toast.success("Discussion link copied to clipboard");
  };

  // ── Derived state & filtering ──
  const safeDoubts = Array.isArray(doubts) ? doubts : [];

  // Trending doubts sorted by upvotes & replyCount
  const trending = useMemo(() => {
    return [...safeDoubts]
      .sort((a, b) => {
        const scoreB = (b.upvotes?.length || 0) * 2 + (b.replyCount || 0) * 3;
        const scoreA = (a.upvotes?.length || 0) * 2 + (a.replyCount || 0) * 3;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [safeDoubts]);

  // Filter and search pipeline
  const filteredDoubts = useMemo(() => {
    let result = safeDoubts;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.question?.toLowerCase().includes(q) ||
          d.user?.fullName?.toLowerCase().includes(q) ||
          d.aiAnswer?.toLowerCase().includes(q)
      );
    }

    // Filter tabs
    if (activeFilter === "trending") {
      result = [...result].sort(
        (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
      );
    } else if (activeFilter === "ai-answered") {
      result = result.filter((d) => Boolean(d.aiAnswer && d.aiAnswer.trim()));
    } else if (activeFilter === "unanswered") {
      result = result.filter((d) => !d.replyCount || d.replyCount === 0);
    } else if (activeFilter === "mine" && user?._id) {
      result = result.filter((d) => d.user?._id === user._id);
    }

    // Topic filter
    if (activeTopic !== "All") {
      const t = activeTopic.toLowerCase();
      result = result.filter((d) => d.question?.toLowerCase().includes(t));
    }

    return result;
  }, [safeDoubts, searchQuery, activeFilter, activeTopic, user?._id]);

  return (
    <>
      {/* ── Dialog: Delete Doubt Confirmation ── */}
      <Dialog
        open={Boolean(deleteDoubtTarget)}
        onOpenChange={(open) => (!open ? setDeleteDoubtTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md bg-surface border border-border text-text shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-text font-bold">Delete this question?</DialogTitle>
            <DialogDescription className="text-text-muted text-xs">
              This will permanently delete this doubt and all associated community responses.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDoubtTarget(null)}
              className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
              disabled={deletingDoubtId === deleteDoubtTarget?._id}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleDeleteDoubt(deleteDoubtTarget?._id);
                setDeleteDoubtTarget(null);
              }}
              className="bg-danger hover:bg-danger/90 text-white text-xs font-semibold cursor-pointer"
              disabled={!deleteDoubtTarget || deletingDoubtId === deleteDoubtTarget._id}
            >
              {deletingDoubtId === deleteDoubtTarget?._id ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Delete Reply Confirmation ── */}
      <Dialog
        open={Boolean(deleteReplyTarget)}
        onOpenChange={(open) => (!open ? setDeleteReplyTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md bg-surface border border-border text-text shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-text font-bold">Delete this reply?</DialogTitle>
            <DialogDescription className="text-text-muted text-xs">
              This will remove your solution from this discussion.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteReplyTarget(null)}
              className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
              disabled={replyBusyId === deleteReplyTarget?.replyId}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleDeleteReply(deleteReplyTarget?.doubtId, deleteReplyTarget?.replyId);
                setDeleteReplyTarget(null);
              }}
              className="bg-danger hover:bg-danger/90 text-white text-xs font-semibold cursor-pointer"
              disabled={!deleteReplyTarget || replyBusyId === deleteReplyTarget.replyId}
            >
              {replyBusyId === deleteReplyTarget?.replyId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-bg text-text overflow-x-hidden transition-colors duration-200">
        <Navbar />

        <main className="pt-24 lg:pt-24 lg:pl-64 px-4 sm:px-6 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ================= HERO HEADER BANNER ================= */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-border p-6 sm:p-8 shadow-sm">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>Developer Community & Doubts</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
                    Community Q&A Forum
                  </h1>
                  <p className="text-sm text-text-muted mt-1.5 max-w-xl">
                    Exchange interview insights, solve hard algorithmic bugs, and receive immediate peer feedback with automated AI solutions.
                  </p>
                </div>

                {/* Right Header Status Badges */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>{onlineUsers} Online</span>
                  </div>

                  {/* Notifications Popover Bell */}
                  <div className="relative">
                    <button
                      onClick={handleBellClick}
                      className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text-muted hover:text-text transition-colors relative cursor-pointer"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                          {notifications.length}
                        </span>
                      )}
                    </button>

                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-80 bg-surface border border-border shadow-2xl rounded-2xl p-4 z-50 max-h-72 overflow-y-auto">
                        <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                            Community Alerts
                          </h3>
                          <span className="text-[10px] text-primary font-semibold">Live updates</span>
                        </div>
                        {notifications.length === 0 ? (
                          <p className="text-text-muted text-xs py-4 text-center">
                            No new notifications right now.
                          </p>
                        ) : (
                          notifications.map((n, i) => (
                            <div
                              key={i}
                              className="border-b border-border/50 py-2.5 text-xs last:border-b-0"
                            >
                              <p className="font-medium text-text">{n.message}</p>
                              <span className="text-[10px] text-text-muted mt-0.5 block">{n.time || "Just now"}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border/60">
                <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">Total Doubts</span>
                    <span className="text-base font-extrabold text-text">{total} Asked</span>
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">AI Assisted</span>
                    <span className="text-base font-extrabold text-emerald-500">Instant Solution</span>
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">Peers Online</span>
                    <span className="text-base font-extrabold text-text">{onlineUsers} Active</span>
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">Resolution Rate</span>
                    <span className="text-base font-extrabold text-amber-500">95%+ Solved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* New doubts indicator banner */}
            {hasNewDoubts && (
              <div className="flex justify-center">
                <Button
                  onClick={handleRefreshNewDoubts}
                  className="bg-primary hover:bg-primary-hover text-on-primary rounded-full px-5 py-2 shadow-md animate-bounce text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  New doubts posted — Click to view latest
                </Button>
              </div>
            )}

            {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* ──────────────── LEFT SIDEBAR: TRENDING & TAGS ──────────────── */}
              <aside className="space-y-5 order-2 lg:order-1">
                
                {/* 1. Trending Questions Widget */}
                <div className="bg-surface border border-border rounded-2xl shadow-sm p-5">
                  <h2 className="text-sm font-extrabold text-text mb-3.5 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                      <span>Trending Questions</span>
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top Votes</span>
                  </h2>

                  {trending.length === 0 ? (
                    <p className="text-text-muted text-xs py-2">No trending questions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {trending.map((d, idx) => (
                        <div
                          key={d._id}
                          className="cursor-pointer hover:bg-surface-2 p-3 rounded-xl border border-transparent hover:border-border transition-all group"
                          onClick={() => {
                            setPage(1);
                            toggleOpen(d._id);
                            setTimeout(() => {
                              const el = document.getElementById(`doubt-${d._id}`);
                              el?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 100);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {d.question}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1.5">
                                <span className="flex items-center gap-1 font-medium">
                                  <ThumbsUp className="w-3 h-3 text-primary" />
                                  {d.upvotes?.length || 0}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <MessageCircle className="w-3 h-3 text-text-subtle" />
                                  {d.replyCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Popular Topics Filter Widget */}
                <div className="bg-surface border border-border rounded-2xl shadow-sm p-5">
                  <h2 className="text-sm font-extrabold text-text mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span>Explore Topics</span>
                  </h2>

                  <div className="flex flex-wrap gap-1.5">
                    {CURATED_TOPICS.map((topic) => {
                      const isSelected = activeTopic === topic;
                      return (
                        <button
                          key={topic}
                          onClick={() => setActiveTopic(topic)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-2 border border-border text-text-muted hover:text-text hover:bg-surface-2/80"
                          }`}
                        >
                          #{topic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Community Posting Guidelines */}
                <div className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>How to get best answers</span>
                  </h3>
                  <ul className="text-xs text-text-muted space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <span>Specify the programming language or company name.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <span>Paste any error messages or code snippets.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">3.</span>
                      <span>AI model answers within seconds; peer developers follow up.</span>
                    </li>
                  </ul>
                </div>

              </aside>

              {/* ──────────────── RIGHT MAIN FEED: ASK BOX + DISCUSSIONS ──────────────── */}
              <div className="lg:col-span-2 order-1 lg:order-2 space-y-5">
                
                {/* 1. UPGRADED QUESTION COMPOSER CARD */}
                <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 transition-all focus-within:border-primary/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span>Ask the Community & AI</span>
                    </span>
                    <span className="text-[11px] text-text-muted hidden sm:inline">
                      Markdown & Code supported
                    </span>
                  </div>

                  {/* Topic Tag Selector Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2 text-xs">
                    <span className="text-[11px] font-bold text-text-muted shrink-0 mr-1">Topic:</span>
                    {["DSA", "Interview", "System Design", "Web Dev", "Resume", "Career", "General"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-surface-2 text-text-muted hover:text-text border border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Question Textarea */}
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`Ask a technical doubt, interview question, or DSA problem in ${selectedCategory}... (Ctrl + Enter to submit)`}
                    className="w-full resize-none min-h-[90px] border border-border bg-surface-2/60 text-text placeholder:text-text-muted rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm p-3.5 leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAsk();
                      }
                    }}
                  />

                  {/* Suggested Question Injections */}
                  {!question && (
                    <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                      <span className="text-[10px] font-bold text-text-muted shrink-0">Try asking:</span>
                      {PROMPT_INSPIRATIONS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestion(prompt)}
                          className="px-2.5 py-1 rounded-full bg-surface-2 border border-border text-[11px] text-text-muted hover:text-text hover:border-primary/40 whitespace-nowrap transition cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Composer Footer Actions */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/70">
                    <span className="text-[11px] text-text-muted hidden sm:inline">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px] font-mono">Ctrl + Enter</kbd> to submit
                    </span>

                    <Button
                      onClick={handleAsk}
                      disabled={loading || !question.trim()}
                      className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-on-primary font-bold px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-sm text-xs active:scale-95"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Asking AI & Peers...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5" />
                          Ask Community + AI
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 2. FILTER & SEARCH TOOLBAR */}
                <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
                    {[
                      { id: "all", label: "All Questions" },
                      { id: "trending", label: "🔥 Trending" },
                      { id: "ai-answered", label: "🤖 AI Answered" },
                      { id: "unanswered", label: "💬 Unanswered" },
                      { id: "mine", label: "👤 My Doubts" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          activeFilter === tab.id
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-transparent"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. FEED ITEMS */}
                {fetching && safeDoubts.length === 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm font-bold text-text">Loading community discussions...</p>
                    <p className="text-xs text-text-muted mt-1">Connecting to live peer socket network</p>
                  </div>
                )}

                {error && (
                  <div className="bg-danger-soft border border-danger/30 rounded-2xl p-6 text-center">
                    <p className="text-danger text-xs font-semibold mb-3">{error}</p>
                    <Button
                      onClick={() => fetchDoubts(1, true)}
                      variant="outline"
                      className="text-danger border-danger/30 hover:bg-danger-soft text-xs"
                    >
                      Retry Loading
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!fetching && !error && filteredDoubts.length === 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-text">No discussions found</h3>
                    <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `No discussions matching "${searchQuery}". Try a different keyword.`
                        : "Be the first to post a question! Our AI model and community members will help you solve it."}
                    </p>
                  </div>
                )}

                {/* Doubts List Stream */}
                <div className="space-y-4">
                  {filteredDoubts.map((d) => {
                    const isOpen = openId === d._id;
                    const isAuthor = user?._id && user?._id === d.user?._id;
                    const replies = repliesMap[d._id] || [];

                    return (
                      <div
                        key={d._id}
                        id={`doubt-${d._id}`}
                        className={`bg-surface border rounded-2xl shadow-sm transition-all overflow-hidden ${
                          isOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-border hover:border-border/80"
                        }`}
                      >
                        {/* Doubt Card Header & Body */}
                        <div
                          className="p-5 sm:p-6 cursor-pointer hover:bg-surface-2/30 transition-colors"
                          onClick={() => toggleOpen(d._id)}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            {/* Author info */}
                            <div className="flex items-center gap-3">
                              <CommunityAvatar user={d.user} size="md" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-text">
                                    {d.user?.fullName || "Anonymous Student"}
                                  </span>
                                  {isAuthor && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-text-muted block mt-0.5">
                                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recently"}
                                </span>
                              </div>
                            </div>

                            {/* Status Badges & Author Dropdown */}
                            <div className="flex items-center gap-2">
                              {d.aiAnswer ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold">
                                  <Bot className="w-3 h-3" />
                                  <span>AI Solved</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold">
                                  <Zap className="w-3 h-3" />
                                  <span>Open</span>
                                </span>
                              )}

                              {isAuthor && editingDoubtId !== d._id && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition">
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32 bg-surface border border-border text-text shadow-xl">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingDoubtId(d._id);
                                          setEditQuestion(d.question || "");
                                        }}
                                        className="flex items-center gap-2 text-xs cursor-pointer"
                                      >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => setDeleteDoubtTarget(d)}
                                        className="flex items-center gap-2 text-xs text-danger focus:text-danger cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Question Text or Edit Input */}
                          {editingDoubtId === d._id ? (
                            <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <Textarea
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                                className="w-full resize-none border border-border bg-surface-2 text-text rounded-xl focus:ring-1 focus:ring-primary text-sm p-3"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  disabled={deletingDoubtId === d._id}
                                  onClick={() => handleUpdateDoubt(d._id)}
                                  className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Save Updates
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingDoubtId(null);
                                    setEditQuestion("");
                                  }}
                                  className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <h3 className="font-bold text-text text-base sm:text-lg leading-snug mt-1">
                              {d.question}
                            </h3>
                          )}

                          {/* Question Card Bottom Actions Bar */}
                          <div className="flex items-center justify-between gap-4 text-xs text-text-muted mt-4 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-3">
                              {/* Reply toggle pill */}
                              <span className="inline-flex items-center gap-1.5 font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{d.replyCount || replies.length || 0} Replies</span>
                                {isOpen ? (
                                  <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                )}
                              </span>

                              {/* Upvotes */}
                              <span className="inline-flex items-center gap-1.5 hover:text-text transition-colors">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{d.upvotes?.length || 0} Upvotes</span>
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyShareLink(d._id);
                              }}
                              className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-text transition"
                              title="Share discussion"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* ── EXPANDED THREAD (AI Answer + Community Replies) ── */}
                        {isOpen && (
                          <div className="border-t border-border p-5 sm:p-6 space-y-5 bg-surface-2/20">
                            
                            {/* AI ASSISTANT EXPLANATION BANNER */}
                            <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-emerald-500/5 border border-primary/25 p-5 shadow-xs">
                              <div className="flex items-center justify-between pb-3 border-b border-primary/20 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                                      <span>PlaceMentor AI Assistant</span>
                                      <span className="text-[10px] text-primary font-semibold">Verified Solution</span>
                                    </h4>
                                  </div>
                                </div>
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>

                              {d.aiAnswer ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-text text-xs leading-relaxed prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-pre:rounded-xl">
                                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                    {d.aiAnswer}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-xs text-text-muted py-2">
                                  AI answer is generating or not yet available. Community peers can provide answers below!
                                </p>
                              )}
                            </div>

                            {/* COMMUNITY REPLIES STREAM */}
                            <div className="space-y-3 pt-2">
                              <h4 className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center justify-between">
                                <span>Community Solutions ({replies.length})</span>
                                <span className="text-[11px] text-text-muted font-normal">Active thread</span>
                              </h4>

                              {replies.length === 0 ? (
                                <div className="text-center py-6 bg-surface border border-border rounded-xl">
                                  <p className="text-xs text-text-muted">
                                    No peer replies yet. Share your thoughts or solution below!
                                  </p>
                                </div>
                              ) : (
                                replies.map((r) => (
                                  <div
                                    key={r._id}
                                    className="bg-surface border border-border rounded-xl p-4 hover:border-border/80 transition shadow-xs"
                                  >
                                    <div className="flex items-start gap-3">
                                      <CommunityAvatar user={r.user} size="sm" />

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-text">
                                              {r.user?.fullName || "Student"}
                                            </span>
                                            {user?._id === r.user?._id && (
                                              <span className="text-[9px] font-black uppercase px-1.5 rounded bg-primary/10 text-primary">
                                                YOU
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-text-muted">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                                          </span>
                                        </div>

                                        {/* Reply Text / Edit */}
                                        {editingReplyId === r._id ? (
                                          <div className="mt-2 space-y-2">
                                            <Textarea
                                              value={editReplyText}
                                              onChange={(e) => setEditReplyText(e.target.value)}
                                              className="w-full resize-none border border-border bg-surface-2 text-text rounded-xl focus:ring-1 focus:ring-primary text-xs p-2.5"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                disabled={replyBusyId === r._id}
                                                onClick={() => handleUpdateReply(d._id, r._id)}
                                                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold"
                                              >
                                                <Check className="w-3 h-3 mr-1" /> Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setEditingReplyId(null);
                                                  setEditReplyText("");
                                                }}
                                                className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
                                              >
                                                <X className="w-3 h-3 mr-1" /> Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                                            {r.answer}
                                          </p>
                                        )}
                                      </div>

                                      {/* Upvote & Actions */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        {user?._id === r.user?._id && (
                                          <div className="flex items-center gap-0.5">
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 text-text-muted hover:text-text hover:bg-surface-2"
                                              onClick={() => {
                                                setEditingReplyId(r._id);
                                                setEditReplyText(r.answer || "");
                                              }}
                                              disabled={replyBusyId === r._id}
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </Button>

                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 text-text-muted hover:text-danger hover:bg-danger/10"
                                              onClick={() => {
                                                setDeleteReplyTarget({
                                                  doubtId: d._id,
                                                  replyId: r._id,
                                                });
                                              }}
                                              disabled={replyBusyId === r._id}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        )}

                                        <button
                                          onClick={() => handleUpvote(r._id, d._id)}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors text-xs font-bold cursor-pointer"
                                          title="Upvote solution"
                                        >
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{r.upvotesCount ?? r.upvotes?.length ?? 0}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* REPLY COMPOSER INPUT */}
                            <div className="flex gap-2 pt-3 border-t border-border">
                              <Input
                                value={replyInputs[d._id] || ""}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [d._id]: e.target.value,
                                  }))
                                }
                                placeholder="Write a helpful reply or code solution..."
                                className="flex-1 bg-surface border border-border text-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 focus:border-primary rounded-xl text-xs py-2 px-3"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReply(d._id);
                                  }
                                }}
                              />

                              <Button
                                onClick={() => handleReply(d._id)}
                                disabled={!(replyInputs[d._id] || "").trim()}
                                className="bg-primary hover:bg-primary-hover text-on-primary rounded-xl disabled:opacity-50 text-xs px-4 font-bold shadow-xs active:scale-95 cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4. PAGINATION */}
                {filteredDoubts.length > 0 && pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      disabled={page === 1 || fetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="border-border text-text hover:bg-surface-2 bg-surface text-xs font-bold rounded-xl"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Previous
                    </Button>

                    <span className="text-xs font-semibold text-text-muted">
                      Page <span className="text-text font-bold">{page}</span> of{" "}
                      <span className="text-text font-bold">{pages}</span>
                    </span>

                    <Button
                      variant="outline"
                      disabled={page === pages || fetching}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      className="border-border text-text hover:bg-surface-2 bg-surface text-xs font-bold rounded-xl"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
