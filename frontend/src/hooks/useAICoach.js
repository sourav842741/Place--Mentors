import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHistory,
  sendMessage,
  newQuickChat,
  clearChat,
  clearMessages,
  setMessages,
  setCurrentChatId,
  selectMessages,
  selectLoading,
  selectHistory,
  selectHistoryLoading,
  selectCurrentChatId,
} from '../redux/aiCoachSlice';
import api from '../services/api.js';
import { toast } from 'sonner';

const useAICoach = () => {
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectLoading);
  const history = useSelector(selectHistory);
  const historyLoading = useSelector(selectHistoryLoading);
  const currentChatId = useSelector(selectCurrentChatId);

  /* =========================
     LOCAL STATE
  ========================= */
  const [input, setInput] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* =========================
     AUTO SCROLL
  ========================= */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* =========================
     LOAD HISTORY ON MOUNT
  ========================= */
  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  /* =========================
     AUTO FOCUS INPUT
  ========================= */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendHandler = useCallback(async () => {
    const text = input.trim();

    if (!text || loading) return;

    setInput('');

    try {
      await dispatch(
        sendMessage({
          message: text,
          chatId: currentChatId,
        })
      ).unwrap();
    } catch (error) {
      toast.error('Failed to send message');
    }
  }, [input, loading, currentChatId, dispatch]);

  /* =========================
     QUICK PROMPT
  ========================= */
  const quickPromptHandler = useCallback(
    async (type) => {
      try {
        await dispatch(newQuickChat(type)).unwrap();
      } catch (error) {
        toast.error('Failed to generate quick response');
      }
    },
    [dispatch]
  );

  /* =========================
     LOAD OLD CHAT
  ========================= */
  const loadChatHandler = useCallback(
    async (chatId) => {
      try {
        // If backend has single chat route
        const res = await api.get(`/api/ai/coach/${chatId}`);

        const data = res?.data?.data?.data || res?.data?.data || res?.data || {};

        dispatch(setMessages(data.messages || []));
        dispatch(setCurrentChatId(chatId));

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        toast.error('Failed to load chat');
      }
    },
    [dispatch, scrollToBottom]
  );

  /* =========================
     NEW CHAT
  ========================= */
  const newChatHandler = useCallback(() => {
    dispatch(clearMessages());

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [dispatch]);

  /* =========================
     DELETE CURRENT CHAT
  ========================= */
  const clearCurrentChat = useCallback(async () => {
    if (!currentChatId) return;

    const ok = window.confirm('Delete this chat permanently?');

    if (!ok) return;

    try {
      await dispatch(clearChat(currentChatId)).unwrap();

      dispatch(clearMessages());

      toast.success('Chat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  }, [currentChatId, dispatch]);

  /* =========================
     RETURN
  ========================= */
  return {
    // state
    messages,
    loading,
    history,
    historyLoading,
    currentChatId,

    // ui state
    input,
    setInput,
    messagesEndRef,
    inputRef,

    // handlers
    sendHandler,
    quickPromptHandler,
    loadChatHandler,
    newChatHandler,
    clearCurrentChat,
    scrollToBottom,
  };
};

export default useAICoach;
