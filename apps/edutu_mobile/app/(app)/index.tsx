import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList } from "react-native";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
    Sparkles,
    ChevronRight,
    MessageCircle,
    Target,
    FileText,
    Store,
    Loader2,
    Bell,
    X,
} from "lucide-react-native";
import { useTheme } from "../../components/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { useOpportunities } from "@edutu/core/src/hooks/useOpportunities";
import { Opportunity } from "@edutu/core/src/types/opportunity";

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({
    title,
    value,
    subtitle,
    colors,
    onPress
}: {
    title: string;
    value: string | number;
    subtitle: string;
    colors: [string, string, ...string[]];
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.statCardContainer}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
            >
                <Text style={styles.statCardTitle}>{title}</Text>
                <Text style={styles.statCardValue}>{value}</Text>
                <Text style={styles.statCardSubtitle}>{subtitle}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── Auto-Scroll Banner Component ─────────────────────────────────────────────
const BANNER_ITEMS = [
    { id: '1', title: 'Meet Edutu AI', subtitle: 'Chat now', icon: MessageCircle, route: '/chat', gradient: ['#6366F1', '#8B5CF6'] as [string, string] },
    { id: '2', title: 'Get Mentorship', subtitle: 'Marketplace', icon: Store, route: '/marketplace', gradient: ['#F59E0B', '#EF4444'] as [string, string] },
    { id: '3', title: 'Check Your Goals', subtitle: 'View all', icon: Target, route: '/goals', gradient: ['#10B981', '#059669'] as [string, string] },
    { id: '4', title: 'CV Builder', subtitle: 'Create now', icon: FileText, route: '/cv', gradient: ['#3B82F6', '#6366F1'] as [string, string] },
];

function AutoScrollBanner({ router }: { router: any }) {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % BANNER_ITEMS.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 1500);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const renderItem = ({ item }: { item: typeof BANNER_ITEMS[0] }) => (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => router.push(item.route)}
            style={styles.bannerCard}
        >
            <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
            >
                <View style={styles.bannerContent}>
                    <View style={styles.bannerIconContainer}>
                        <item.icon size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerTitle}>{item.title}</Text>
                        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    </View>
                </View>
                <View style={styles.bannerArrow}>
                    <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.bannerContainer}>
            <FlatList
                ref={flatListRef}
                data={BANNER_ITEMS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                scrollEnabled={false}
                getItemLayout={(_, index) => ({
                    length: width - 40,
                    offset: (width - 40) * index,
                    index,
                })}
            />
            <View style={styles.bannerPagination}>
                {BANNER_ITEMS.map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.paginationDot,
                            idx === currentIndex && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

// ─── Opportunity Card Component ─────────────────────────────────────────────
function OpportunityCard({ item, isDark, textPrimary, textSecondary, onPress }: { 
    item: Opportunity; 
    isDark: boolean; 
    textPrimary: string; 
    textSecondary: string;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onPress}
            style={[styles.opportunityCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF" }]}
        >
            <View style={styles.oppCardHeader}>
                <View style={[styles.oppOrgBadge, { backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#F0F0FF" }]}>
                    <Text style={styles.oppOrgText}>{item.organization}</Text>
                </View>
                <View style={[styles.oppTypeBadge, { backgroundColor: "rgba(99,102,241,0.1)" }]}>
                    <Text style={styles.oppTypeText}>{item.category}</Text>
                </View>
            </View>
            <Text style={[styles.oppTitle, { color: textPrimary }]}>{item.title}</Text>
            <View style={[styles.oppFooter, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Text style={[styles.oppDeadline, { color: textSecondary }]}>
                    {item.deadline ? `Deadline: ${item.deadline}` : 'Rolling deadline'}
                </Text>
                <TouchableOpacity style={styles.oppApplyBtn} onPress={onPress}>
                    <Text style={styles.oppApplyText}>View</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// ─── Opportunity Section Component ───────────────────────────────────────────
function OpportunitySection({ 
    title, 
    data, 
    isDark, 
    showViewMore = true,
    onViewMorePress,
    icon,
    textPrimary,
    textSecondary,
}: { 
    title: string; 
    data: Opportunity[]; 
    isDark: boolean; 
    showViewMore?: boolean;
    onViewMorePress?: () => void;
    icon?: React.ReactNode;
    textPrimary: string;
    textSecondary: string;
}) {
    return (
        <View>
            <View style={styles.sectionHeader}>
                {icon && <View style={[styles.sectionIcon, { backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#F0F0FF" }]}>{icon}</View>}
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>{title}</Text>
                {showViewMore && (
                    <TouchableOpacity onPress={onViewMorePress} style={styles.viewMoreBtn}>
                        <Text style={styles.viewMoreText}>View More</Text>
                        <ChevronRight size={16} color="#6366F1" />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.oppListContainer}>
                {data.map((item) => (
                    <OpportunityCard 
                        key={item.id} 
                        item={item} 
                        isDark={isDark} 
                        textPrimary={textPrimary} 
                        textSecondary={textSecondary}
                        onPress={() => {}}
                    />
                ))}
            </View>
        </View>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { isDark, colors } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const name = user?.firstName || 'Paul';
    const insets = useSafeAreaInsets();

    const backgroundColor = colors.background;
    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';

    // Get user preferences from onboarding (stored in Clerk metadata)
    const userInterests = (user?.unsafeMetadata?.interests as string[]) || [];
    const userCountry = (user?.unsafeMetadata?.country as string) || '';
    
    // Fetch real opportunities from API
    const { data: opportunities, loading: opportunitiesLoading } = useOpportunities({
        supabase,
        userId: user?.id
    });

    // Personalize opportunities based on user preferences from onboarding
    const personalizedOpportunities = useMemo(() => {
        if (!opportunities.length) return [];
        
        return opportunities.map(opp => {
            let matchScore = 0;
            
            // Check category matches user interests
            if (userInterests.some(interest => 
                opp.category.toLowerCase().includes(interest.toLowerCase())
            )) {
                matchScore += 50;
            }
            
            // Check location matches user country
            if (userCountry && opp.location.toLowerCase().includes(userCountry.toLowerCase())) {
                matchScore += 30;
            }
            
            // Check if remote (always good)
            if (opp.location.toLowerCase().includes('remote')) {
                matchScore += 20;
            }
            
            return { ...opp, match: matchScore };
        }).sort((a, b) => b.match - a.match);
    }, [opportunities, userInterests, userCountry]);

    // Featured: Admin-controlled (marked as featured), show max 5
    const featuredOpportunities = useMemo(() => {
        return personalizedOpportunities.filter(o => o.featured).slice(0, 5);
    }, [personalizedOpportunities]);

    // Other: Personalized for user, show 10
    const otherOpportunities = useMemo(() => {
        return personalizedOpportunities.slice(0, 10);
    }, [personalizedOpportunities]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const randomQuote = "Believe you can and you're halfway there.";

    // Loading state
    if (opportunitiesLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
                <View style={[styles.loadingContainer, { backgroundColor }]}>
                    <Loader2 size={40} color="#6366F1" />
                    <Text style={[styles.loadingText, { color: textSecondary }]}>
                        Finding opportunities for you...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Spacer */}
                <View style={{ height: 60 + insets.top }} />

                {/* Greeting Block */}
                <View style={styles.greetingBlock}>
                    <Text style={[styles.greetingText, { color: textPrimary }]}>
                        {greeting}, {name}
                    </Text>
                    <Text style={[styles.quoteText, { color: textSecondary }]}>
                        "{randomQuote}"
                    </Text>
                </View>

                {/* 2x2 Stat Cards */}
                <View style={styles.statGrid}>
                    <StatCard
                        title="ACTIVE GOALS"
                        value="0"
                        subtitle="0 completed"
                        colors={["#3B4FE4", "#6366F1"]}
                        onPress={() => router.push('/goals')}
                    />
                    <StatCard
                        title="NEW OPPORTUNITIES"
                        value={String(personalizedOpportunities.length)}
                        subtitle="For you"
                        colors={["#7C3AED", "#A855F7"]}
                        onPress={() => router.push('/explore')}
                    />
                    <StatCard
                        title="OPPORTUNITIES APPLIED"
                        value="0%"
                        subtitle="Across active goals"
                        colors={["#059669", "#10B981"]}
                    />
                    <StatCard
                        title="NEXT DEADLINE"
                        value="None"
                        subtitle="Set a target"
                        colors={["#D97706", "#F59E0B"]}
                    />
                </View>

                {/* Quick Filter Chips */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.sectionLabel, { color: textSecondary }]}>
                        Browse by Interest
                    </Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20, marginTop: 12 }}
                    >
                        {['All', 'Scholarships', 'Internships', 'Fellowships', 'Grants', 'Programs'].map((chip, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.filterChip,
                                    { 
                                        backgroundColor: chip === 'All' ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                                        borderColor: chip === 'All' ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0')
                                    }
                                ]}
                                onPress={() => {}}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    { color: chip === 'All' ? '#FFFFFF' : textPrimary }
                                ]}>
                                    {chip}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Opportunities Section - Admin Controlled (5 items) */}
                {featuredOpportunities.length > 0 ? (
                    <OpportunitySection 
                        title="Featured Opportunities"
                        data={featuredOpportunities}
                        isDark={isDark}
                        showViewMore={true}
                        onViewMorePress={() => router.push('/explore?filter=featured')}
                        icon={<Sparkles size={20} color="#6366f1" />}
                        textPrimary={textPrimary}
                        textSecondary={textSecondary}
                    />
                ) : null}

                {/* Auto-Scroll Banner */}
                <View style={{ marginTop: 40 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Actions</Text>
                    </View>
                    <AutoScrollBanner router={router} />
                </View>

                {/* Notifications Empty State */}
                <View style={{ marginTop: 40 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Notifications</Text>
                        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.viewMoreBtn}>
                            <Text style={styles.viewMoreText}>View All</Text>
                            <ChevronRight size={16} color="#6366F1" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.emptyStateCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF" }]}>
                        <View style={styles.emptyStateIcon}>
                            <Bell size={32} color="#6366F1" />
                        </View>
                        <Text style={[styles.emptyStateTitle, { color: textPrimary }]}>
                            No Notifications
                        </Text>
                        <Text style={[styles.emptyStateDesc, { color: textSecondary }]}>
                            No notifications available at the moment
                        </Text>
                    </View>
                </View>

                {/* Other Opportunities Section (10 items) - Personalized */}
                <View style={{ marginTop: 40 }}>
                    {otherOpportunities.length > 0 ? (
                        <OpportunitySection 
                            title={userInterests.length ? "Recommended for You" : "Other Opportunities"}
                            data={otherOpportunities}
                            isDark={isDark}
                            showViewMore={true}
                            onViewMorePress={() => router.push('/explore')}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                        />
                    ) : (
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recommended for You</Text>
                        </View>
                    )}
                </View>

                {/* Empty State for No Recommendations */}
                {otherOpportunities.length === 0 && (
                    <View style={[styles.emptyStateCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF" }]}>
                        <View style={styles.emptyStateIcon}>
                            <Target size={32} color="#6366F1" />
                        </View>
                        <Text style={[styles.emptyStateTitle, { color: textPrimary }]}>
                            No Recommendations Yet
                        </Text>
                        <Text style={[styles.emptyStateDesc, { color: textSecondary }]}>
                            Complete your profile to get personalized opportunity suggestions
                        </Text>
                        <TouchableOpacity 
                            style={styles.emptyStateBtn}
                            onPress={() => router.push('/onboarding')}
                        >
                            <Text style={styles.emptyStateBtnText}>Complete Profile</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    greetingBlock: {
        marginTop: 24,
        marginBottom: 32,
    },
    greetingText: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    quoteText: {
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 8,
        lineHeight: 22,
    },
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CARD_GAP,
        marginBottom: 40,
    },
    statCardContainer: {
        width: CARD_WIDTH,
        height: 140,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statCardGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    statCardTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statCardValue: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    statCardSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    // ─── Banner Styles ─────────────────────────────────────────────────────
    bannerContainer: {
        height: 160,
    },
    bannerCard: {
        width: width - 40,
        height: 140,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 12,
    },
    bannerGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    bannerTextContainer: {
        justifyContent: 'center',
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    bannerArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(99,102,241,0.3)',
    },
    paginationDotActive: {
        backgroundColor: '#6366F1',
        width: 20,
    },
    // ─── Opportunity Card Styles ───────────────────────────────────────────
    opportunityCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.1)',
    },
    oppCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    oppOrgBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    oppOrgText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    oppTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    oppTypeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6366F1',
    },
    oppTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    oppFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    oppDeadline: {
        fontSize: 12,
    },
    oppApplyBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    oppApplyText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    oppListContainer: {
        gap: 12,
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    viewMoreText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    // Empty State Styles
    emptyStateCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.1)',
        marginTop: 16,
    },
    emptyStateIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(99,102,241,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyStateDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    emptyStateBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyStateBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});