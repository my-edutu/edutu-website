import React, { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
    ChevronLeft, CheckCircle, Award, Star,
    Send, Info, Sparkles, Users
} from 'lucide-react-native';
import { useTheme } from '../components/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { ScreenHeader } from '../components/ui/ScreenHeader';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function CreatorApply() {
    const { user } = useUser();
    const router = useRouter();
    const { isDark, colors } = useTheme();

    const [form, setForm] = useState({
        expertise: '',
        portfolioUrl: '',
        bio: '',
        socialLinks: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';

    const handleApply = async () => {
        if (!form.expertise || !form.bio) {
            Alert.alert('Required', 'Please fill in your expertise and bio.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/creator/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const err = await res.json();
                Alert.alert('Error', err.message || 'Failed to submit application.');
            }
        } catch (e) {
            Alert.alert('Error', 'Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.successContent}>
                    <View style={[styles.successIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <CheckCircle color="#10b981" size={64} />
                    </View>
                    <Text style={[styles.successTitle, { color: textPrimary }]}>Application Received!</Text>
                    <Text style={[styles.successText, { color: textSecondary }]}>
                        Our team will review your profile. You'll receive a notification and an email once your creator status is approved.
                    </Text>
                    <TouchableOpacity
                        style={[styles.backHomeBtn, { backgroundColor: colors.accent }]}
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.backHomeText}>Return to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScreenHeader title="Become a Creator" showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Intro Section */}
                    <View style={styles.introHeader}>
                        <View style={[styles.introIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                            <Sparkles color={colors.accent} size={32} />
                        </View>
                        <Text style={[styles.introTitle, { color: textPrimary }]}>Share Your Brilliance</Text>
                        <Text style={[styles.introDesc, { color: textSecondary }]}>
                            Join our elite community of creators. Share courses, templates, and mentorship to help others grow.
                        </Text>
                    </View>

                    {/* Benefits Row */}
                    <View style={styles.benefitsRow}>
                        <Card variant="glass" style={styles.benefitCard}>
                            <Award color="#10b981" size={20} />
                            <Text style={[styles.benefitText, { color: textPrimary }]}>85% Revenue</Text>
                        </Card>
                        <Card variant="glass" style={styles.benefitCard}>
                            <Users color="#3b82f6" size={20} />
                            <Text style={[styles.benefitText, { color: textPrimary }]}>Global Reach</Text>
                        </Card>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: textSecondary }]}>Area of Expertise</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border }]}
                            placeholder="e.g. Full-Stack Development, UI/UX Design"
                            placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                            value={form.expertise}
                            onChangeText={v => setForm(p => ({ ...p, expertise: v }))}
                        />

                        <Text style={[styles.label, { color: textSecondary }]}>Short Bio</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border, minHeight: 120, textAlignVertical: 'top' }]}
                            placeholder="Tell us about your experience and what you want to create..."
                            placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                            multiline
                            numberOfLines={4}
                            value={form.bio}
                            onChangeText={v => setForm(p => ({ ...p, bio: v }))}
                        />

                        <Text style={[styles.label, { color: textSecondary }]}>Portfolio (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border }]}
                            placeholder="https://yourportfolio.com"
                            placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                            value={form.portfolioUrl}
                            onChangeText={v => setForm(p => ({ ...p, portfolioUrl: v }))}
                            autoCapitalize="none"
                        />

                        <Text style={[styles.label, { color: textSecondary }]}>Social Links (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border }]}
                            placeholder="Twitter: @username, LinkedIn: profile-url"
                            placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                            value={form.socialLinks}
                            onChangeText={v => setForm(p => ({ ...p, socialLinks: v }))}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: colors.accent }, loading && { opacity: 0.7 }]}
                            onPress={handleApply}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Send color="white" size={18} />
                                    <Text style={styles.submitBtnText}>Submit Application</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerNote}>
                            <Info size={14} color={isDark ? "#475569" : "#94a3b8"} />
                            <Text style={[styles.footerNoteText, { color: isDark ? "#475569" : "#94a3b8" }]}>
                                Applications reviewed in 48 hours.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },
    introHeader: { alignItems: 'center', marginBottom: 32 },
    introIcon: { width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    introTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    introDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    benefitsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    benefitCard: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 20, gap: 8 },
    benefitText: { fontSize: 12, fontWeight: '700' },
    formContainer: { gap: 4 },
    label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    input: { borderRadius: 16, padding: 16, fontSize: 15, marginBottom: 20, borderWidth: 1 },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 18, marginTop: 10, marginBottom: 20 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    footerNote: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
    footerNoteText: { fontSize: 12, fontWeight: '500' },
    successContent: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
    successIconBox: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    successText: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    backHomeBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100 },
    backHomeText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

