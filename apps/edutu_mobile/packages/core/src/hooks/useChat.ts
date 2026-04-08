import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { 
  fetchChatThreads, 
  fetchChatMessages, 
  sendChatMessage, 
  archiveChatThread,
  deleteChatThread
} from '../services/chat';
import { ChatThread, ChatMessage } from '../types/chat';

export interface UseChatOptions {
  supabase: SupabaseClient;
  userId: string | null;
  onSessionRecorded?: (topic: string) => void;
}

export function useChat({ supabase, userId, onSessionRecorded }: UseChatOptions) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRecordedSessionRef = useRef(false);

  const loadThreads = useCallback(async () => {
    if (!userId) {
      setThreads([]);
      return;
    }

    setIsLoadingThreads(true);
    setError(null);
    try {
      const data = await fetchChatThreads(supabase);
      // Filter out archived threads if needed (based on metadata)
      const activeThreads = data.filter(t => !t.metadata?.archived);
      setThreads(activeThreads);
    } catch (err) {
      console.error('Failed to load chat threads:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoadingThreads(false);
    }
  }, [supabase, userId]);

  const loadMessages = useCallback(async (threadId: string) => {
    setIsLoadingMessages(true);
    setError(null);
    try {
      const data = await fetchChatMessages(supabase, threadId);
      setMessages(data);
      hasRecordedSessionRef.current = data.length > 0;
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [supabase]);

  const selectThread = useCallback((threadId: string | null) => {
    setSelectedThreadId(threadId);
    if (threadId) {
      loadMessages(threadId);
    } else {
      setMessages([]);
      hasRecordedSessionRef.current = false;
    }
  }, [loadMessages]);

  const sendMessage = useCallback(async (content: string, topic?: string) => {
    if (!userId || !content.trim()) return;

    if (!hasRecordedSessionRef.current && onSessionRecorded) {
      onSessionRecorded(topic || 'Custom question');
      hasRecordedSessionRef.current = true;
    }

    setIsSending(true);
    setError(null);

    // Optimistically add user message? 
    // For now, let's wait for the response to keep it simple and consistent with the service.

    try {
      const result = await sendChatMessage(supabase, {
        threadId: selectedThreadId,
        message: content
      });

      if (!selectedThreadId) {
        setSelectedThreadId(result.threadId);
        await loadThreads();
      }

      setMessages(prev => [...prev, result.userMessage, result.assistantMessage]);
      return result;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [supabase, userId, selectedThreadId, onSessionRecorded, loadThreads]);

  const archiveThread = useCallback(async (threadId: string) => {
    try {
      await archiveChatThread(supabase, threadId);
      await loadThreads();
      if (selectedThreadId === threadId) {
        selectThread(null);
      }
    } catch (err) {
      console.error('Failed to archive thread:', err);
      setError('Failed to archive conversation');
    }
  }, [supabase, loadThreads, selectedThreadId, selectThread]);

  const removeThread = useCallback(async (threadId: string) => {
    try {
      await deleteChatThread(supabase, threadId);
      await loadThreads();
      if (selectedThreadId === threadId) {
        selectThread(null);
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
      setError('Failed to delete conversation');
    }
  }, [supabase, loadThreads, selectedThreadId, selectThread]);

  useEffect(() => {
    if (userId) {
      loadThreads();
    } else {
      setThreads([]);
      selectThread(null);
    }
  }, [userId, loadThreads, selectThread]);

  return {
    threads,
    messages,
    selectedThreadId,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    error,
    loadThreads,
    loadMessages,
    selectThread,
    sendMessage,
    archiveThread,
    removeThread
  };
}
