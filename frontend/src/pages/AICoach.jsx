import React, { useState } from "react";
import {
  Brain,
  MessageCircle,
  Bot,
  Copy,
  Trash2,
  Plus,
  BookOpen,
  FileText,
  Mic,
  Map,
  Sparkles,
  Bug,
  Zap,
  Send,
  Code2,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  RefreshCw,
  Clock,
  Compass,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import useAICoach from "../hooks/useAICoach";
import Navbar from "@/components/Navbar";
import useAuth from "../hooks/useAuth";

// Quick Prompts metadata
const QUICK_PROMPTS = [
  { id: "dsa", label: "DSA Doubt", icon: BookOpen, desc: "Step-by-step logic & complexity" },
  { id: "resume", label: "Resume Review", icon: FileText, desc: "Bullet points & ATS optimization" },
  { id: "hr", label: "Mock HR", icon: Mic, desc: "STAR behavioral answers" },
  { id: "aptitude", label: "Aptitude", icon: Zap, desc: "Quant & reasoning tricks" },
  { id: "roadmap", label: "30 Day Roadmap", icon: Map, desc: "Daily placement preparation guide" },
  { id: "debug", label: "Debug Code", icon: Bug, desc: "Fix errors & algorithmic bugs" },
  { id: "motivation", label: "Strategy & Mindset", icon: Sparkles, desc: "Stay focused & overcome burnout" },
];

// Suggested prompt suggestions for one-click insertion
const SUGGESTED_QUESTIONS = [
  "Explain time vs space complexity of Merge Sort",
  "How should I answer: 'What is your biggest weakness?'",
  "Review my project section on resume for SDE-1",
  "Give me 5 hard questions on Binary Trees",
];

const AICoach = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    messages,
    loading,
    history,
    historyLoading,
    input,
    setInput,
    sendHandler,
    quickPromptHandler,
    loadChatHandler,
    newChatHandler,
    clearCurrentChat,
    currentChatId,
    messagesEndRef,
    inputRef,
  } = useAICoach();

  // On large screens, drawer is open by default; on mobile, it starts closed
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatTimestamp = (val) => {
    if (!val) return "";
    return new Date(val).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // User initials for message avatar
  const getUserInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <Navbar />

      {/* Global content wrapper aligned with the fixed Navbar and sidebar */}
      <div className="pt-16 lg:pt-16 lg:pl-64 h-screen bg-bg text-text transition-colors duration-200 flex flex-col overflow-hidden">
        
        {/* TOP COACH RIBBON */}
        <header className="h-14 sm:h-16 px-4 md:px-6 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Desktop Drawer Toggle */}
            <button
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="hidden lg:flex p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 border border-border transition-colors cursor-pointer"
              title={drawerOpen ? "Hide Coach Menu" : "Show Coach Menu"}
            >
              {drawerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 border border-border transition-colors cursor-pointer"
              aria-label="Open sessions drawer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Coach Title & Status */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-text leading-tight">
                    AI Career Coach
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                    Placement Pro
                  </span>
                </div>
                <p className="text-[11px] text-text-muted hidden sm:block">
                  {currentChatId ? "Active session in progress" : "24/7 technical, behavioral & interview mentor"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {currentChatId && (
              <button
                onClick={clearCurrentChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 text-xs font-semibold transition active:scale-95 cursor-pointer"
                title="Delete current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Chat</span>
              </button>
            )}

            <button
              onClick={newChatHandler}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE: DRAWER + MAIN CHAT CONTAINER */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* ================= COACH DRAWER (DESKTOP) ================= */}
          {drawerOpen && (
            <aside className="hidden lg:flex w-72 h-full border-r border-border bg-surface flex-col shrink-0 overflow-hidden transition-all duration-300">
              <div className="p-3.5 border-b border-border">
                <button
                  onClick={newChatHandler}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-surface-2 hover:bg-primary hover:text-on-primary border border-border hover:border-transparent text-text text-xs font-bold transition-all shadow-xs cursor-pointer group"
                >
                  <Plus className="w-4 h-4 text-primary group-hover:text-on-primary transition" />
                  <span>Start New Chat</span>
                </button>
              </div>

              {/* QUICK PROMPTS */}
              <div className="p-3 border-b border-border/80">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted px-1.5 mb-2 flex items-center justify-between">
                  <span>Quick Modes</span>
                  <Compass className="w-3 h-3 text-text-muted" />
                </p>
                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                  {QUICK_PROMPTS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => quickPromptHandler(id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-text hover:bg-surface-2 hover:text-primary text-left text-xs font-medium transition cursor-pointer group"
                    >
                      <Icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CHAT HISTORY */}
              <div className="flex-1 min-h-0 flex flex-col p-3">
                <div className="flex items-center justify-between px-1.5 mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                    Past Sessions
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                    {history.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {historyLoading ? (
                    <div className="p-4 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading chats...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-muted/70">
                      No past conversations yet.
                    </div>
                  ) : (
                    history.map((chat) => {
                      const isActive = currentChatId === chat._id;
                      return (
                        <button
                          key={chat._id}
                          onClick={() => loadChatHandler(chat._id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/10 border-primary text-text shadow-xs"
                              : "bg-surface-2/30 border-border/60 hover:bg-surface-2 text-text hover:border-border"
                          }`}
                        >
                          <p className="font-bold text-xs truncate leading-snug">
                            {chat.title || "Career Chat"}
                          </p>
                          <p className="text-[11px] text-text-muted truncate mt-0.5">
                            {chat.preview || "No message preview"}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* ================= MOBILE DRAWER OVERLAY ================= */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileDrawerOpen(false)}
              />

              <div className="relative w-80 max-w-[85%] h-full bg-surface border-r border-border p-4 flex flex-col shadow-2xl z-10">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-extrabold text-sm text-text">Coach Sessions</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-3">
                  <button
                    onClick={() => {
                      newChatHandler();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start New Chat</span>
                  </button>
                </div>

                {/* Mobile Quick Prompts */}
                <div className="mb-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">
                    Quick Prompts
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.slice(0, 6).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          quickPromptHandler(id);
                          setMobileDrawerOpen(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 text-text text-left text-xs font-medium hover:text-primary transition"
                      >
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile History */}
                <div className="flex-1 overflow-y-auto space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">
                    History ({history.length})
                  </p>
                  {history.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => {
                        loadChatHandler(chat._id);
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl border border-border bg-surface-2/40 text-text text-xs"
                    >
                      <p className="font-bold truncate">{chat.title || "Career Chat"}</p>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{chat.preview}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= MAIN CHAT AREA ================= */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-bg/50">
            
            {/* MESSAGES VIEWPORT */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 space-y-6">
              
              {/* EMPTY STATE / WELCOME HERO */}
              {messages.length === 0 ? (
                <div className="max-w-3xl mx-auto py-8 sm:py-12 flex flex-col items-center text-center">
                  {/* Glowing ambient badge */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/25">
                      <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
                        <Bot className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2">
                    Welcome to AI Career Coach
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted max-w-lg mb-8 leading-relaxed">
                    Your 24/7 dedicated placement strategist. Ask anything about technical DSA, system design, resume review, mock HR interview questions, or personalized roadmaps.
                  </p>

                  {/* High Impact Topic Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full text-left">
                    {QUICK_PROMPTS.slice(0, 6).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => quickPromptHandler(item.id)}
                          className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-2/60 shadow-sm transition-all text-left group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                            {item.label}
                          </h3>
                          <p className="text-[11px] text-text-muted mt-1 leading-snug">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* MESSAGE STREAM */
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    const isCopied = copiedIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {/* AI Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 mt-1 shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`max-w-[90%] sm:max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                          
                          {/* Message Bubble */}
                          <div
                            className={`p-4 rounded-2xl shadow-sm text-sm ${
                              isUser
                                ? "bg-primary text-on-primary rounded-tr-xs"
                                : "bg-surface border border-border text-text rounded-tl-xs"
                            }`}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                {msg.text}
                              </p>
                            ) : (
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:rounded-xl prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border text-text">
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                  {msg.text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Action & Timestamp Row */}
                          <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-text-muted">
                            <span>{formatTimestamp(msg.timestamp)}</span>
                            <span>•</span>
                            <button
                              onClick={() => copyText(msg.text, idx)}
                              className="inline-flex items-center gap-1 hover:text-text transition cursor-pointer"
                              title="Copy text"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow-xs">
                            {getUserInitials(user?.fullName || user?.name || "You")}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* LOADING ANIMATION */}
                  {loading && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-surface border border-border flex items-center gap-2 text-xs text-text-muted shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300" />
                        </div>
                        <span className="font-medium text-text">AI Coach is thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* INPUT SECTION */}
            <div className="border-t border-border bg-surface/90 backdrop-blur-md p-3 sm:p-4 shrink-0">
              <div className="max-w-3xl mx-auto space-y-2.5">
                
                {/* SUGGESTED PROMPT CHIPS */}
                {messages.length === 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(q);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-surface-2 border border-border hover:border-primary/40 text-text-muted hover:text-text whitespace-nowrap text-[11px] font-medium transition cursor-pointer shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* TEXTAREA & SEND BUTTON */}
                <div className="relative flex items-end gap-2 bg-surface-2/70 border border-border rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition shadow-xs">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about DSA, system design, mock interview questions, or paste code..."
                    disabled={loading}
                    className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-xs sm:text-sm text-text placeholder:text-text-muted focus:outline-none min-h-[42px] max-h-36 leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendHandler();
                      }
                    }}
                  />

                  <button
                    onClick={sendHandler}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center disabled:opacity-40 transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
                    aria-label="Send message"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px] font-mono">Shift + Enter</kbd> for new line</span>
                  <span className="hidden sm:inline">PlaceMentor AI Career Engine</span>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default AICoach;
