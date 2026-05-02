import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  MessageSquare,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { chatWithAI } from '@/services/supportApi';
import EscalateTicketModal from './EscalateTicketModal';

const QUICK_ACTIONS = [
  { label: 'Login Issue', icon: '🔐', category: 'Login Issue' },
  { label: 'Payment', icon: '💳', category: 'Payment' },
  { label: 'Premium', icon: '👑', category: 'Premium' },
  { label: 'Resume', icon: '📄', category: 'Resume' },
  { label: 'Interview', icon: '🎤', category: 'Interview' },
  { label: 'Account', icon: '👤', category: 'Account' },
  { label: 'Bug Report', icon: '🐛', category: 'Bug Report' },
  { label: 'Other', icon: '❓', category: 'Other' },
];

const WELCOME_MESSAGE = {
  role: 'ai',
  text: "Hi! I'm your PlaceMentor Support AI. I can help you with login issues, payments, premium access, resume, interviews, and more.\n\nWhat can I help you with today?",
};

export default function AISupportChat() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateData, setEscalateData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride = null) => {
    const text = textOverride || input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await chatWithAI({ message: text, history });
      const { response: aiText, shouldEscalate, isResolved } = response.data.data;

      setMessages((prev) => [...prev, { role: 'ai', text: aiText, shouldEscalate, isResolved }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "I'm having trouble connecting right now. You can try again or create a support ticket directly.",
          shouldEscalate: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const text = `I have a ${action.label} issue`;
    handleSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const buildEscalationData = () => {
    const conversationText = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n\n');

    // Try to infer category from conversation
    let category = 'Other';
    const lowerConv = conversationText.toLowerCase();
    for (const action of QUICK_ACTIONS) {
      if (lowerConv.includes(action.label.toLowerCase())) {
        category = action.category;
        break;
      }
    }

    // Extract a subject line
    const firstUserMsg = messages.find((m) => m.role === 'user')?.text || 'Support Request';
    const subject = firstUserMsg.length > 60 ? firstUserMsg.substring(0, 60) + '...' : firstUserMsg;

    return {
      subject: `AI Escalation: ${subject}`,
      category,
      description: firstUserMsg,
      aiChatSummary: conversationText,
      email: user?.email || '',
    };
  };

  const handleEscalate = () => {
    const data = buildEscalationData();
    setEscalateData(data);
    setShowEscalate(true);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'ai');
  const showEscalateButton = lastAiMessage?.shouldEscalate || messages.length > 4;

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'ai' ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      msg.role === 'user' ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {msg.role === 'ai' ? 'PlaceMentor AI' : 'You'}
                  </span>
                  {msg.role === 'ai' && msg.isResolved && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                      Resolved
                    </Badge>
                  )}
                  {msg.role === 'ai' && msg.shouldEscalate && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                      Needs Human
                    </Badge>
                  )}
                </div>
                <div
                  className={`text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK ACTIONS */}
      {messages.length === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Quick topics:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition-all"
              >
                <span>{action.icon}</span>
                <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ESCALATE BANNER */}
      <AnimatePresence>
        {showEscalateButton && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
              <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Still need help? Our support team can assist you further.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleEscalate}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs h-9 shrink-0"
                >
                  <Ticket className="w-3.5 h-3.5 mr-1.5" />
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT AREA */}
      <div className="sticky bottom-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm pt-2">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Describe your issue..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[48px] max-h-[120px] rounded-xl resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="h-auto px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          AI responses are automated. For sensitive issues, create a ticket.
        </p>
      </div>

      {/* ESCALATE MODAL */}
      {showEscalate && escalateData && (
        <EscalateTicketModal
          open={showEscalate}
          onClose={() => setShowEscalate(false)}
          initialData={escalateData}
        />
      )}
    </div>
  );
}
