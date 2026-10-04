import { useEffect, useState, useRef, useCallback } from "react";
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
  Circle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
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
  DialogOverlay,
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

export default function DoubtChatPage() {
  const [question, setQuestion] = useState("");
  const [doubts, setDoubts] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [repliesMap, setRepliesMap] = useState({});
  const [openId, setOpenId] = useState(null);

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

    // Stable handlers using refs
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

      // Decrement only if reply was actually present before filtering.
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
      toast.error("Question too short (min 5 chars)");
      return;
    }

    try {
      setLoading(true);
      const res = await askDoubtApi(trimmed);
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
      toast.success("Doubt posted");
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

      // Optimistically update replyCount in doubts list
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

      // optimistic: remove locally
      setDoubts((prev) => prev.filter((d) => d._id !== doubtId));
      setTotal((prev) => Math.max(0, (prev || 0) - 1));
      if (openIdRef.current === doubtId) {
        setOpenId(null);
      }

      await deleteDoubtApi(doubtId);

      // cleanup local reply draft
      setRepliesMap((prev) => {
        const next = { ...prev };
        delete next[doubtId];
        return next;
      });
      toast.success("Doubt deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete doubt");
      // rollback is not implemented because we don’t have original payload here.
      // Socket doubt_deleted should keep things consistent.
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

      // optimistic removal
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
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
    }
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

  // ── Derived state ──
  const safeDoubts = Array.isArray(doubts) ? doubts : [];

  const trending = [...safeDoubts]
    .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
    .slice(0, 3);

  const topics = Array.from(
    new Set(
      safeDoubts.flatMap(
        (d) =>
          (d.question || "")
            .toLowerCase()
            .match(
              /(react|javascript|node|java|python|dsa|leetcode|system design|interview|aws|docker|sql)/gi
            ) || []
      )
    )
  ).slice(0, 8);

  return (
    <>
      {/* Delete Doubt Confirmation */}
      <Dialog
        open={Boolean(deleteDoubtTarget)}
        onOpenChange={(open) => (!open ? setDeleteDoubtTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md bg-surface border border-border text-text shadow-float">
          <DialogHeader>
            <DialogTitle className="text-text font-bold">Delete this doubt?</DialogTitle>
            <DialogDescription className="text-text-muted text-xs">This will permanently remove the doubt and all its replies.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
              className="bg-danger hover:bg-danger/90 text-white text-xs font-medium cursor-pointer"
              disabled={!deleteDoubtTarget || deletingDoubtId === deleteDoubtTarget._id}
            >
              {deletingDoubtId === deleteDoubtTarget?._id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Confirmation */}
      <Dialog
        open={Boolean(deleteReplyTarget)}
        onOpenChange={(open) => (!open ? setDeleteReplyTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md bg-surface border border-border text-text shadow-float">
          <DialogHeader>
            <DialogTitle className="text-text font-bold">Delete this reply?</DialogTitle>
            <DialogDescription className="text-text-muted text-xs">This will permanently remove your reply from the discussion.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
              className="bg-danger hover:bg-danger/90 text-white text-xs font-medium cursor-pointer"
              disabled={!deleteReplyTarget || replyBusyId === deleteReplyTarget.replyId}
            >
              {replyBusyId === deleteReplyTarget?.replyId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-bg text-text overflow-x-hidden transition-colors duration-200">
        <Navbar />

        <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12">
          {/* Header */}
          <div className="bg-surface border border-border rounded-2xl shadow-subtle mb-6 p-4 md:p-6 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text">
                  Community Q&A
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  Ask questions, discuss problems, and get peer + AI assisted explanations
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-2 text-xs font-medium text-text-muted bg-surface-2 px-3 py-1 rounded-full border border-border">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {onlineUsers} online
                </span>

                <div className="relative">
                  <button
                    onClick={handleBellClick}
                    className="relative p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-border shadow-float rounded-xl p-4 z-50 max-h-64 overflow-y-auto">
                      <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
                        Notifications
                      </h3>
                      {notifications.length === 0 && (
                        <p className="text-text-muted text-xs py-2">
                          No new notifications
                        </p>
                      )}
                      {notifications.map((n, i) => (
                        <div
                          key={i}
                          className="border-b border-border py-2.5 text-xs last:border-b-0"
                        >
                          <p className="font-medium text-text">{n.message}</p>
                          <span className="text-[10px] text-text-subtle">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New doubts indicator */}
          {hasNewDoubts && (
            <div className="mb-4 flex justify-center">
              <Button
                onClick={handleRefreshNewDoubts}
                className="bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2 shadow-soft animate-bounce text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                New doubts available — Click to refresh
              </Button>
            </div>
          )}

          {/* Main */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* CENTER FEED */}
            <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
              {/* Ask Box */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5 md:p-6 transition-colors">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a technical doubt, interview question, or DSA problem... (Ctrl + Enter to submit)"
                  className="w-full resize-none mb-4 min-h-[100px] border border-border bg-surface-2 text-text placeholder:text-text-muted rounded-xl focus:ring-1 focus:ring-primary text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAsk();
                    }
                  }}
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-text-subtle hidden sm:inline">
                    Markdown supported • Answered by AI & community members
                  </span>

                  <Button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-sm text-xs"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Asking AI...
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

              {/* Loading */}
              {fetching && safeDoubts.length === 0 && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-danger-soft border border-danger/20 rounded-xl p-6 text-center">
                  <p className="text-danger text-xs mb-3">{error}</p>
                  <Button
                    onClick={() => fetchDoubts(1, true)}
                    variant="outline"
                    className="text-danger border-danger/30 hover:bg-danger-soft text-xs"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty */}
              {!fetching && !error && safeDoubts.length === 0 && (
                <div className="bg-surface border border-border rounded-xl p-10 text-center shadow-subtle">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary mx-auto mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-text text-base font-semibold">
                    No doubts asked yet
                  </p>
                  <p className="text-text-muted text-xs mt-1 max-w-sm mx-auto">
                    Be the first one to ask a question! Our AI and active peers are here to help.
                  </p>
                </div>
              )}

              {/* Doubts List */}
              {safeDoubts.map((d) => (
                <div
                  key={d._id}
                  id={`doubt-${d._id}`}
                  className="bg-surface border border-border rounded-xl shadow-subtle hover:border-primary/40 transition-colors overflow-hidden"
                >
                  <div
                    className="p-4 md:p-5 cursor-pointer hover:bg-surface-2/40 transition-colors"
                    onClick={() => toggleOpen(d._id)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={d.user?.avatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-muted mb-0.5 font-medium">
                          {d.user?.fullName || "Anonymous"}
                        </p>

                        {editingDoubtId === d._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="w-full resize-none border border-border bg-surface-2 text-text rounded-lg focus:ring-1 focus:ring-primary text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={deletingDoubtId === d._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateDoubt(d._id);
                                }}
                                className="bg-primary hover:bg-primary-hover text-white text-xs"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          <h3 className="font-semibold text-text text-sm sm:text-base leading-snug">
                            {d.question}
                          </h3>
                        )}
                      </div>

                      {user?._id && user?._id === d.user?._id && editingDoubtId !== d._id && (
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-surface-2 text-text-muted hover:text-text transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 bg-surface border border-border text-text">
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

                    <div className="flex items-center gap-4 text-xs text-text-muted mt-3 pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <MessageCircle size={14} className="text-primary" />
                        {d.replyCount || repliesMap[d._id]?.length || 0} replies
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-text transition-colors">
                        <ThumbsUp size={14} />
                        {d.upvotes?.length || 0} upvotes
                      </span>
                      <span className="text-[11px] text-text-subtle ml-auto">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>

                  {openId === d._id && (
                    <div className="border-t border-border p-4 md:p-6 space-y-4 bg-surface-2/20">
                      {/* AI Answer */}
                      <div className="bg-primary-soft border border-primary/25 rounded-xl p-4">
                        <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                          <span>🤖</span> AI Assistant Explanation
                        </p>

                        {d.aiAnswer ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-text prose-p:text-text prose-pre:bg-surface prose-pre:border prose-pre:border-border text-xs leading-relaxed">
                            <ReactMarkdown>{d.aiAnswer}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">
                            AI answer not available yet. Community members can help answer below 💬
                          </p>
                        )}
                      </div>

                      {/* Replies */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
                          Community Replies ({repliesMap[d._id]?.length || 0})
                        </h4>

                        {repliesMap[d._id]?.length === 0 && (
                          <p className="text-text-muted text-xs text-center py-4 bg-surface border border-border rounded-xl">
                            No community replies yet. Be the first to answer!
                          </p>
                        )}

                        {repliesMap[d._id]?.map((r) => (
                          <div
                            key={r._id}
                            className="bg-surface border border-border rounded-xl p-3.5 md:p-4 hover:border-border/80 transition shadow-subtle"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={r.user?.avatar || "/default-avatar.png"}
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-text">
                                    {r.user?.fullName || "User"}
                                  </p>

                                  <span className="text-[10px] text-text-subtle">
                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                                  </span>
                                </div>

                                {editingReplyId === r._id ? (
                                  <div className="mt-1 space-y-2">
                                    <Textarea
                                      value={editReplyText}
                                      onChange={(e) => setEditReplyText(e.target.value)}
                                      className="w-full resize-none border border-border bg-surface-2 text-text rounded-lg focus:ring-1 focus:ring-primary text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        disabled={replyBusyId === r._id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateReply(d._id, r._id);
                                        }}
                                        className="bg-primary hover:bg-primary-hover text-white text-xs"
                                      >
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingReplyId(null);
                                          setEditReplyText("");
                                        }}
                                        className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
                                      >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                                    {r.answer}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {user?._id === r.user?._id && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-text-muted hover:text-text hover:bg-surface-2"
                                      onClick={(e) => {
                                        e.stopPropagation();

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
                                      className="h-7 w-7 p-0 text-text-muted hover:text-danger hover:bg-danger-soft"
                                      onClick={(e) => {
                                        e.stopPropagation();

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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpvote(r._id, d._id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-soft transition-colors text-xs font-medium cursor-pointer"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{r.upvotesCount ?? r.upvotes?.length ?? 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input */}
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
                          className="flex-1 bg-surface border border-border text-text placeholder:text-text-muted focus:ring-1 focus:ring-primary rounded-xl text-xs"
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
                          className="bg-primary hover:bg-primary-hover text-white rounded-xl disabled:opacity-50 text-xs px-3.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {safeDoubts.length > 0 && pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6 pt-2">
                  <Button
                    variant="outline"
                    disabled={page === 1 || fetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Prev
                  </Button>

                  <span className="text-xs text-text-muted">
                    Page {page} of {pages}
                  </span>

                  <Button
                    variant="outline"
                    disabled={page === pages || fetching}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="border-border text-text hover:bg-surface-2 bg-surface text-xs"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="space-y-5 order-2 lg:order-1">
              {/* Trending */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5">
                <h2 className="text-sm font-bold text-text mb-3 flex items-center gap-1.5">
                  🔥 Trending Questions
                </h2>

                {trending.length === 0 ? (
                  <p className="text-text-muted text-xs">No trending doubts yet</p>
                ) : (
                  <div className="space-y-2">
                    {trending.map((d, idx) => (
                      <div
                        key={d._id}
                        className="cursor-pointer hover:bg-surface-2 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setPage(1);
                          toggleOpen(d._id);
                          setTimeout(() => {
                            const el = document.getElementById(`doubt-${d._id}`);
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 100);
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-sm font-bold text-text-subtle shrink-0 w-4">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-text line-clamp-2 leading-snug">
                              {d.question}
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                              {d.upvotes?.length || 0} upvotes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Topics */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5">
                <h2 className="text-sm font-bold text-text mb-3">Popular Topics</h2>

                {topics.length === 0 ? (
                  <p className="text-text-muted text-xs">No topics tagged yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="bg-surface-2 hover:bg-primary-soft hover:text-primary hover:border-primary/30 text-text-muted border border-border capitalize text-[11px] font-normal transition-colors cursor-pointer"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5">
                <h2 className="text-sm font-bold text-text mb-3">Community Activity</h2>
                <div className="space-y-2.5 text-xs text-text-muted">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span>Total doubts asked</span>
                    <span className="font-semibold text-text">{total}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Active developers</span>
                    <span className="font-semibold text-primary">{onlineUsers} online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
