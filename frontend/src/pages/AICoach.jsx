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

      <div className="min-h-screen bg-[#f6f8fc] dark:bg-slate-950 text-slate-900 dark:text-white md:mt-4 lg:mt-1">
        <div className="h-[calc(100vh-64px)] p-2 md:p-3">
          <div className="h-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
            {/* MOBILE TOPBAR */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex-1 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">AI Coach</span>
              </div>
            </div>

            {/* OVERLAY */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* SIDEBAR */}
            <aside
              className={`fixed lg:static top-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}
            >
              <div className="h-full rounded-none lg:rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
                {/* MOBILE CLOSE */}
                <div className="lg:hidden flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Menu</h2>

                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* LOGO */}
                <div className="hidden lg:flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                    <Brain className="w-5 h-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">AI Coach</h2>

                    <p className="text-sm text-slate-500">
                      Your mentor
                    </p>
                  </div>
                </div>

                {/* NEW CHAT */}
                <button
                  onClick={() => {
                    newChatHandler();
                    setSidebarOpen(false);
                  }}
                  className="w-full rounded-2xl py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Chat
                  </span>
                </button>

                {/* QUICK PROMPTS */}
                <div className="mt-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
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
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                      >
                        <Icon className="w-4 h-4 text-blue-600" />

                        <span className="text-sm font-medium">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HISTORY */}
                <div className="mt-5 flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                      History
                    </p>

                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      {history.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {historyLoading ? (
                      <p className="text-sm text-slate-500">
                        Loading...
                      </p>
                    ) : history.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No chats yet
                      </p>
                    ) : (
                      history.map((chat) => (
                        <button
                          key={chat._id}
                          onClick={() => {
                            loadChatHandler(chat._id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition ${
                            currentChatId === chat._id
                              ? "bg-blue-50 border-blue-500 dark:bg-slate-800"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <p className="font-medium text-sm line-clamp-1">
                            {chat.title}
                          </p>

                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {chat.preview}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <main className="h-full rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              {/* HEADER */}
              <div className="px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* <button
                    onClick={() => navigate("/dashboard")}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button> */}

                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>

                  <div>
                    <h1 className="font-bold text-lg">
                      AI Coach
                    </h1>

                    <p className="text-sm text-slate-500">
                      {currentChatId
                        ? "Ongoing conversation"
                        : "Ask anything about placements"}
                    </p>
                  </div>
                </div>

                {currentChatId && (
                  <button
                    onClick={clearCurrentChat}
                    className="p-2.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* CHAT AREA */}
              <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-3 md:px-6 py-4">
                <div className="max-w-5xl mx-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8" />
                      </div>

                      <h2 className="text-2xl font-bold mb-2">
                        Welcome to AI Coach
                      </h2>

                      <p className="max-w-lg text-slate-500 mb-5 text-sm md:text-base">
                        Ask about DSA, resume, interviews,
                        aptitude, roadmap, coding doubts and more.
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {quickPrompts.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => quickPromptHandler(item.id)}
                            className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-sm text-sm font-medium transition"
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
                        className={`flex ${
                          msg.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[92%] md:max-w-[74%] px-4 py-3 rounded-3xl shadow-sm ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {msg.role === "ai" ? (
                            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-pre:rounded-2xl">
                              <ReactMarkdown
                                rehypePlugins={[rehypeHighlight]}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-7 text-[15px]">
                              {msg.text}
                            </p>
                          )}

                          <div
                            className={`mt-2 flex items-center gap-2 text-xs ${
                              msg.role === "user"
                                ? "justify-end text-white/80"
                                : "text-slate-500"
                            }`}
                          >
                            <span>{time(msg.timestamp)}</span>

                            <button
                              onClick={() => copyText(msg.text)}
                              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
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
                      <div className="px-4 py-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* INPUT */}
              <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about DSA, resume, coding interviews..."
                    disabled={loading}
                    className="flex-1 resize-none px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500 min-h-[54px] max-h-36"
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
                    className="w-14 h-14 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 transition"
                  >
                    <MessageCircle
                      className={`w-5 h-5 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500 mt-2">
                  Powered by Gemini + GPT
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AICoach;