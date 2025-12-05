import React, { useMemo, useState } from 'react';
import {
  X,
  Bell,
  Award,
  Calendar,
  Target,
  Users,
  CheckCircle,
  Trash2,
  MailSearch as MarkEmailRead,
  Filter,
  AlertTriangle,
  Zap
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../types/notification';

interface NotificationInboxProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationInbox: React.FC<NotificationInboxProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const { isDarkMode } = useDarkMode();

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        filter === 'unread' ? !notification.readAt : true
      ),
    [filter, notifications]
  );

  const formatTimestamp = (iso: string) => {
    if (!iso) return 'Just now';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.round(diffMs / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return date.toLocaleString();
  };

  const iconForNotification = (kind: AppNotification['kind'], severity: AppNotification['severity']) => {
    switch (kind) {
      case 'goal-reminder':
        return <Target size={16} className="text-primary" />;
      case 'goal-weekly-digest':
        return <Calendar size={16} className="text-indigo-500" />;
      case 'goal-progress':
        return <Award size={16} className="text-emerald-500" />;
      case 'opportunity-highlight':
        return <Users size={16} className="text-purple-500" />;
      case 'admin-broadcast':
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return severity === 'critical'
          ? <Zap size={16} className="text-red-500" />
          : <Bell size={16} className="text-gray-600" />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={onClose} />

      <div className={`relative mt-16 mr-4 w-full max-w-md rounded-3xl border shadow-xl ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Stay on top of opportunities, goal progress, and community updates.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-full p-2 transition hover:opacity-80 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <Card className="m-4 rounded-2xl border border-dashed border-subtle bg-transparent">
          <div className={`flex items-center justify-between gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Filter</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-primary text-white'
                    : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {loading ? 'Syncing...' : unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                onClick={() => void markAllAsRead()}
                className="text-sm px-3 py-1"
              >
                <MarkEmailRead size={14} className="mr-1" />
                Mark all as read
              </Button>
            )}
          </div>
        </Card>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`notification-skeleton-${index}`}
                  className={`animate-pulse rounded-2xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-2/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className={`h-3 w-full rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Bell size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread'
                  ? 'You’re all caught up!'
                  : 'We’ll notify you when something important happens.'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
                    notification.readAt
                      ? `${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`
                      : `${isDarkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => void markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {iconForNotification(notification.kind, notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} line-clamp-1`}>
                          {notification.title}
                        </h4>
                        {!notification.readAt && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                        {notification.body}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.readAt && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void markAsRead(notification.id);
                              }}
                              className="rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Mark as read"
                            >
                              <CheckCircle size={14} className="text-green-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void deleteNotification(notification.id);
                            }}
                            className="rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Delete notification"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center">
          {hasMore ? (
            <Button
              variant="secondary"
              onClick={() => void fetchMore()}
              className="w-full"
            >
              Load older notifications
            </Button>
          ) : (
            <div className={`flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <CheckCircle size={14} className="text-primary/70" />
              Synced to latest
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationInbox;
