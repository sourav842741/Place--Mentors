import { useEffect, useState } from "react";
import {
  askDoubtApi,
  getDoubtsApi,
  addReplyApi,
  getRepliesApi,
} from "../services/doubtApi";
import { socket } from "../socket";
import { toast } from "sonner";
import { ThumbsUp, Send, MessageCircle, Bell,Circle } from "lucide-react";
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
    <div className="min-h-screen 
bg-gray-100 dark:bg-gray-950 
overflow-x-hidden transition-colors duration-300 lg:ml-5 mt-5">

  <Navbar />

  <div className="md:pl-64 mt-16 px-3 sm:px-4 md:px-6">

    {/* Header */}
    <div className="bg-white dark:bg-gray-900 
    border-b border-gray-200 dark:border-white/10 
    shadow-sm mb-6 p-4 md:p-6 transition">

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
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 
              bg-white dark:bg-gray-900 
              border border-gray-200 dark:border-white/10 
              shadow-lg rounded-xl p-4 z-50 max-h-64 overflow-y-auto">

                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-200 dark:border-gray-700 py-3 text-sm last:border-b-0"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {n.message}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {n.time}
                    </span>
                  </div>
                ))}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* Main */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">

      {/* CENTER */}
      <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">

        {/* Ask Box */}
        <div className="bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-white/10 
        rounded-2xl shadow-sm p-4 md:p-6">

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your programming doubt or interview question..."
            className="w-full resize-none mb-4 min-h-[100px] 
            border border-gray-200 dark:border-white/10 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white 
            rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <Button
            onClick={handleAsk}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-xl cursor-pointer"
          >
            {loading ? "Asking..." : "Ask Community + AI"}
          </Button>
        </div>

        {/* Doubts */}
        {doubts.map((d) => (
          <div
            key={d._id}
            className="bg-white dark:bg-gray-900 
            border border-gray-200 dark:border-white/10 
            rounded-xl shadow-sm overflow-hidden"
          >

            <div
              className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              onClick={() => toggleOpen(d._id)}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {d.question}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle size={16} />
                {repliesMap[d._id]?.length || 0} replies
              </div>
            </div>

            {openId === d._id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 space-y-4">

                {/* AI Answer */}
                <div className="bg-green-50 dark:bg-green-900/20 
                border border-green-200 dark:border-green-800 
                rounded-lg p-4">

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{d.aiAnswer}</ReactMarkdown>
                  </div>
                </div>

                {/* Replies */}
                <div className="space-y-3">

                  {repliesMap[d._id]?.map((r) => (
                    <div
                      key={r._id}
                      className="bg-gray-50 dark:bg-gray-800 
                      hover:bg-gray-100 dark:hover:bg-gray-700 
                      border border-gray-200 dark:border-white/10 
                      rounded-lg p-3 md:p-4 transition"
                    >

                      <div className="flex justify-between items-center">

                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {r.answer}
                        </p>

                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          👍 {r.upvotesCount || 0}
                        </button>

                      </div>

                    </div>
                  ))}

                </div>

                {/* Reply */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 bg-white dark:bg-gray-800 border dark:border-white/10 text-gray-900 dark:text-white"
                  />

                  <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                    <Send className="h-4 w-4" />
                  </Button>

                </div>

              </div>
            )}

          </div>
        ))}

      </div>

      {/* SIDEBAR */}
      <div className="space-y-4">

        <div className="bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-white/10 
        rounded-xl shadow-sm p-4">

          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            🔥 Trending
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No trending doubts yet
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-white/10 
        rounded-xl shadow-sm p-4">

          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Topics
          </h2>

          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic}
                className="bg-gray-200 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300"
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
