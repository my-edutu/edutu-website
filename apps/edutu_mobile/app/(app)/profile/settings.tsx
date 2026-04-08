import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Moon,
    Shield,
    ChevronRight,
    Smartphone,
    Mail,
    Sun,
    Palette,
    Globe,
    Zap,
    Lock
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useTheme, ThemePackage, ThemeMode } from "../../../components/context/ThemeContext";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";

const THEME_PACKAGES: { id: ThemePackage, name: string, color: string }[] = [
    { id: 'default', name: 'Indigo Pulse', color: '#6366f1' },
    { id: 'ocean', name: 'Ocean Breeze', color: '#0ea5e9' },
    { id: 'sunset', name: 'African Sunset', color: '#f59e0b' },
    { id: 'forest', name: 'Emerald Forest', color: '#10b981' },
    { id: 'royal', name: 'Royal Velvet', color: '#8b5cf6' },
];

export default function SettingsScreen() {
    const { isDark, mode, packageId, setMode, setPackage, colors } = useTheme();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const sectionText = isDark ? '#475569' : '#94A3B8';
    const cardBg = colors.card;
    const borderColor = colors.border;

    const toggleMode = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
            <ScreenHeader title="Settings" showBack />

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            >
                {/* ─── Appearance Protocol ─── */}
                <View className="mb-8">
                    <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-4" style={{ color: sectionText }}>
                        Display Preferences
                    </Text>

                    {/* Dark/Light Toggle */}
                    <Card variant="glass" className="p-4 mb-4 border-white/5">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)' }}>
                                    {isDark ? <Moon size={20} color="#818cf8" /> : <Sun size={20} color="#f59e0b" />}
                                </View>
                                <View>
                                    <Text className="font-bold text-sm" style={{ color: textPrimary }}>Dark Mode</Text>
                                    <Text className="text-[10px]" style={{ color: textSecondary }}>{isDark ? "Easy on the eyes" : "Standard view"}</Text>
                                </View>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleMode}
                                trackColor={{ false: '#e2e8f0', true: colors.accent }}
                                thumbColor="white"
                            />
                        </View>
                    </Card>

                    {/* Theme Gallery */}
                    <Text className="text-[10px] font-bold uppercase tracking-widest ml-2 mb-3" style={{ color: textSecondary }}>
                        Select Theme
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {THEME_PACKAGES.map((pkg) => {
                            const isActive = packageId === pkg.id;
                            return (
                                <TouchableOpacity
                                    key={pkg.id}
                                    onPress={() => setPackage(pkg.id)}
                                    activeOpacity={0.8}
                                    className="mr-3"
                                >
                                    <Card
                                        variant={isActive ? "elevated" : "glass"}
                                        className={`p-3 items-center w-28 border-2 ${isActive ? '' : 'border-transparent'}`}
                                        style={{ borderColor: isActive ? pkg.color : 'transparent', backgroundColor: isActive ? `${pkg.color}15` : cardBg }}
                                    >
                                        <View className="w-10 h-10 rounded-full mb-2 shadow-sm" style={{ backgroundColor: pkg.color }}>
                                            <View className="w-4 h-4 rounded-full bg-white/30 absolute top-2 left-2" />
                                        </View>
                                        <Text className="text-[10px] font-bold text-center" style={{ color: isActive ? colors.accent : textPrimary }}>{pkg.name}</Text>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ─── Communication Protocol ─── */}
                <View className="mb-8">
                    <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-4" style={{ color: sectionText }}>
                        Stay Updated
                    </Text>

                    <Card variant="solid" className="p-1" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <View className="flex-row items-center justify-between p-4 border-b border-white/5">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                                    <Smartphone size={20} color="#3b82f6" />
                                </View>
                                <View>
                                    <Text className="font-bold text-sm" style={{ color: textPrimary }}>Push Notifications</Text>
                                    <Text className="text-[10px]" style={{ color: textSecondary }}>Real-time updates</Text>
                                </View>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: '#e2e8f0', true: colors.accent }}
                                thumbColor="white"
                            />
                        </View>
                        <View className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                                    <Mail size={20} color="#10b981" />
                                </View>
                                <View>
                                    <Text className="font-bold text-sm" style={{ color: textPrimary }}>Email Alerts</Text>
                                    <Text className="text-[10px]" style={{ color: textSecondary }}>Asynchronous news</Text>
                                </View>
                            </View>
                            <Switch
                                value={emailEnabled}
                                onValueChange={setEmailEnabled}
                                trackColor={{ false: '#e2e8f0', true: colors.accent }}
                                thumbColor="white"
                            />
                        </View>
                    </Card>
                </View>

                {/* ─── Linguistic Interface ─── */}
                <View className="mb-8">
                    <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-4" style={{ color: sectionText }}>
                        Language
                    </Text>
                    <Card variant="solid" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <LanguageSelector />
                    </Card>
                </View>

                {/* ─── Security Array ─── */}
                <View className="mb-8">
                    <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-4" style={{ color: sectionText }}>
                        Privacy & Security
                    </Text>
                    <Card variant="solid" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-white/5">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                                    <Lock size={20} color="#ef4444" />
                                </View>
                                <View>
                                    <Text className="font-bold text-sm" style={{ color: textPrimary }}>Password & Keys</Text>
                                    <Text className="text-[10px]" style={{ color: textSecondary }}>Manage account access</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color={textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}>
                                    <Shield size={20} color="#8b5cf6" />
                                </View>
                                <View>
                                    <Text className="font-bold text-sm" style={{ color: textPrimary }}>Privacy</Text>
                                    <Text className="text-[10px]" style={{ color: textSecondary }}>Data visibility settings</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color={textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                <TouchableOpacity
                    className="w-full py-4 items-center justify-center mb-10 rounded-2xl border"
                    style={{ backgroundColor: cardBg, borderColor: borderColor }}
                >
                    <View className="flex-row items-center">
                        <Zap size={14} color={colors.accent} className="mr-2" />
                        <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: textSecondary }}>Help Center</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}