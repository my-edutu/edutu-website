import { supabase } from '../lib/supabaseClient';

export interface ChatThread {
  id: string;
  title: string | null;
  updated_at: string;
  last_message_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface SendChatMessageResult {
  threadId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  } | null;
}

export async function fetchChatThreads(): Promise<ChatThread[]> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select<ChatThread>('id, title, updated_at, last_message_at, metadata')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchChatMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select<ChatMessage>('id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function archiveChatThread(threadId: string) {
  const { error } = await supabase
    .from('chat_threads')
    .update({ metadata: { archived: true } })
    .eq('id', threadId);

  if (error) {
    throw error;
  }
}

export async function deleteChatThread(threadId: string) {
  const { error } = await supabase
    .from('chat_threads')
    .delete()
    .eq('id', threadId);

  if (error) {
    throw error;
  }
}

export async function renameChatThread(threadId: string, title: string) {
  const { error } = await supabase
    .from('chat_threads')
    .update({ title })
    .eq('id', threadId);

  if (error) {
    throw error;
  }
}

export async function sendChatMessage(options: { threadId?: string | null; message: string }): Promise<SendChatMessageResult> {
  const { data, error } = await supabase.functions.invoke<SendChatMessageResult>('chat-proxy', {
    body: {
      threadId: options.threadId,
      message: options.message
    }
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No response from chat service.');
  }

  return data;
}
