import { useEffect, useState } from "react";
import {
  askDoubtApi,
  getDoubtsApi,
  addReplyApi,
  getRepliesApi,
} from "../services/doubtApi";
import { socket } from "../socket";
import { toast } from "sonner";
import { ThumbsUp, Send, MessageCircle, Bell } from "lucide-react";
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
  const [repliesMap, setRepliesMap] = useState({});
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchDoubts();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    socket.on("notification", (data) => {});

    return () => socket.off("notification");
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

    const handleNewReply = ({ doubtId }) => {
      if (openId === doubtId) {
        fetchReplies(doubtId);
      }
    };

    const handleNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.success(data.message);
    };

    const handleOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    socket.on("new_reply", handleNewReply);
    socket.on("notification", handleNotification);
    socket.on("online_users", handleOnlineUsers);
    socket.on("new_doubt", fetchDoubts);

    socket.on("connect", () => {});
    socket.on("disconnect", () => {});

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_reply", handleNewReply);
      socket.off("notification", handleNotification);
      socket.off("online_users", handleOnlineUsers);
      socket.off("new_doubt", fetchDoubts);
    };
  }, [user?._id, openId]);

  useEffect(() => {
    if (openId) {
      socket.emit("join_doubt", openId);
      fetchReplies(openId);
    }
  }, [openId]);

  useEffect(() => {
    const handleRealtimeUpvote = ({ replyId, upvotesCount }) => {
      setRepliesMap((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((doubtId) => {
          updated[doubtId] = updated[doubtId].map((r) =>
            r._id === replyId ? { ...r, upvotesCount } : r,
          );
        });

        return updated;
      });
    };

    socket.on("reply_upvote", handleRealtimeUpvote);

    return () => socket.off("reply_upvote", handleRealtimeUpvote);
  }, []);

  const fetchDoubts = async () => {
    const res = await getDoubtsApi();
    setDoubts(res.data);
  };

  const fetchReplies = async (id) => {
    const res = await getRepliesApi(id);
    setRepliesMap((prev) => ({
      ...prev,
      [id]: res.data,
    }));
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);

      const res = await askDoubtApi(question);
      setDoubts([res.data, ...doubts]);
      setQuestion("");
      toast.success("Doubt posted");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;

    const res = await addReplyApi(id, replyText);
    socket.emit("send_reply", { ...res.data, doubtId: id });

    setReplyText("");
    fetchReplies(id);
  };

  const handleUpvote = async (replyId, doubtId) => {
    await api.post(`/api/doubts/reply/${replyId}/upvote`);
    fetchReplies(doubtId);
  };

  const toggleOpen = (id) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      socket.emit("join_doubt", id);
      fetchReplies(id);
    }
  };

  const trending = [...doubts]
    .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
    .slice(0, 3);

  const topics = Array.from(
    new Set(
      doubts.flatMap(
        (d) =>
          d.question
            .toLowerCase()
            .match(
              /(react|javascript|node|java|python|dsa|leetcode|system design|interview|aws|docker|sql)/gi,
            ) || [],
      ),
    ),
  ).slice(0, 8);

  const handleBellClick = () => {
    if (showNotif) {
      setNotifications([]);
      setShowNotif(false);
    } else {
      setShowNotif(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <Navbar />
      <div className="lg:ml-64 mt-16 px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="bg-white border-b shadow-sm mb-6 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Community
            </h1>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm text-gray-600">
                {onlineUsers} online
              </span>
              <div className="relative">
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-xl p-4 z-50 max-h-64 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div
                        key={i}
                        className="border-b py-3 text-sm last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{n.message}</p>
                        <span className="text-xs text-gray-500">{n.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
            {/* Ask Doubt Box */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your programming doubt or interview question..."
                className="w-full resize-none mb-4 min-h-25 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleAsk}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 text-sm md:text-base rounded-xl shadow-md transition-all h-12 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Asking...
                  </>
                ) : (
                  "Ask Community + AI"
                )}
              </Button>
            </div>

            {/* Doubts List */}
            {doubts.map((d) => (
              <div
                key={d._id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOpen(d._id)}
                >
                  <h3
                    className="font-semibold text-gray-900 line-clamp-2 wrap-break-word mb-2"
                    title={d.question}
                  >
                    {d.question}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MessageCircle size={16} />
                    {repliesMap[d._id]?.length || 0} replies
                  </div>
                </div>

                {openId === d._id && (
                  <div className="border-t p-4 md:p-6 space-y-4">
                    {/* AI Answer */}
                    <div className="bg-green-50 border rounded-lg p-4">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{d.aiAnswer}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Replies */}
                    <div className="space-y-3">
                      {repliesMap[d._id]?.map((r) => (
                        <div
                          key={r._id}
                          className="bg-gray-50 hover:bg-gray-100 border rounded-lg p-3 md:p-4 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden">
                                {r.user?.avatar ? (
                                  <img
                                    src={r.user.avatar}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                    {(r.user?.fullName || "U")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm text-gray-900 wrap-break-word">
                                  {r.user?.fullName}
                                </p>
                                <p className="text-sm text-gray-700 wrap-break-word mt-1 leading-relaxed">
                                  {r.answer}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUpvote(r._id, d._id)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0"
                            >
                              <ThumbsUp size={16} />
                              {r.upvotesCount || r.upvotes?.length || 0}
                            </button>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-12 text-gray-500">
                          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-sm font-medium">
                            Be the first to reply!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reply Input */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 h-12"
                      />
                      <Button
                        onClick={() => handleReply(d._id)}
                        size="icon"
                        className="h-12 w-12 bg-gray-800 hover:bg-gray-900 text-white shadow-md border-0 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="order-2 lg:order-2 space-y-4 w-full lg:w-auto">
            {/* Trending */}
            <div className="bg-white border rounded-xl shadow-sm p-3 md:p-4 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-3 text-lg">
                🔥 Trending
              </h2>
              {trending.length > 0 ? (
                trending.map((t) => (
                  <p
                    key={t._id}
                    className="text-sm text-gray-700 mb-2 line-clamp-2 wrap-break-word hover:text-blue-600 cursor-pointer p-2 -m-2 rounded-lg transition-colors"
                  >
                    {t.question}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No trending doubts yet
                </p>
              )}
            </div>

            {/* Topics */}
            <div className="bg-white border rounded-xl shadow-sm p-3 md:p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-lg">
                Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs px-2.5 py-1.5 cursor-pointer transition-colors"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
