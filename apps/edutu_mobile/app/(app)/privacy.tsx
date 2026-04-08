import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useTheme } from "../../components/context/ThemeContext";

const PRIVACY_SECTIONS = [
    {
        title: "Data We Collect",
        desc: "We collect your name, email, and academic progress to personalize your learning experience and track your goals.",
        icon: Eye,
        color: "#3b82f6"
    },
    {
        title: "How We Use It",
        desc: "Your data helps us recommend courses, provide AI guidance, and ensure you earn Credits for your achievements.",
        icon: Shield,
        color: "#8b5cf6"
    },
    {
        title: "Data Protection",
        desc: "All personal information is encrypted. We use industry-standard security protocols to keep your data safe from unauthorized access.",
        icon: Lock,
        color: "#10b981"
    },
    {
        title: "Your Rights",
        desc: "You can request to delete your account or download your data at any time through our help center or by contacting support.",
        icon: Trash2,
        color: "#ef4444"
    }
];

export default function PrivacyScreen() {
    const { isDark, colors } = useTheme();

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
            <ScreenHeader title="Privacy Policy" showBack={true} />

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
            >
                {/* Header Section */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                        <Shield size={32} color={colors.accent} />
                    </View>
                    <Text className="text-xl font-bold text-center" style={{ color: colors.foreground }}>
                        Your Privacy Matters
                    </Text>
                    <Text className="text-sm text-center mt-1" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                        Last updated: April 2026
                    </Text>
                </View>

                {/* Content Sections */}
                {PRIVACY_SECTIONS.map((section, index) => (
                    <Card key={index} variant={isDark ? "glass" : "elevated"} className="p-6 mb-4 border-slate-700/20">
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${section.color}15` }}>
                                <section.icon size={20} color={section.color} />
                            </View>
                            <Text className="font-bold text-base" style={{ color: colors.foreground }}>
                                {section.title}
                            </Text>
                        </View>
                        <Text className="text-xs leading-5" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                            {section.desc}
                        </Text>
                    </Card>
                ))}

                <View className="mt-8 p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                    <Text className="text-[10px] italic leading-4 text-center" style={{ color: isDark ? "#475569" : "#94A3B8" }}>
                        By using Edutu, you agree to our terms of service and this privacy policy. We never sell your personal data to third parties.
                    </Text>
                </View>

                {/* Footer Info */}
                <View className="items-center mt-12 pb-4">
                    <Text className="text-[10px] uppercase font-bold tracking-[0.3em]" style={{ color: isDark ? "#475569" : "#94A3B8" }}>Edutu Legal</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
