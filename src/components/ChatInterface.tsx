import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Archive,
  Bot,
  ExternalLink,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  MoreHorizontal,
  Plus,
  Paperclip,
  RefreshCw,
  Send,
  Trash2,
  User,
  Zap,
  Brain,
  Sparkles,
  Users,
} from 'lucide-react';
import Button from './ui/Button';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '../lib/supabaseClient';
import type { AppUser } from '../types/user';
import {
  archiveChatThread as archiveChatThreadService,
  fetchChatMessages as fetchChatMessagesService,
  fetchChatThreads as fetchChatThreadsService,
  sendChatMessage as sendChatMessageService,
} from '../services/chat';

import type {
  ChatMessage as SupabaseChatMessage,
  ChatThread as SupabaseChatThread,
} from '../services/chat';

type MessageActionType = 'scholarship' | 'community' | 'expert' | 'link';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  buttons?: Array<{
    text: string;
    type: MessageActionType;
    data?: Record<string, unknown>;
  }>;
}

interface ChatInterfaceProps {
  user: AppUser | null;
}

type IconType = React.ComponentType<{ size?: number; className?: string }>;

interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  lastMessageAt?: string | null;
  metadata: Record<string, unknown> | null;
}

const DEFAULT_THREAD_TITLE = 'New conversation';

