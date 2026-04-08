import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Settings,
    LogOut,
    ChevronRight,
    FileText,
    Bell,
    Trophy,
    Zap,
    TrendingUp,
    Target,
    Sparkles,
    LayoutGrid,
    Shield,
    HelpCircle,
    Award,
    BookOpen,
    MessageCircle
} from 'lucide-react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useTheme } from "../../../components/context/ThemeContext";

export default function ProfileScreen() {
    const { isDark, colors } = useTheme();
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

    const stats = [
        { label: 'Quests', value: '12', icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
        { label: 'Mastered', value: '5', icon: Trophy, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
        { label: 'Streak', value: '12d', icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
        { label: 'Exp', value: '1.2k', icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    ];

    const menuGroups = [
        {
            title: 'Tools',
            items: [
                { id: 'creator', title: 'Creator Studio', desc: 'Build & manage your shop', icon: LayoutGrid, route: '/creator-dashboard', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
                { id: 'cv', title: 'CV Builder', desc: 'Professional profile builder', icon: FileText, route: '/cv', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
                { id: 'chat', title: 'AI Coach', desc: 'Get personalized guidance', icon: MessageCircle, route: '/chat', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { id: 'notifications', title: 'Notifications', desc: 'Stay updated on progress', icon: Bell, route: '/notifications', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
                { id: 'settings', title: 'Settings', desc: 'Theme & app preferences', icon: Settings, route: '/profile/settings', color: '#64748B', bg: 'rgba(100,116,139,0.15)' },
            ]
        },
        {
            title: 'Support',
            items: [
                { id: 'help', title: 'Help & Support', desc: 'FAQ & direct assistance', icon: HelpCircle, route: '/help', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
                { id: 'security', title: 'Privacy', desc: 'Data & visibility control', icon: Shield, route: '/privacy', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
            ]
        }
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <ScreenHeader title="Profile" />
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
            >
                {/* Enhanced Profile Card */}
                <LinearGradient
                    colors={isDark ? ['#1e1b4b', '#312e81'] : ['#e0e7ff', '#c7d2fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 24, padding: 24, marginBottom: 20 }}
                >
                    <View className="flex-row items-center">
                        <View className="relative">
                            <Avatar
                                name={user?.fullName || 'Explorer'}
                                imageUrl={user?.imageUrl}
                                size="lg"
                            />
                            <View className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#1e1b4b]' : 'border-[#e0e7ff]'}`} style={{ backgroundColor: '#10B981' }}>
                                <Text className="text-white text-[10px] font-bold text-center">12</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text className="text-xl font-bold" style={{ color: isDark ? '#fff' : '#1e1b4b' }}>
                                {user?.fullName || 'Explorer'}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Award size={14} color={isDark ? '#a5b4fc' : '#6366f1'} />
                                <Text className="text-xs font-semibold ml-1" style={{ color: isDark ? '#a5b4fc' : '#6366f1' }}>
                                    Level 12 • 1,240 XP
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    <View className="flex-row mt-5">
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <View className="h-2 rounded-full bg-white/20 overflow-hidden">
                                <View className="h-full w-[75%] rounded-full" style={{ backgroundColor: isDark ? '#818cf8' : '#6366f1' }} />
                            </View>
                            <Text className="text-[10px] mt-1" style={{ color: isDark ? '#c7d2fe' : '#6366f1' }}>75% to Level 13</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => router.push('/profile/edit')}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            className="px-4 py-2 rounded-xl"
                        >
                            <Text className="text-xs font-bold" style={{ color: isDark ? '#fff' : '#1e1b4b' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Actions Banner */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push('/onboarding')}
                    style={{ marginBottom: 20 }}
                >
                    <View className="flex-row items-center p-4 rounded-2xl" style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}>
                        <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
                            <Sparkles size={20} color="#6366F1" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text className="font-semibold text-sm" style={{ color: textPrimary }}>Personalize your experience</Text>
                            <Text className="text-xs" style={{ color: textSecondary }}>Get better opportunity matches</Text>
                        </View>
                        <ChevronRight size={18} color={textSecondary} />
                    </View>
                </TouchableOpacity>

                {/* Enhanced Stats Grid */}
                <View className="flex-row justify-between mb-8">
                    {stats.map((stat, i) => (
                        <TouchableOpacity 
                            key={i} 
                            className="items-center flex-1"
                            activeOpacity={0.7}
                        >
                            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: stat.bg }}>
                                <stat.icon size={24} color={stat.color} />
                            </View>
                            <Text className="text-lg font-bold" style={{ color: textPrimary }}>{stat.value}</Text>
                            <Text className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: textSecondary }}>{stat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Menu Groups */}
                {menuGroups.map((group, groupIdx) => (
                    <View key={groupIdx} style={{ marginBottom: 20 }}>
                        <Text className="text-[10px] font-bold uppercase tracking-[0.3em] ml-1 mb-3" style={{ color: textSecondary }}>
                            {group.title}
                        </Text>
                        
                        <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor }}>
                            {group.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => router.push(item.route as any)}
                                    activeOpacity={0.6}
                                    className="flex-row items-center p-4"
                                    style={{ 
                                        backgroundColor: cardBg,
                                        borderBottomWidth: idx < group.items.length - 1 ? 1 : 0,
                                        borderBottomColor: borderColor 
                                    }}
                                >
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: item.bg }}>
                                        <item.icon size={18} color={item.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="font-semibold text-sm" style={{ color: textPrimary }}>{item.title}</Text>
                                        <Text className="text-[11px] mt-0.5" style={{ color: textSecondary }}>{item.desc}</Text>
                                    </View>
                                    <ChevronRight size={16} color={textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={() => signOut()}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-center p-4 mt-4 rounded-2xl"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-rose-500 font-semibold text-sm ml-2">Log Out</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View className="items-center mt-8">
                    <Text className="text-[10px] font-semibold" style={{ color: textSecondary }}>Edutu v1.2</Text>
                    <Text className="text-[9px] mt-1" style={{ color: textSecondary }}>Empowering African Youth</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}