import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  AlertCircle,
  Inbox,
  Ticket,
  ArrowRight,
  RotateCcw,
  Bot,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTickets } from "@/hooks/useTickets";
import CreateTicketModal from "@/components/support/CreateTicketModal";
import AISupportChat from "@/components/support/AISupportChat";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";

const STATUS_FILTERS = ["All", "Open", "In Progress", "Solved", "Rejected"];
const TABS = [
  { id: "ai", label: "Ask AI First", icon: Bot },

  { id: "list", label: "My Tickets", icon: FolderOpen },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { tickets, loading, actionLoading, loadMyTickets, createTicket } = useTickets();

  useEffect(() => {
    if (activeTab === "list") {
      loadMyTickets({
        status: activeFilter === "All" ? undefined : activeFilter,
      });
    }
  }, [activeTab, activeFilter, loadMyTickets]);

  const handleCreateTicket = (formData) => {
    createTicket(formData);
  };

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:pl-64 pt-16 transition-colors duration-300">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                Support Center
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Get help from our team. Track and manage your tickets.
              </p>
            </div>
          </motion.div>

          {/* TABS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-2 flex-wrap"
          >
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full text-xs font-medium h-10 px-4 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {/* TAB CONTENT */}
          <AnimatePresence mode="wait">
            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[700px]">
                  <CardContent className="p-4 md:p-6 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          AI Support Assistant
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Chat with our AI first. It solves most issues instantly.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <AISupportChat />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "ticket" && (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Raise a Support Ticket
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                      Can't find a solution? Create a ticket directly and our support team will
                      assist you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setShowModal(true)}
                      className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Ticket
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: tickets.length, icon: Inbox, color: "text-blue-500" },
                    {
                      label: "Open",
                      value: tickets.filter((t) => t.status === "Open").length,
                      icon: AlertCircle,
                      color: "text-amber-500",
                    },
                    {
                      label: "In Progress",
                      value: tickets.filter((t) => t.status === "In Progress").length,
                      icon: Clock,
                      color: "text-purple-500",
                    },
                    {
                      label: "Solved",
                      value: tickets.filter((t) => t.status === "Solved").length,
                      icon: MessageSquare,
                      color: "text-green-500",
                    },
                  ].map((stat) => (
                    <Card
                      key={stat.label}
                      className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* FILTERS & SEARCH */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={activeFilter === f ? "default" : "outline"}
                        onClick={() => setActiveFilter(f)}
                        className={`rounded-full text-xs font-medium ${
                          activeFilter === f
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  <div className="relative flex-1 sm:max-w-xs ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* TICKETS LIST */}
                <div className="space-y-3">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
                  ) : filteredTickets.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Inbox className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        No tickets found
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        {search
                          ? "Try adjusting your search or filters"
                          : "You haven't created any tickets yet. Need help? Create your first ticket."}
                      </p>
                      {!search && (
                        <Button
                          onClick={() => setActiveTab("ticket")}
                          className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Ticket
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {filteredTickets.map((ticket, index) => (
                        <motion.div
                          key={ticket._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            onClick={() => navigate(`/support/ticket/${ticket._id}`)}
                            className="cursor-pointer border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                          >
                            <CardContent className="p-4 md:p-5">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                {/* LEFT */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                                      {ticket.ticketId}
                                    </span>
                                    <TicketStatusBadge status={ticket.status} />
                                    <TicketPriorityBadge priority={ticket.priority} />
                                    {ticket.aiEscalated && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                                      >
                                        <Bot className="w-3 h-3 mr-1" />
                                        AI Escalated
                                      </Badge>
                                    )}
                                    {ticket.isReopened && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                                      >
                                        <RotateCcw className="w-3 h-3 mr-1" />
                                        Reopened
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1.5 truncate">
                                    {ticket.subject}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{ticket.category}</span>
                                    <span>•</span>
                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    {ticket.replyCount > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          {ticket.replyCount}{" "}
                                          {ticket.replyCount === 1 ? "reply" : "replies"}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* RIGHT */}
                                <div className="flex items-center gap-2 self-end md:self-auto">
                                  {ticket.image && (
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                      <img
                                        src={ticket.image}
                                        alt="attachment"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  )}
                                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />

      <CreateTicketModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTicket}
        loading={actionLoading}
      />
    </>
  );
}
