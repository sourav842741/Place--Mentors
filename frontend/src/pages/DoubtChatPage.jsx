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
    socket.on("notification", (data) => {
      console.log("🚨 FINAL NOTIFICATION:", data);
    });

    return () => socket.off("notification");
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    // 🔥 ensure connection
    if (!socket.connected) {
      socket.connect();
    }

    // 🔥 JOIN ROOM (FIXED)
    const joinRoom = () => {
      console.log("🔥 JOIN ROOM:", user._id, "Socket:", socket.id);
      socket.emit("join", user._id);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    // 🔥 HANDLERS
    const handleNewReply = ({ doubtId }) => {
      if (openId === doubtId) {
        fetchReplies(doubtId);
      }
    };

    const handleNotification = (data) => {
      console.log("🔥 NOTIFICATION RECEIVED:", data);
      setNotifications((prev) => [data, ...prev]);
      toast.success(data.message);
    };

    const handleOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    // 🔥 LISTENERS
    socket.on("new_reply", handleNewReply);
    socket.on("notification", handleNotification);
    socket.on("online_users", handleOnlineUsers);
    socket.on("new_doubt", fetchDoubts);

    socket.on("connect", () => console.log("🟢 Connected"));
    socket.on("disconnect", () => console.log("🔴 Disconnected"));

    // 🔥 CLEANUP
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
      console.log("🔥 SOCKET UPVOTE:", replyId, upvotesCount);

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
      setLoading(true); // 🔥 start loader

      const res = await askDoubtApi(question);
      setDoubts([res.data, ...doubts]);
      setQuestion("");
      toast.success("Doubt posted 🚀");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // 🔥 stop loader
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

  // 🔥 TRENDING POSTS (top upvotes)
  const trending = [...doubts]
    .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
    .slice(0, 3);

  // 🏷️ DYNAMIC TOPICS
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
      // 🔥 already open → clear & close
      setNotifications([]);
      setShowNotif(false);
    } else {
      // 🔥 closed → open
      setShowNotif(true);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen lg:ml-64 mt-16">
        {/* 🔵 HEADER */}
        <div className="bg-blue-200 text-black p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Community</h1>

          <div className="flex items-center gap-4">
            {/* ONLINE USERS */}
            <span className="text-sm">🟢 {onlineUsers} online</span>

            {/* 🔔 NOTIFICATION */}
            <div className="relative">
              {/* <button onClick={handleBellClick}>
                <Bell />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button> */}

              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded-lg p-3 z-50">
                  {notifications.map((n, i) => (
                    <div key={i} className="border-b py-2 text-sm">
                      <p>{n.message}</p>
                      <span className="text-xs text-gray-500">{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            {/* ASK BOX */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your programming doubt or interview question..."
                className="w-full resize-none mb-4 min-h-[100px]"
              />
              <Button
                onClick={handleAsk}
                disabled={loading} // 🔥 disable button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Asking...
                  </>
                ) : (
                  "Ask Community + AI"
                )}
              </Button>
            </div>

            {/* DOUBTS */}
            {doubts.map((d) => (
              <div key={d._id} className="bg-white p-4 rounded-xl shadow">
                <div
                  onClick={() => toggleOpen(d._id)}
                  className="cursor-pointer"
                >
                  <h3 className="font-semibold line-clamp-2" title={d.question}>
                    {d.question}
                  </h3>

                  <p className="text-xs text-gray-500 flex gap-2 mt-1">
                    <MessageCircle size={14} />
                    {repliesMap[d._id]?.length || 0}
                  </p>
                </div>

                {openId === d._id && (
                  <div className="mt-3 space-y-3">
                    {/* AI */}
                    <div className="bg-green-100 p-3 rounded text-sm">
  <ReactMarkdown>{d.aiAnswer}</ReactMarkdown>
</div>

                    {/* REPLIES */}
                    {repliesMap[d._id]?.map((r) => (
                      <div
                        key={r._id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            {r.user?.avatar ? (
                              <img
                                src={r.user.avatar}
                                alt="avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white rounded-full">
                                <span>
                                  {(r.user?.fullName || "U")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm">
                            <b>{r.user?.fullName}</b> {r.answer}
                          </p>
                        </div>

                        <button
                          onClick={() => handleUpvote(r._id, d._id)}
                          className="text-blue-600 flex gap-1 text-xs"
                        >
                          <ThumbsUp size={14} />
                          {r.upvotesCount || r.upvotes?.length || 0}
                        </button>
                      </div>
                    ))}

                    {/* INPUT */}
                    <div className="flex gap-2 mt-4 p-3 bg-gray-50 rounded-xl">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 h-12"
                      />
                      <Button
                        onClick={() => handleReply(d._id)}
                        size="icon"
                        className="h-12 w-12 bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-900 shadow-lg border-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            {/* TRENDING */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">🔥 Trending</h2>

              {trending.map((t) => (
                <p key={t._id} className="text-sm mb-2">
                  {t.question}
                </p>
              ))}
            </div>

            {/* POPULAR TOPICS */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Topics</h2>

              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-xs px-3 py-1"
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
    </>
  );
}
