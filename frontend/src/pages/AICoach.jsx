import React from "react";
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
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import useAICoach from "../hooks/useAICoach";
import Footer from "@/components/Footer";
import QuizNav from "@/components/QuizNav";

const AICoach = () => {
  const navigate = useNavigate();

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

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const quickPrompts = [
    { id: "dsa", label: "DSA Doubt", icon: BookOpen },
    { id: "resume", label: "Resume Review", icon: FileText },
    { id: "hr", label: "Mock HR", icon: Mic },
    { id: "aptitude", label: "Aptitude", icon: Zap },
    { id: "roadmap", label: "30 Day Roadmap", icon: Map },
    { id: "motivation", label: "Motivation", icon: Sparkles },
    { id: "debug", label: "Debug Code", icon: Bug },
  ];

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const time = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <QuizNav />

      <div className="min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="h-[calc(100vh-64px)] p-2 sm:p-4">
          <div className="h-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            {/* MOBILE TOPBAR */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text hover:bg-surface-2 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex-1 h-10 rounded-lg bg-surface border border-border flex items-center px-3.5 gap-2.5">
                <Brain className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-text">AI Coach</span>
              </div>
            </div>

            {/* OVERLAY */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* SIDEBAR */}
            <aside
              className={`fixed lg:static top-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <div className="h-full rounded-xl bg-surface border border-border shadow-subtle p-4 flex flex-col">
                {/* MOBILE CLOSE */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                  <h2 className="font-bold text-sm text-text">Coach Menu</h2>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* LOGO */}
                <div className="hidden lg:flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-text">AI Coach</h2>
                    <p className="text-xs text-text-muted">Placement & Career Mentor</p>
                  </div>
                </div>

                {/* NEW CHAT */}
                <button
                  onClick={() => {
                    newChatHandler();
                    setSidebarOpen(false);
                  }}
                  className="w-full rounded-lg py-2.5 px-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-soft transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Conversation
                </button>

                {/* QUICK PROMPTS */}
                <div className="mt-4">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-text-muted mb-2 px-1">
                    Quick Prompts
                  </p>

                  <div className="space-y-1">
                    {quickPrompts.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          quickPromptHandler(id);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-2 text-text text-left transition-colors cursor-pointer group"
                      >
                        <Icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HISTORY */}
                <div className="mt-4 flex-1 min-h-0 flex flex-col pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
                      History
                    </p>

                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
                      {history.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {historyLoading ? (
                      <p className="text-xs text-text-muted px-1">Loading chats...</p>
                    ) : history.length === 0 ? (
                      <p className="text-xs text-text-muted px-1">No past chats yet</p>
                    ) : (
                      history.map((chat) => {
                        const isActive = currentChatId === chat._id;
                        return (
                          <button
                            key={chat._id}
                            onClick={() => {
                              loadChatHandler(chat._id);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? "bg-primary-soft/30 border-primary text-text font-medium"
                                : "bg-surface-2/40 border-border hover:bg-surface-2 text-text"
                            }`}
                          >
                            <p className="font-semibold text-xs line-clamp-1">{chat.title}</p>
                            <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">{chat.preview}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="h-full rounded-xl bg-surface border border-border shadow-subtle overflow-hidden flex flex-col">
              {/* HEADER */}
              <div className="px-4 md:px-6 py-3 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>

                  <div>
                    <h1 className="font-bold text-sm sm:text-base text-text">AI Coach</h1>
                    <p className="text-xs text-text-muted">
                      {currentChatId ? "Ongoing conversation" : "Ask anything about DSA, resume, HR, or preparation"}
                    </p>
                  </div>
                </div>

                {currentChatId && (
                  <button
                    onClick={clearCurrentChat}
                    className="p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                    title="Clear Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CHAT MESSAGES */}
              <div className="flex-1 overflow-y-auto bg-bg px-3 md:px-6 py-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
                        <Brain className="w-6 h-6" />
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
                        Welcome to AI Coach
                      </h2>

                      <p className="max-w-md text-text-muted mb-6 text-xs sm:text-sm leading-relaxed">
                        Your personal placement mentor. Ask about coding doubts, resume review,
                        HR scenarios, aptitude, or 30-day prep roadmaps.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
                        {quickPrompts.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => quickPromptHandler(item.id)}
                            className="px-3.5 py-3 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-2 text-xs font-semibold text-text shadow-subtle transition-all cursor-pointer text-center"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[92%] sm:max-w-[78%] px-4 py-3 rounded-xl shadow-subtle ${
                            msg.role === "user"
                              ? "bg-primary text-on-primary rounded-br-xs"
                              : "bg-surface border border-border text-text rounded-bl-xs"
                          }`}
                        >
                          {msg.role === "ai" ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:rounded-lg prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border">
                              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                          )}

                          <div
                            className={`mt-2 flex items-center gap-2 text-[11px] ${
                              msg.role === "user" ? "justify-end text-on-primary/80" : "text-text-muted"
                            }`}
                          >
                            <span>{time(msg.timestamp)}</span>

                            <button
                              onClick={() => copyText(msg.text)}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              title="Copy text"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-xl bg-surface border border-border shadow-subtle">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* INPUT BAR */}
              <div className="p-3 md:p-4 border-t border-border bg-surface">
                <div className="max-w-4xl mx-auto flex gap-2.5 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about DSA, resume, coding interviews..."
                    disabled={loading}
                    className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-surface-2 text-text text-sm placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary focus:border-primary min-h-[46px] max-h-32 leading-normal"
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
                    className="w-11 h-11 rounded-lg bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center disabled:opacity-50 transition-colors shadow-soft cursor-pointer shrink-0"
                    aria-label="Send message"
                  >
                    <MessageCircle className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <p className="text-center text-[11px] text-text-muted mt-2">
                  PlaceMentor AI Career Intelligence
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICoach;
