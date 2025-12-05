// Mock service to replace Firebase support tickets with Supabase
import { supabase } from '../lib/supabaseClient';

export interface SupportTicketInput {
  userId: string;
  subject: string;
  message: string;
  userEmail?: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, unknown>;
}

export interface SupportTicketReplyInput {
  ticketId: string;
  message: string;
  sender: 'user' | 'admin';
}

export async function createSupportTicket(payload: SupportTicketInput) {
  // TODO: Implement actual ticket creation with Supabase when schema is ready
  console.log('Creating support ticket:', payload);
  // For now, return a mock ticket ID
  return `mock-ticket-${Date.now()}`;
}

export async function appendSupportTicketMessage(payload: SupportTicketReplyInput) {
  // TODO: Implement actual message appending with Supabase when schema is ready
  console.log('Appending message to ticket:', payload);
  // For now, return success
  return { success: true };
}