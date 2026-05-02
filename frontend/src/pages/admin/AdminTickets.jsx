import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MessageSquare,
  Trash2,
  Eye,
  Loader2,
  Ticket,
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUp,
  Shield,
  Send,
  X,
  User,
  ImageIcon,
  ArrowDownUp,
  BarChart3,
  Reply,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTickets } from '@/hooks/useTickets';
import { socket } from '@/socket';
import TicketStatusBadge from '@/components/support/TicketStatusBadge';
import TicketPriorityBadge from '@/components/support/TicketPriorityBadge';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Solved', 'Rejected'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High'];
const CATEGORY_OPTIONS = [
  'All',
  'Login Issue',
  'Payment',
  'Premium',
  'Bug Report',
  'Resume',
  'Interview',
  'Account',
  'Other',
];

export default function AdminTickets() {
  const navigate = useNavigate();
  const {
    tickets,
    ticketDetail,
    replies,
    internalNotes,
    stats,
    loading,
    detailLoading,
    actionLoading,
    pagination,
    loadAllTickets,
    loadTicketStats,
    loadTicketDetail,
    changeStatus,
    removeTicket,
    addReply,
    resetTicketDetail,
  } = useAdminTickets();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [activeTab, setActiveTab] = useState('conversation'); // conversation | internal

  const repliesEndRef = useRef(null);
  const detailScrollRef = useRef(null);

  const loadTickets = useCallback(() => {
    const params = {
      sortBy,
      sortOrder,
    };
    if (statusFilter !== 'All') params.status = statusFilter;
    if (priorityFilter !== 'All') params.priority = priorityFilter;
    if (categoryFilter !== 'All') params.category = categoryFilter;
    if (search.trim()) params.search = search.trim();
    loadAllTickets(params);
  }, [statusFilter, priorityFilter, categoryFilter, search, sortBy, sortOrder, loadAllTickets]);

  useEffect(() => {
    loadTicketStats();
    loadTickets();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder, loadTickets]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTickets();
  };

  const handleViewTicket = (id) => {
    setSelectedTicketId(id);
    setActiveTab('conversation');
    loadTicketDetail(id);
    socket.emit('join_ticket', id);
  };

  const handleCloseDetail = () => {
    if (selectedTicketId) {
      socket.emit('leave_ticket', selectedTicketId);
    }
    setSelectedTicketId(null);
    resetTicketDetail();
    setReplyMessage('');
    setInternalNoteInput('');
  };

  const handleStatusChange = (ticketId, newStatus) => {
    changeStatus(ticketId, newStatus);
  };

  const handleReply = () => {
    if (!replyMessage.trim() || !selectedTicketId) return;
    addReply(selectedTicketId, replyMessage.trim(), false);
    setReplyMessage('');
  };

  const handleAddInternalNote = () => {
    if (!internalNoteInput.trim() || !selectedTicketId) return;
    addReply(selectedTicketId, internalNoteInput.trim(), true);
    setInternalNoteInput('');
  };

  const handleDelete = (ticketId) => {
    removeTicket(ticketId);
    setShowDeleteConfirm(null);
    if (selectedTicketId === ticketId) {
      handleCloseDetail();
    }
  };

  // Auto-scroll replies
  useEffect(() => {
    if (repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [replies, internalNotes, activeTab]);

  const statCards = [
    {
      label: 'Total',
      value: stats?.total || 0,
      icon: Inbox,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Open',
      value: stats?.open || 0,
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Solved',
      value: stats?.solved || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'High Priority',
      value: stats?.highPriority || 0,
      icon: ArrowUp,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 space-y-6 transition-colors duration-300 lg:ml-64">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            Ticket Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and respond to user support tickets in real-time.
          </p>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* CATEGORY STATS */}
      {stats?.categoryStats && stats.categoryStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex gap-2 flex-wrap"
        >
          {stats.categoryStats.map((cat) => (
            <Badge
              key={cat._id}
              variant="outline"
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-xs px-3 py-1"
            >
              <BarChart3 className="w-3 h-3 mr-1 text-blue-500" />
              {cat._id}: {cat.count}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col lg:flex-row gap-3"
      >
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by ID, subject, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </form>

        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => {
              setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
            }}
            title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* TICKETS TABLE */}
      <div className="space-y-3">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No tickets found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* INFO */}
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
                              className="text-[10px] bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              Reopened
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1 truncate">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="font-medium">{ticket.category}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{ticket.email}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.replyCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {ticket.replyCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2">
                        <Select
                          value={ticket.status}
                          onValueChange={(val) => handleStatusChange(ticket._id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-9 rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-lg"
                          onClick={() => handleViewTicket(ticket._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setShowDeleteConfirm(ticket._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* TICKET DETAIL DIALOG */}
      <Dialog
        open={!!selectedTicketId}
        onOpenChange={(val) => {
          if (!val) handleCloseDetail();
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl p-0 gap-0">
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <DialogHeader className="m-0">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-500" />
                Ticket Details
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={handleCloseDetail}
            >
              {/* <X className="w-4 h-4" /> */}
            </Button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : !ticketDetail ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              Failed to load ticket details
            </div>
          ) : (
            <div className="flex flex-col h-[calc(92vh-120px)]">
              {/* SCROLLABLE CONTENT */}
              <div ref={detailScrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Ticket Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                    {ticketDetail.ticketId}
                  </span>
                  <TicketStatusBadge status={ticketDetail.status} />
                  <TicketPriorityBadge priority={ticketDetail.priority} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ticketDetail.subject}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">User</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {ticketDetail.user?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {ticketDetail.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {ticketDetail.category}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(ticketDetail.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
                    Description
                  </p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {ticketDetail.description}
                  </p>
                </div>

                {/* Image */}
                {ticketDetail.image && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium">
                      Attachment
                    </p>
                    <div
                      className="relative w-full max-w-xs h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition group"
                      onClick={() => setShowImage(ticketDetail.image)}
                    >
                      <img
                        src={ticketDetail.image}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add(
                            'bg-gray-100',
                            'dark:bg-gray-800',
                            'flex',
                            'items-center',
                            'justify-center'
                          );
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* TABS */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeTab === 'conversation' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('conversation')}
                    className={`rounded-full text-xs ${activeTab === 'conversation' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Conversation ({replies.length})
                  </Button>
                  {internalNotes.length > 0 && (
                    <Button
                      size="sm"
                      variant={activeTab === 'internal' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('internal')}
                      className={`rounded-full text-xs ${activeTab === 'internal' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : ''}`}
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Internal ({internalNotes.length})
                    </Button>
                  )}
                </div>

                {/* CONVERSATION */}
                {activeTab === 'conversation' && (
                  <div className="space-y-3">
                    {replies.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <Reply className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>No replies yet. Start the conversation below.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {replies.map((reply) => {
                          const isAdmin =
                            reply.senderRole === 'admin' || reply.senderRole === 'superadmin';

                          return (
                            <div
                              key={reply._id}
                              className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                                  isAdmin
                                    ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${isAdmin ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-white/20'}`}
                                  >
                                    {isAdmin ? (
                                      <Shield className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                                    ) : (
                                      <User className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span
                                    className={`font-semibold text-xs ${isAdmin ? 'text-purple-700 dark:text-purple-300' : 'opacity-90'}`}
                                  >
                                    {isAdmin
                                      ? reply.sender?.fullName || 'Support Team'
                                      : reply.sender?.fullName || 'User'}
                                  </span>
                                  <span
                                    className={`text-[10px] ml-auto ${isAdmin ? 'text-gray-400' : 'opacity-60'}`}
                                  >
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p
                                  className={`whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-gray-900 dark:text-white' : ''}`}
                                >
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={repliesEndRef} />
                      </div>
                    )}
                  </div>
                )}

                {/* INTERNAL NOTES */}
                {activeTab === 'internal' && (
                  <div className="space-y-3">
                    {internalNotes.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No internal notes.
                      </p>
                    ) : (
                      internalNotes.map((note) => (
                        <div
                          key={note._id}
                          className="rounded-xl p-3.5 text-sm bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Shield className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold text-xs text-orange-800 dark:text-orange-200">
                              {note.sender?.fullName || 'Admin'}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                            {note.message}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={repliesEndRef} />
                  </div>
                )}
              </div>

              {/* STICKY REPLY INPUT */}
              <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50">
                {activeTab === 'conversation' ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply to the user..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="rounded-xl resize-none min-h-[80px] bg-white dark:bg-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                      <Button
                        onClick={handleReply}
                        disabled={actionLoading || !replyMessage.trim()}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Add Internal Note (visible only to admins)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Internal note..."
                        value={internalNoteInput}
                        onChange={(e) => setInternalNoteInput(e.target.value)}
                        className="rounded-xl bg-white dark:bg-gray-900"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddInternalNote();
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={handleAddInternalNote}
                        disabled={actionLoading || !internalNoteInput.trim()}
                        className="rounded-xl"
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Ticket?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This will permanently delete the ticket and all its replies. This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(showDeleteConfirm)}
              className="rounded-xl"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* IMAGE ENLARGE MODAL */}
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
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
