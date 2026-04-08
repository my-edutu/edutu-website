import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Bell,
    Target,
    Award,
    Users,
    AlertTriangle,
    Zap,
    CheckCircle,
    Trash2,
    Calendar
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '@edutu/core/src/hooks/useNotifications';
import { AppNotification } from '@edutu/core/src/types/notification';

export default function NotificationsScreen() {
    const { user } = useUser();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        deleteNotification
    } = useNotifications(supabase, user?.id || null);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => filter === 'unread' ? !n.readAt : true);
    }, [notifications, filter]);

    const getIcon = (kind: AppNotification['kind'], severity: AppNotification['severity']) => {
        const size = 18;
        switch (kind) {
            case 'goal-reminder': return <Target size={size} color="#6366f1" />;
            case 'goal-weekly-digest': return <Calendar size={size} color="#4f46e5" />;
            case 'goal-progress': return <Award size={size} color="#10b981" />;
            case 'opportunity-highlight': return <Users size={size} color="#8b5cf6" />;
            case 'admin-broadcast': return <AlertTriangle size={size} color="#f59e0b" />;
            default: return <Bell size={size} color="#94A3B8" />;
        }
    };

    const renderNotification = ({ item }: { item: AppNotification }) => {
        const isUnread = !item.readAt;
        return (
            <TouchableOpacity
                onPress={() => markAsRead(item.id)}
                className={`flex-row p-4 mb-3 rounded-2xl border ${isUnread ? 'bg-brand-500/10 border-brand-500/20' : 'bg-slate-800/40 border-slate-800'
                    }`}
            >
                {isUnread && <View className="absolute left-0 top-4 bottom-4 w-1 bg-brand-500 rounded-r-full" />}

                <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center mr-4">
                    {getIcon(item.kind, item.severity)}
                </View>

                <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                        <Text className={`font-bold text-sm flex-1 ${isUnread ? 'text-white' : 'text-slate-400'}`}>
                            {item.title}
                        </Text>
                        <Text className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter ml-2">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text className={`text-xs leading-relaxed ${isUnread ? 'text-slate-300' : 'text-slate-500'}`} numberOfLines={2}>
                        {item.body}
                    </Text>

                    <View className="flex-row justify-end mt-3">
                        <TouchableOpacity
                            onPress={() => deleteNotification(item.id)}
                            className="p-1"
                        >
                            <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScreenHeader title="Neural Stream" showBack />

            <View className="flex-1 px-5">
                {/* Filter Tabs */}
                <View className="flex-row my-6 p-1 bg-slate-800/50 rounded-xl self-start">
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg ${filter === 'all' ? 'bg-white' : ''}`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === 'all' ? 'text-slate-900' : 'text-slate-500'}`}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('unread')}
                        className={`px-6 py-2 rounded-lg ${filter === 'unread' ? 'bg-white' : ''}`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === 'unread' ? 'text-slate-900' : 'text-slate-500'}`}>
                            Unread ({unreadCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredNotifications}
                        keyExtractor={item => item.id}
                        renderItem={renderNotification}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 opacity-40">
                                <Bell size={48} color="#475569" />
                                <Text className="text-white font-bold text-lg mt-4 uppercase italic">Stream Empty</Text>
                                <Text className="text-text-secondary text-xs mt-2 uppercase tracking-widest">No transmissions detected</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
