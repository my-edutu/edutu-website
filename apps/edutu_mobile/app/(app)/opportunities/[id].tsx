import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Share,
    Image,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    GraduationCap,
    Clock,
    MapPin,
    Users,
    ExternalLink,
    Share2,
    Bookmark,
    BookmarkCheck,
    ChevronLeft,
    Award,
    Globe,
    TrendingUp,
    Sparkles
} from 'lucide-react-native';
import { useTheme } from '../../../components/context/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { getOpportunity } from '@edutu/core/src/services/opportunities';
import { Opportunity } from '@edutu/core/src/types/opportunity';

export default function OpportunityDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    const backgroundColor = colors.background;
    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const cardBg = colors.card;
    const borderColor = colors.border;

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getOpportunity(id);
                setOpportunity(data);
            } catch (error) {
                console.error('Failed to fetch opportunity:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id]);

    const handleApply = useCallback(async () => {
        if (opportunity?.applyUrl) {
            try {
                await Linking.openURL(opportunity.applyUrl);
            } catch (error) {
                console.error('Failed to open URL:', error);
            }
        }
    }, [opportunity?.applyUrl]);

    const handleShare = useCallback(async () => {
        if (opportunity) {
            try {
                await Share.share({
                    title: opportunity.title,
                    message: `Check out this opportunity: ${opportunity.title}\n\n${opportunity.description?.substring(0, 100)}...\n\n${opportunity.applyUrl || 'https://edutu.ai'}`,
                });
            } catch (error) {
                console.error('Failed to share:', error);
            }
        }
    }, [opportunity]);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'scholarship': '#8B5CF6',
            'job': '#10B981',
            'course': '#3B82F6',
            'mentorship': '#EC4899',
            'internship': '#6366F1',
            'fellowship': '#F97316',
            'bootcamp': '#84CC16',
            'competition': '#EF4444',
        };
        return colors[category?.toLowerCase()] || '#94A3B8';
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#6366F1" size="large" />
                    <Text style={{ color: textSecondary, marginTop: 12 }}>Loading opportunity...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!opportunity) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Globe size={48} color={textSecondary} />
                    <Text style={{ color: textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Opportunity not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12, backgroundColor: '#6366F1', borderRadius: 12 }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const daysUntilDeadline = opportunity.deadline
        ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const categoryColor = getCategoryColor(opportunity.category);

    const headerStyle = StyleSheet.compose(styles.header, { borderBottomColor: borderColor });
    const backBtnStyle = StyleSheet.compose(styles.backBtn, { backgroundColor: cardBg });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
            <View style={headerStyle}>
                <TouchableOpacity onPress={() => router.back()} style={backBtnStyle}>
                    <ChevronLeft size={20} color={textSecondary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setSaved(!saved)} style={{ padding: 8 }}>
                    {saved ? <BookmarkCheck size={22} color="#6366F1" /> : <Bookmark size={22} color={textSecondary} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
                    <Share2 size={22} color={textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.heroImage}>
                    {opportunity.image ? (
                        <Image source={{ uri: opportunity.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ width: '100%', height: '100%', backgroundColor: cardBg, alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={48} color={textSecondary} />
                        </View>
                    )}
                    {opportunity.featured && (
                        <View style={styles.featuredBadge}>
                            <Sparkles size={12} color="white" />
                            <Text style={styles.featuredText}>Featured</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
                            <Text style={[styles.categoryText, { color: categoryColor }]}>{opportunity.category}</Text>
                        </View>
                        {opportunity.difficulty && (
                            <View style={[styles.difficultyBadge, { backgroundColor: '#F59E0B15' }]}>
                                <Text style={[styles.difficultyText, { color: '#F59E0B' }]}>{opportunity.difficulty}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.title, { color: textPrimary }]}>{opportunity.title}</Text>
                    <Text style={[styles.org, { color: textSecondary }]}>{opportunity.organization}</Text>

                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
                            <MapPin size={16} color={textSecondary} />
                            <Text style={[styles.statText, { color: textSecondary }]} numberOfLines={1}>
                                {opportunity.location || 'Remote'}
                            </Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
                            <Users size={16} color={textSecondary} />
                            <Text style={[styles.statText, { color: textSecondary }]}>
                                {opportunity.applicants || '500+'} applied
                            </Text>
                        </View>
                    </View>

                    {daysUntilDeadline !== null && (
                        <View style={[styles.deadlineCard, { backgroundColor: cardBg, borderColor: daysUntilDeadline <= 30 ? '#EF4444' : borderColor }]}>
                            <Clock size={20} color={daysUntilDeadline <= 30 ? '#EF4444' : '#10B981'} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={[styles.deadlineLabel, { color: textSecondary }]}>Deadline</Text>
                                <Text style={[styles.deadlineValue, { color: textPrimary }]}>
                                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'Closed'}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: textPrimary }]}>About</Text>
                    <Text style={[styles.description, { color: textSecondary }]}>
                        {opportunity.description}
                    </Text>

                    {opportunity.requirements && opportunity.requirements.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Requirements</Text>
                            <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
                                {opportunity.requirements.map((req, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <View style={[styles.listDot, { backgroundColor: '#6366F1' }]} />
                                        <Text style={[styles.listText, { color: textSecondary }]}>{req}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {opportunity.benefits && opportunity.benefits.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Benefits</Text>
                            <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
                                {opportunity.benefits.map((benefit, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <Award size={16} color="#10B981" />
                                        <Text style={[styles.listText, { color: textSecondary, marginLeft: 12 }]}>{benefit}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                        <ExternalLink size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        height: 200,
        position: 'relative',
    },
    featuredBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    featuredText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    content: {
        padding: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '700',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 32,
    },
    org: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    deadlineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    deadlineLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    deadlineValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    listCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    listDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
        marginRight: 12,
    },
    listText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    applyButton: {
        backgroundColor: '#6366F1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 8,
        marginBottom: 40,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});