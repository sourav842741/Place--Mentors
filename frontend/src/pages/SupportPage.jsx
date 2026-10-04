import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("ai");
  const [showModal, setShowModal] = useState(false);

  const ticketPrefill = useMemo(() => {
    return location?.state?.ticketPrefill || null;
  }, [location?.state]);

  useEffect(() => {
    if (!ticketPrefill) return;
    setActiveTab("ticket");
    setShowModal(true);
  }, [ticketPrefill]);

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
      <div className="min-h-screen bg-bg text-text lg:pl-64 pt-20 transition-colors duration-200">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                Support Center & Help Desk
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Get assistance from our team or resolve technical questions instantly with AI.
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
                className={`rounded-lg text-xs font-medium h-9 px-4 cursor-pointer transition ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-soft"
                    : "border-border bg-surface text-text hover:bg-surface-2"
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
                <Card className="border border-border bg-surface min-h-[650px] rounded-xl shadow-subtle">
                  <CardContent className="p-4 md:p-6 h-full flex flex-col">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text">
                          AI Support Assistant
                        </h2>
                        <p className="text-xs text-text-muted">
                          Ask your questions. Our trained assistant resolves most queries instantly.
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
                <Card className="border border-border bg-surface rounded-xl shadow-subtle">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-text mb-2">
                      Submit a Support Ticket
                    </h2>
                    <p className="text-xs text-text-muted max-w-md mx-auto mb-6">
                      Need specialized assistance? Open a direct ticket and our team will
                      respond within 24 hours.
                    </p>
                    <Button
                      onClick={() => setShowModal(true)}
                      className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-xs shadow-soft cursor-pointer transition"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create New Ticket
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
                className="space-y-5"
              >
                {/* STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Tickets", value: tickets.length, icon: Inbox, color: "text-primary" },
                    {
                      label: "Open",
                      value: tickets.filter((t) => t.status === "Open").length,
                      icon: AlertCircle,
                      color: "text-accent",
                    },
                    {
                      label: "In Progress",
                      value: tickets.filter((t) => t.status === "In Progress").length,
                      icon: Clock,
                      color: "text-primary",
                    },
                    {
                      label: "Resolved",
                      value: tickets.filter((t) => t.status === "Solved").length,
                      icon: MessageSquare,
                      color: "text-success",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="border border-border bg-surface rounded-xl p-4 flex items-center gap-3 shadow-subtle"
                    >
                      <div className="p-2.5 rounded-lg bg-surface-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">{stat.label}</p>
                        <p className="text-lg font-bold text-text">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FILTERS & SEARCH */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                          activeFilter === f
                            ? "bg-primary text-on-primary shadow-soft"
                            : "border border-border bg-surface text-text hover:bg-surface-2"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <Input
                      placeholder="Search tickets..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 rounded-lg bg-surface-2 border-border text-text placeholder:text-text-subtle text-xs"
                    />
                  </div>
                </div>

                {/* TICKETS LIST */}
                <div className="space-y-3">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-surface-2" />)
                  ) : filteredTickets.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center border border-border bg-surface rounded-xl p-8"
                    >
                      <div className="w-14 h-14 rounded-xl bg-surface-2 flex items-center justify-center mb-3">
                        <Inbox className="w-7 h-7 text-text-subtle" />
                      </div>
                      <h3 className="text-base font-bold text-text">
                        No tickets found
                      </h3>
                      <p className="text-xs text-text-muted mt-1 max-w-sm">
                        {search
                          ? "Try adjusting your search query or filters"
                          : "You haven't submitted any tickets yet."}
                      </p>
                      {!search && (
                        <Button
                          onClick={() => setActiveTab("ticket")}
                          className="mt-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
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
                          <div
                            onClick={() => navigate(`/support/ticket/${ticket._id}`)}
                            className="cursor-pointer border border-border bg-surface hover:border-primary/40 hover:shadow-subtle rounded-xl p-4 transition-all duration-200 group"
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              {/* LEFT */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono font-bold text-primary">
                                    {ticket.ticketId}
                                  </span>
                                  <TicketStatusBadge status={ticket.status} />
                                  <TicketPriorityBadge priority={ticket.priority} />
                                  {ticket.aiEscalated && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-soft text-primary border border-primary/20 flex items-center">
                                      <Bot className="w-3 h-3 mr-1" />
                                      AI Escalated
                                    </span>
                                  )}
                                  {ticket.isReopened && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent border border-accent/20 flex items-center">
                                      <RotateCcw className="w-3 h-3 mr-1" />
                                      Reopened
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-semibold text-text mt-1.5 truncate group-hover:text-primary transition-colors">
                                  {ticket.subject}
                                </h3>
                                <div className="flex items-center gap-2.5 mt-1 text-xs text-text-muted">
                                  <span>{ticket.category}</span>
                                  <span>•</span>
                                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                  {ticket.replyCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-text-subtle">
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
                                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center overflow-hidden border border-border">
                                    <img
                                      src={ticket.image}
                                      alt="attachment"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <ArrowRight className="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          </div>
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
        prefill={ticketPrefill}
      />
    </>
  );
}
