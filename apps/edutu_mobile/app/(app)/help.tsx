import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronRight,
    HelpCircle,
    MessageCircle,
    Mail,
    Globe,
    ChevronDown,
    ChevronUp
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useTheme } from "../../components/context/ThemeContext";

const FAQS = [
    {
        question: "How do I use Edutu AI?",
        answer: "You can access Edutu AI from the center button on your navigation bar. Simply type your question about courses, career guidance, or skills, and it will assist you instantly."
    },
    {
        question: "How do I enroll in a course?",
        answer: "Navigate to the 'Market' tab, find a course you're interested in, and click 'Access Now'. Some courses require Credits, while others are free."
    },
    {
        question: "How do I earn Credits?",
        answer: "You can earn Credits by participating in featured opportunities, completing quests, or contributing as a creator. Check your wallet for more details."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we use industry-standard encryption and Clerk for authentication to ensure your personal information and academic progress are always protected."
    }
];

function FAQItem({ item, isDark, colors }: { item: typeof FAQS[0], isDark: boolean, colors: any }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            className="mb-3"
        >
            <Card variant={isDark ? "glass" : "elevated"} className="p-4 border-slate-700/30">
                <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-sm flex-1 mr-4" style={{ color: colors.foreground }}>
                        {item.question}
                    </Text>
                    {expanded ? (
                        <ChevronUp size={18} color={colors.accent} />
                    ) : (
                        <ChevronDown size={18} color={isDark ? "#475569" : "#94a3b8"} />
                    )}
                </View>
                {expanded && (
                    <Text className="mt-3 text-xs leading-5" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                        {item.answer}
                    </Text>
                )}
            </Card>
        </TouchableOpacity>
    );
}

export default function HelpScreen() {
    const { isDark, colors } = useTheme();

    const handleContactEmail = () => {
        Linking.openURL('mailto:support@edutu.com');
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
            <ScreenHeader title="Help & Support" showBack={true} />

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
            >
                {/* Header Section */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
                        <HelpCircle size={32} color={colors.accent} />
                    </View>
                    <Text className="text-xl font-bold text-center" style={{ color: colors.foreground }}>
                        How can we help?
                    </Text>
                    <Text className="text-sm text-center mt-1" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                        Find answers to common questions or reach out.
                    </Text>
                </View>

                {/* FAQ Section */}
                <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-4" style={{ color: isDark ? "#475569" : "#94A3B8" }}>
                    Frequently Asked Questions
                </Text>

                {FAQS.map((faq, index) => (
                    <FAQItem key={index} item={faq} isDark={isDark} colors={colors} />
                ))}

                {/* Contact Section */}
                <Text className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mt-8 mb-4" style={{ color: isDark ? "#475569" : "#94A3B8" }}>
                    Direct Support
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleContactEmail}
                    className="mb-4"
                >
                    <Card variant="glass" className="p-5 border-brand-500/20">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                                <Mail size={22} color="#10b981" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-base" style={{ color: colors.foreground }}>Email Support</Text>
                                <Text className="text-xs" style={{ color: "#10b981" }}>support@edutu.com</Text>
                            </View>
                            <ChevronRight size={18} color={isDark ? "#475569" : "#94a3b8"} />
                        </View>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL('https://edutu.com')}
                >
                    <Card variant="glass" className="p-5 border-brand-500/20">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                                <Globe size={22} color="#3b82f6" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-base" style={{ color: colors.foreground }}>Visit Website</Text>
                                <Text className="text-xs" style={{ color: "#3b82f6" }}>www.edutu.com</Text>
                            </View>
                            <ChevronRight size={18} color={isDark ? "#475569" : "#94a3b8"} />
                        </View>
                    </Card>
                </TouchableOpacity>

                {/* Footer Info */}
                <View className="items-center mt-12 pb-4">
                    <Text className="text-[10px] uppercase font-bold tracking-[0.3em]" style={{ color: isDark ? "#475569" : "#94A3B8" }}>Edutu Help Center</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
