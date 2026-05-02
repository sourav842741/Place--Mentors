import { useEffect, useState, useRef, useCallback } from "react";
import { askDoubtApi, getDoubtsApi, addReplyApi, getRepliesApi } from "../services/doubtApi";
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
} from "lucide-react";
import { useSelector } from "react-redux";
import api from "../services/api";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";

export default function DoubtChatPage() {
  const [question, setQuestion] = useState("");
  const [doubts, setDoubts] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [repliesMap, setRepliesMap] = useState({});
  const [openId, setOpenId] = useState(null);
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

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_reply", handleNewReply);
      socket.off("notification", handleNotification);
      socket.off("online_users", handleOnlineUsers);
      socket.off("new_doubt", handleNewDoubt);
      socket.off("reply_upvote", handleReplyUpvote);
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
    const trimmed = replyText.trim();
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

      setReplyText("");
      socket.emit("send_reply", { doubtId: id });
      toast.success("Reply posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 overflow-x-hidden transition-colors duration-300 lg:ml-5 mt-5">
      <Navbar />

      <div className="lg:pl-64 mt-16 px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 shadow-sm mb-6 p-4 md:p-6 transition">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Community
            </h1>

            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                {onlineUsers} online
              </span>

              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg rounded-xl p-4 z-50 max-h-64 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Notifications
                    </h3>
                    {notifications.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No new notifications
                      </p>
                    )}
                    {notifications.map((n, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700 py-3 text-sm last:border-b-0"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{n.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{n.time}</span>
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
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 shadow-lg animate-bounce"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New doubts available — Click to refresh
            </Button>
          </div>
        )}

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* CENTER */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
            {/* Ask Box */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-4 md:p-6">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your programming doubt or interview question..."
                className="w-full resize-none mb-4 min-h-[100px] border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) {
                    handleAsk();
                  }
                }}
              />

              <Button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Asking AI...
                  </span>
                ) : (
                  "Ask Community + AI"
                )}
              </Button>
            </div>

            {/* Loading */}
            {fetching && safeDoubts.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
                <Button
                  onClick={() => fetchDoubts(1, true)}
                  variant="outline"
                  className="text-red-600 border-red-300"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty */}
            {!fetching && !error && safeDoubts.length === 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  No doubts yet
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Be the first to ask a question!
                </p>
              </div>
            )}

            {/* Doubts */}
            {safeDoubts.map((d) => (
              <div
                key={d._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  onClick={() => toggleOpen(d._id)}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={d.user?.avatar || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        {d.user?.fullName || "Anonymous"}
                      </p>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{d.question}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      {d.replyCount || repliesMap[d._id]?.length || 0} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      {d.upvotes?.length || 0} upvotes
                    </span>
                    <span className="text-xs">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>

                {openId === d._id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 space-y-4">
                    {/* AI Answer */}
                    {d.aiAnswer && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                          🤖 AI Answer
                        </p>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{d.aiAnswer}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    <div className="space-y-3">
                      {repliesMap[d._id]?.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                          No replies yet. Be the first!
                        </p>
                      )}
                      {repliesMap[d._id]?.map((r) => (
                        <div
                          key={r._id}
                          className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-white/10 rounded-lg p-3 md:p-4 transition"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={r.user?.avatar || "/default-avatar.png"}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                  {r.user?.fullName || "User"}
                                </p>
                                <span className="text-[10px] text-gray-400">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {r.answer}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpvote(r._id, d._id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 text-sm font-medium cursor-pointer shrink-0"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{r.upvotesCount ?? r.upvotes?.length ?? 0}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 bg-white dark:bg-gray-800 border dark:border-white/10 text-gray-900 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(d._id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleReply(d._id)}
                        disabled={!replyText.trim()}
                        className="bg-gray-800 hover:bg-gray-900 text-white disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {safeDoubts.length > 0 && pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1 || fetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="dark:border-white/10 dark:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {pages}
                </span>

                <Button
                  variant="outline"
                  disabled={page === pages || fetching}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="dark:border-white/10 dark:text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Trending */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🔥 Trending</h2>

              {trending.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No trending doubts yet</p>
              ) : (
                <div className="space-y-3">
                  {trending.map((d, idx) => (
                    <div
                      key={d._id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition"
                      onClick={() => {
                        setPage(1);
                        toggleOpen(d._id);
                        // Scroll to the doubt if needed
                        setTimeout(() => {
                          const el = document.getElementById(`doubt-${d._id}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg font-bold text-gray-300 dark:text-gray-600 shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {d.question}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Topics</h2>

              {topics.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No topics yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <Badge
                      key={topic}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Stats</h2>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Total doubts</span>
                  <span className="font-medium text-gray-900 dark:text-white">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Online now</span>
                  <span className="font-medium text-green-600">{onlineUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
