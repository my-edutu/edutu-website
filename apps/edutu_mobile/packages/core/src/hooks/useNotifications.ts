import { useState, useCallback, useEffect, useMemo } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppNotification } from '../types/notification';

export function useNotifications(supabase: SupabaseClient, userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data as AppNotification[]);
    } catch (err: any) {
      if (err.code === '22P02') {
        console.error('Error loading notifications: Supabase expects a UUID for user_id, but received a Clerk ID string. Please update the user_id column type in your database to TEXT or map Clerk IDs to UUIDs.');
      } else {
        console.error('Error loading notifications:', err);
      }
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [supabase, userId]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [userId, loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.readAt).length, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    deleteNotification
  };
}
