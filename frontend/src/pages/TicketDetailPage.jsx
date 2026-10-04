import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  MessageSquare,
  Clock,
  User,
  Shield,
  ImageIcon,
  Loader2,
  X,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTickets } from "@/hooks/useTickets";
import { socket } from "@/socket";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);
  const repliesContainerRef = useRef(null);

  const {
    ticketDetail,
    replies,
    detailLoading,
    actionLoading,
    loadTicketDetail,
    addReply,
    reopenTicket,
    resetTicketDetail,
  } = useTickets();

  const [message, setMessage] = useState("");
  const [showImage, setShowImage] = useState(null);

  useEffect(() => {
    loadTicketDetail(id);

    // Join ticket room for real-time updates
    socket.emit("join_ticket", id);

    return () => {
      resetTicketDetail();
      socket.emit("leave_ticket", id);
    };
  }, [id, loadTicketDetail, resetTicketDetail]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!message.trim() || actionLoading) return;
    addReply(id, message.trim());
    setMessage("");
  };

  const handleReopen = () => {
    reopenTicket(id);
  };

  const isClosed = ["Solved", "Rejected"].includes(ticketDetail?.status);

  if (detailLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:pl-64 pt-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </>
    );
  }

  if (!ticketDetail) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:pl-64 pt-16 flex flex-col items-center justify-center p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ticket not found</h2>
          <Button onClick={() => navigate("/support")} className="mt-4 rounded-xl">
            Back to Support
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-text lg:pl-64 pt-20 transition-colors duration-200">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/support")}
              className="w-fit rounded-lg border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono font-bold text-primary">
                  {ticketDetail.ticketId}
                </span>
                <TicketStatusBadge status={ticketDetail.status} />
                <TicketPriorityBadge priority={ticketDetail.priority} />
              </div>
              <h1 className="text-xl font-bold text-text mt-1">
                {ticketDetail.subject}
              </h1>
            </div>

            {ticketDetail.status === "Solved" && (
              <Button
                onClick={handleReopen}
                disabled={actionLoading}
                variant="outline"
                className="rounded-lg border-primary/30 text-primary hover:bg-primary-soft"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reopen
              </Button>
            )}
          </motion.div>

          {/* TICKET INFO CARD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-border bg-surface text-text">
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted">Category</p>
                    <p className="font-semibold text-text">
                      {ticketDetail.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Created</p>
                    <p className="font-semibold text-text">
                      {new Date(ticketDetail.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Email</p>
                    <p className="font-semibold text-text truncate">
                      {ticketDetail.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Replies</p>
                    <p className="font-semibold text-text">
                      {ticketDetail.replyCount || 0}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div>
                  <p className="text-text-muted text-sm mb-1">Description</p>
                  <p className="text-text whitespace-pre-wrap">
                    {ticketDetail.description}
                  </p>
                </div>

                {/* AI Chat Summary */}
                {ticketDetail.aiEscalated && ticketDetail.aiChatSummary && (
                  <div className="bg-primary-soft/40 border border-primary/20 rounded-xl p-4">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary w-full text-left">
                        <Bot className="w-4 h-4" />
                        <span>AI Chat Summary (for support team)</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Separator className="my-3 opacity-50 bg-border" />
                        <p className="text-sm text-text whitespace-pre-wrap leading-relaxed font-mono">
                          {ticketDetail.aiChatSummary}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {ticketDetail.image && (
                  <div>
                    <p className="text-text-muted text-sm mb-2">Attachment</p>
                    <div
                      className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden border border-border bg-surface-2 cursor-pointer hover:opacity-90 transition"
                      onClick={() => setShowImage(ticketDetail.image)}
                    >
                      <img
                        src={ticketDetail.image}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add(
                            "bg-surface-2",
                            "flex",
                            "items-center",
                            "justify-center"
                          );
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* REPLIES */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Conversation
              <span className="text-sm font-normal text-text-muted">
                ({replies.length})
              </span>
            </h2>

            {replies.length === 0 ? (
              <div className="text-center py-10 text-text-muted">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No replies yet. Our team will respond shortly.</p>
              </div>
            ) : (
              <div ref={repliesContainerRef} className="space-y-3">
                {replies.map((reply, index) => {
                  const isAdmin = reply.senderRole === "admin" || reply.senderRole === "superadmin";
                  const isMe = reply.sender?._id === user?._id;

                  return (
                    <motion.div
                      key={reply._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 ${
                          isAdmin
                            ? "bg-surface border border-border text-text"
                            : "bg-primary text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isAdmin ? (
                            <Shield className="w-4 h-4 text-primary" />
                          ) : (
                            <User className="w-4 h-4 opacity-80" />
                          )}
                          <span
                            className={`text-xs font-semibold ${isAdmin ? "text-primary" : "opacity-90"}`}
                          >
                            {isAdmin
                              ? "Support Team"
                              : isMe
                                ? "You"
                                : reply.sender?.fullName || "User"}
                          </span>
                          <span
                            className={`text-xs ml-auto ${isAdmin ? "text-text-muted" : "opacity-60"}`}
                          >
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* REPLY INPUT */}
          {!isClosed && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSendReply}
              className="sticky bottom-4 bg-surface border border-border rounded-xl p-4 shadow-card z-10"
            >
              <div className="flex gap-3">
                <Textarea
                  placeholder="Type your reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] rounded-lg resize-none bg-surface-2 border-border text-text placeholder:text-text-subtle"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={actionLoading || !message.trim()}
                  className="h-auto px-4 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </motion.form>
          )}

          {isClosed && (
            <div className="text-center py-6 text-text-muted bg-surface-2 rounded-xl border border-border">
              <p>This ticket is {ticketDetail.status.toLowerCase()}.</p>
              {ticketDetail.status === "Solved" && (
                <p className="text-sm mt-1">You can reopen it if the issue persists.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImage(null)}
        >
          <div className="relative">
            <button
              onClick={() => setShowImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={showImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