const welcomeMessage = (name?: string): Message => ({
  id: 'welcome',
  type: 'bot',
  content: `Hi ${name || 'there'}! I am Edutu, your AI opportunity coach. I am here to help you uncover scholarships, build skills, and plan your career. What would you like to explore today?`,
  timestamp: new Date(),
});

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage(user?.name)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const { recordChatSession } = useAnalytics();
  const hasRecordedSessionRef = useRef(false);

  const quickPrompts = useMemo<Array<{ text: string; icon: IconType; topic: string }>>(
    () => [
      { text: 'Help me find scholarships', icon: Sparkles, topic: 'Scholarships' },
      { text: 'Career guidance', icon: Brain, topic: 'Career growth' },
      { text: 'Skills to develop', icon: Zap, topic: 'Skill development' },
      { text: 'Networking tips', icon: Users, topic: 'Networking' },
    ],
    [],
  );

  const isThreadArchived = useCallback(
    (metadata: Record<string, unknown> | null) =>
      Boolean((metadata as { archived?: boolean } | null)?.archived),
    [],
  );

  const mapThreadRow = useCallback(
    (row: SupabaseChatThread): ChatThread => ({
      id: row.id,
      title: row.title && row.title.trim().length > 0 ? row.title : DEFAULT_THREAD_TITLE,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      metadata: row.metadata ?? null,
    }),
    [],
  );

  const mapMessageRow = useCallback(
    (row: SupabaseChatMessage): Message => ({
      id: row.id,
      type: row.role === 'user' ? 'user' : 'bot',
      content: row.content,
      timestamp: new Date(row.created_at),
    }),
    [],
  );

  const formatThreadTimestamp = useCallback((iso?: string | null) => {
    if (!iso) return 'Just now';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return 'Just now';
    }
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  const startNewConversation = useCallback(() => {
    setSelectedThreadId(null);
    setMessages([welcomeMessage(user?.name)]);
    hasRecordedSessionRef.current = false;
  }, [user?.name]);

  const loadMessages = useCallback(
    async (threadId: string) => {
      setIsMessagesLoading(true);
      try {
        const rows = await fetchChatMessagesService(threadId);
        if (!rows || rows.length === 0) {
          setMessages([welcomeMessage(user?.name)]);
          hasRecordedSessionRef.current = false;
          return;
        }

        setMessages(rows.map(mapMessageRow));
        hasRecordedSessionRef.current = true;
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setMessages([welcomeMessage(user?.name)]);
        hasRecordedSessionRef.current = false;
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [mapMessageRow, user?.name],
  );

  const loadThreads = useCallback(async () => {
    if (!user?.id) {
      setThreads([]);
      startNewConversation();
      return;
    }

    setIsThreadsLoading(true);
    try {
      const rows = await fetchChatThreadsService();
      const mapped = rows
        .filter((row) => !isThreadArchived(row.metadata ?? null))
        .map(mapThreadRow);

      setThreads(mapped);

      if (mapped.length === 0) {
        startNewConversation();
        return;
      }

      setSelectedThreadId((current) => {
        if (current && mapped.some((thread) => thread.id === current)) {
          void loadMessages(current);
          return current;
        }

        const firstId = mapped[0].id;
        void loadMessages(firstId);
        return firstId;
      });
    } catch (error) {
      console.error('Failed to load chat threads:', error);
      setThreads([]);
      startNewConversation();
    } finally {
      setIsThreadsLoading(false);
    }
  }, [user?.id, isThreadArchived, mapThreadRow, startNewConversation]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId);
      void loadMessages(threadId);
    },
    [loadMessages],
  );

  const handleArchiveThread = useCallback(
    async (threadId: string) => {
      try {
        await archiveChatThreadService(threadId);
        await loadThreads();

        if (selectedThreadId === threadId) {
          startNewConversation();
        }
      } catch (error) {
        console.error('Failed to archive chat thread:', error);
      }
    },
    [loadThreads, selectedThreadId, startNewConversation],
  );

  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      try {
        const { error } = await supabase.from('chat_threads').delete().eq('id', threadId);
        if (error) throw error;

        await loadThreads();
        if (selectedThreadId === threadId) {
          startNewConversation();
        }
      } catch (error) {
        console.error('Failed to delete chat thread:', error);
      }
    },
    [loadThreads, selectedThreadId, startNewConversation],
  );

  const handleSend = useCallback(
    async (overrideText?: string, topic?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text) return;

      if (!user?.id) {
        setMessages((prev) =>
          prev.concat({
            id: `notice-${Date.now()}`,
            type: 'bot',
            content: 'Please sign in with Google to chat with Edutu.',
            timestamp: new Date(),
          }),
        );
        return;
      }

      const sessionTopic = topic ?? 'Custom question';
      if (!hasRecordedSessionRef.current) {
        void recordChatSession(sessionTopic);
        hasRecordedSessionRef.current = true;
      }

      const pendingUserId = `pending-user-${Date.now()}`;
      const pendingBotId = `pending-bot-${Date.now()}`;

      setMessages((prev) => {
        const withoutTyping = prev.filter((message) => !message.isTyping);
        return [
          ...withoutTyping.filter((message) => message.id !== 'welcome'),
          {
            id: pendingUserId,
            type: 'user',
            content: text,
            timestamp: new Date(),
          },
          {
            id: pendingBotId,
            type: 'bot',
            content: '',
            timestamp: new Date(),
            isTyping: true,
          },
        ];
      });

      setInput('');
      setIsTyping(true);

      try {
        const response = await sendChatMessageService({
          threadId: selectedThreadId,
          message: text,
        });

        const nextThreadId = response.threadId;
        setSelectedThreadId(nextThreadId);

        await Promise.all([loadMessages(nextThreadId), loadThreads()]);
      } catch (error) {
        console.error('Failed to send chat message:', error);
        setMessages((prev) =>
          prev
            .filter((message) => message.id !== pendingBotId)
            .concat({
              id: `error-${Date.now()}`,
              type: 'bot',
              content:
                error instanceof Error
                  ? `Sorry, your message could not be sent: ${error.message}`
                  : 'Sorry, your message could not be sent due to an unexpected issue.',
              timestamp: new Date(),
            }),
        );
      } finally {
        setIsTyping(false);
      }
    },
    [input, loadMessages, loadThreads, recordChatSession, selectedThreadId, user?.id],
  );

  const handleQuickPrompt = useCallback(
    (prompt: string, topic: string) => {
      void handleSend(prompt, topic);
    },
    [handleSend],
  );

  const handleButtonClick = useCallback(
    (button: { text: string; type: MessageActionType; data?: Record<string, unknown> }) => {
      switch (button.type) {
        case 'scholarship':
          console.log('Navigate to scholarship:', button.data);
          break;
        case 'community':
          console.log('Navigate to community');
          break;
        case 'expert':
          console.log('Connect with expert');
          break;
        case 'link':
          console.log('Navigate to:', button.data?.url);
          break;
        default:
          break;
      }
    },
    [],
  );

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      void loadThreads();
    } else {
      setThreads([]);
      startNewConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const selectedThread = useMemo(
    () => (selectedThreadId ? threads.find((thread) => thread.id === selectedThreadId) ?? null : null),
    [selectedThreadId, threads],
  );

  const showWelcomePrompts = useMemo(
    () =>
      !isMessagesLoading &&
      messages.length === 1 &&
      messages[0].id === 'welcome' &&
      !!selectedThreadId === false,
    [isMessagesLoading, messages, selectedThreadId],
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex min-h-screen">
        <aside
          className={`hidden lg:flex lg:w-72 flex-col border-r ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                Conversations
              </h2>
              <button
                type="button"
                onClick={() => loadThreads()}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
                }`}
                aria-label="Refresh conversations"
              >
                {isThreadsLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              </button>
            </div>
            <Button onClick={startNewConversation} className="mt-4 w-full justify-center gap-2">
              <Plus size={16} />
              New conversation
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isThreadsLoading && threads.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
            ) : threads.length === 0 ? (
              <div className={`p-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Start a new conversation to see it listed here.
              </div>
            ) : (
              <div className="py-2">
                {threads.map((thread) => {
                  const isActive = selectedThreadId === thread.id;
                  return (
                    <div
                      key={thread.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectThread(thread.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectThread(thread.id);
                        }
                      }}
                      className={`group px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                        isActive
                          ? 'bg-primary/10 border-primary text-primary-foreground'
                          : isDarkMode
                            ? 'hover:bg-gray-800 border-transparent text-gray-200'
                            : 'hover:bg-gray-100 border-transparent text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium truncate">{thread.title}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatThreadTimestamp(thread.lastMessageAt ?? thread.updatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleArchiveThread(thread.id);
                            }}
                            className={`p-1.5 rounded-md transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-500'
                            }`}
                            aria-label="Archive conversation"
                          >
                            <Archive size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteThread(thread.id);
                            }}
                            className={`p-1.5 rounded-md transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-500'
                            }`}
                            aria-label="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <Bot size={24} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                  </div>
                  <div>
                    <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                      Edutu AI Coach
                      <Sparkles size={16} className="text-primary animate-pulse" />
                    </h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {selectedThread ? `Active conversation · ${selectedThread.title}` : 'Online - Ready to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                    <MoreHorizontal size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {threads.length > 0 && (
            <div className={`lg:hidden border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className="px-4 py-3 flex gap-2 overflow-x-auto">
                {threads.map((thread) => {
                  const isActive = selectedThreadId === thread.id;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread.id)}
                      className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {thread.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-40 sm:pb-32">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up px-1`}>
                  <div className={`flex gap-3 max-w-full sm:max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        message.type === 'user'
                          ? isDarkMode
                            ? 'bg-gray-700'
                            : 'bg-gray-200'
                          : 'bg-gradient-to-br from-primary to-accent'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                      ) : (
                        <Bot size={18} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`rounded-2xl px-5 py-4 shadow-sm ${
                          message.type === 'user'
                            ? isDarkMode
                              ? 'bg-primary text-white'
                              : 'bg-primary/10 text-gray-800'
                            : isDarkMode
                              ? 'bg-gray-800 border border-gray-700 text-gray-100'
                              : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="whitespace-pre-line leading-relaxed">{message.content}</p>

                            {message.buttons && message.buttons.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                {message.buttons.map((button, index) => (
                                  <button
                                    key={`${button.text}-${index}`}
                                    onClick={() => handleButtonClick(button)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                      isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {button.type === 'link' && <ExternalLink size={14} />}
                                    {button.text}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {showWelcomePrompts && (
              <div className="space-y-4 animate-slide-up">
                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  <Lightbulb size={16} />
                  <span className="text-sm font-medium">Try asking about:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.text}
                        onClick={() => handleQuickPrompt(prompt.text, prompt.topic)}
                        className={`p-4 text-left ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
                        } border rounded-2xl transition-all hover:scale-105 shadow-sm group`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-700 text-primary' : 'bg-primary/10 text-primary'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            } group-hover:text-primary transition-colors`}
                          >
                            {prompt.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div
        className={`fixed left-0 right-0 lg:left-72 bottom-24 sm:bottom-20 safe-area-bottom ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-t shadow-lg`}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
            <button
              className={`p-3 rounded-2xl flex-shrink-0 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } transition-colors`}
              type="button"
            >
              <Paperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend(undefined, 'Custom question');
                  }
                }}
                placeholder="Ask me anything about opportunities, goals, or career advice..."
                className={`w-full px-5 py-4 rounded-2xl border ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-200 bg-white text-gray-800 placeholder-gray-500'
                } focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm`}
              />
              {input && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>

            <button
              onClick={toggleRecording}
              className={`p-3 rounded-2xl flex-shrink-0 transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <Button
              onClick={() => handleSend(undefined, 'Custom question')}
              disabled={!input.trim() || isTyping}
              className="p-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </Button>
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-3 text-red-500 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm font-medium">Recording... Tap to stop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;