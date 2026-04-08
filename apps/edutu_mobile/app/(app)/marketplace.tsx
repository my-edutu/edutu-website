import {
    View, Text, FlatList, TextInput,
    StyleSheet, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView, RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Search, BookOpen, Star, Users, Sparkles,
    X, Clock, ChevronRight, Globe, Plus, ArrowLeft
} from "lucide-react-native";
import { useState, useMemo, useCallback } from "react";
import { useTheme } from "../../components/context/ThemeContext";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useCommunity } from "@edutu/core/src/hooks/useCommunity";
import { CommunityStory } from "@edutu/core/src/types/community";

const CATEGORY_FILTERS = ['All', 'Education', 'Programming', 'Business', 'Career', 'Community'];

export default function Marketplace() {
    const { isDark, colors } = useTheme();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedItem, setSelectedItem] = useState<CommunityStory | null>(null);

    const { data: stories, loading, refresh } = useCommunity({
        supabase,
        queryOptions: {
            type: ['roadmap', 'marketplace'],
            status: 'approved'
        }
    });

    const backgroundColor = colors.background;
    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const cardBg = colors.card;
    const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
    const borderColor = colors.border;

    const filteredStories = useMemo(() => {
        const term = search.trim().toLowerCase();
        return stories.filter((story: CommunityStory) => {
            if (category !== 'All' && story.category !== category) return false;
            if (!term) return true;
            return (
                story.title.toLowerCase().includes(term) ||
                story.summary.toLowerCase().includes(term) ||
                story.creator.name.toLowerCase().includes(term)
            );
        });
    }, [stories, search, category]);

    const renderCard = useCallback(({ item }: { item: CommunityStory }) => {
        const categoryColor = getCategoryColor(item.category);
        const rating = item.stats?.rating || 0;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: cardBg, borderColor }]}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.85}
            >
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.cardImagePlaceholder, { backgroundColor: `${categoryColor}10` }]}>
                            <BookOpen color={categoryColor} size={32} />
                        </View>
                    )}
                    <View style={styles.ratingFloatingBadge}>
                        <Star color="#F59E0B" size={10} fill="#F59E0B" />
                        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={[styles.priceText, item.price === 'Free' ? { color: '#10B981' } : { color: '#6366F1' }]}>
                            {item.price}
                        </Text>
                        <View style={styles.userCount}>
                            <Users size={12} color={textSecondary} />
                            <Text style={[styles.userCountText, { color: textSecondary }]}>
                                {(item.stats?.users || 0).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [cardBg, borderColor, textPrimary, textSecondary]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color={textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <Text style={[styles.title, { color: textPrimary }]}>Marketplace</Text>
                <Text style={[styles.subtitle, { color: textSecondary }]}>Discover proven career trajectories</Text>

                <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor }]}>
                    <Search color={textSecondary} size={18} />
                    <TextInput
                        placeholder="Search roadmaps..."
                        placeholderTextColor={textSecondary}
                        style={[styles.searchInput, { color: textPrimary }]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8 }}>
                    {CATEGORY_FILTERS.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterChip,
                                { borderColor },
                                category === cat && styles.filterChipActive
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                { color: textSecondary },
                                category === cat && styles.filterChipTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={[styles.loadingText, { color: textSecondary }]}>Loading roadmaps...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCard}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#6366F1" />
                    }
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: textSecondary }]}>No roadmaps found.</Text>
                    }
                />
            )}

            <Modal visible={!!selectedItem} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor }]}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedItem(null)}>
                            <X color={textPrimary} size={18} />
                        </TouchableOpacity>
                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalImageContainer}>
                                    {selectedItem.image ? (
                                        <Image source={{ uri: selectedItem.image }} style={styles.modalImage} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.modalImagePlaceholder, { backgroundColor: `${getCategoryColor(selectedItem.category)}15` }]}>
                                            <BookOpen color={getCategoryColor(selectedItem.category)} size={48} />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.modalBody}>
                                    <View style={styles.modalHeaderRow}>
                                        <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(selectedItem.category)}15` }]}>
                                            <Text style={[styles.categoryBadgeText, { color: getCategoryColor(selectedItem.category) }]}>
                                                {selectedItem.category?.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRating}>
                                            <Star color="#F59E0B" size={14} fill="#F59E0B" />
                                            <Text style={[styles.modalRatingText, { color: textPrimary }]}>{(selectedItem.stats?.rating || 0).toFixed(1)}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.modalTitle, { color: textPrimary }]}>{selectedItem.title}</Text>
                                    <Text style={[styles.modalDescription, { color: textSecondary }]}>{selectedItem.summary}</Text>

                                    <View style={styles.statsGrid}>
                                        <View style={[styles.statBox, { backgroundColor: inputBg }]}>
                                            <Text style={[styles.statLabel, { color: textSecondary }]}>Difficulty</Text>
                                            <Text style={[styles.statValue, { color: textPrimary }]}>{selectedItem.difficulty}</Text>
                                        </View>
                                        <View style={[styles.statBox, { backgroundColor: inputBg }]}>
                                            <Text style={[styles.statLabel, { color: textSecondary }]}>Learners</Text>
                                            <Text style={[styles.statValue, { color: textPrimary }]}>{(selectedItem.stats?.users || 0).toLocaleString()}</Text>
                                        </View>
                                        <View style={[styles.statBox, { backgroundColor: inputBg }]}>
                                            <Text style={[styles.statLabel, { color: textSecondary }]}>Success</Text>
                                            <Text style={[styles.statValue, { color: textPrimary }]}>{selectedItem.successRate}%</Text>
                                        </View>
                                        <View style={[styles.statBox, { backgroundColor: inputBg }]}>
                                            <Text style={[styles.statLabel, { color: textSecondary }]}>Access</Text>
                                            <Text style={[styles.statValue, { color: textPrimary }]}>{selectedItem.price}</Text>
                                        </View>
                                    </View>

                                    {selectedItem.roadmap && selectedItem.roadmap.length > 0 && (
                                        <View style={styles.roadmapSection}>
                                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Curriculum</Text>
                                            {selectedItem.roadmap.map((stage, idx) => (
                                                <View key={stage.id} style={[styles.stageCard, { backgroundColor: inputBg }]}>
                                                    <View style={styles.stageHeader}>
                                                        <View style={styles.stageNumber}>
                                                            <Text style={styles.stageNumberText}>{idx + 1}</Text>
                                                        </View>
                                                        {stage.duration && (
                                                            <View style={styles.stageDuration}>
                                                                <Clock size={12} color="#6366F1" />
                                                                <Text style={styles.stageDurationText}>{stage.duration}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={[styles.stageTitle, { color: textPrimary }]}>{stage.title}</Text>
                                                    {stage.description && (
                                                        <Text style={[styles.stageDescription, { color: textSecondary }]}>{stage.description}</Text>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.enrollBtn}
                                        onPress={() => {
                                            setSelectedItem(null);
                                            router.push(`/goals/new?template=${selectedItem.id}`);
                                        }}
                                    >
                                        <Sparkles size={18} color="white" />
                                        <Text style={styles.enrollBtnText}>Get This Trajectory</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        'Education': '#6366F1',
        'Programming': '#3B82F6',
        'Business': '#10B981',
        'Career': '#8B5CF6',
        'Community': '#F59E0B',
    };
    return colors[category] || '#94A3B8';
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(99,102,241,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    title: { fontSize: 32, fontWeight: "bold" },
    subtitle: { fontSize: 15, marginTop: 4, marginBottom: 20, fontWeight: '500' },
    searchBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, marginBottom: 20, gap: 10 },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    filterScroll: { marginBottom: 4 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, backgroundColor: 'transparent' },
    filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    filterChipText: { fontSize: 13, fontWeight: '600' },
    filterChipTextActive: { color: 'white' },
    listContent: { paddingHorizontal: 14, paddingBottom: 100 },
    row: { justifyContent: 'space-between', marginBottom: 16 },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
    card: { width: '47.5%', borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    imageContainer: { position: 'relative', width: '100%', height: 100 },
    cardImage: { width: '100%', height: '100%' },
    cardImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    ratingFloatingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    cardBody: { padding: 14 },
    cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceText: { fontWeight: '700', fontSize: 13 },
    userCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    userCountText: { fontSize: 11, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%', borderWidth: 1 },
    modalClose: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 25 },
    modalImageContainer: { width: '100%', height: 200 },
    modalImage: { width: '100%', height: '100%', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    modalImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    modalBody: { padding: 24 },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    categoryBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    categoryBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    modalRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    modalRatingText: { fontSize: 16, fontWeight: 'bold' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    modalDescription: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    statBox: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 12 },
    statLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
    statValue: { fontSize: 16, fontWeight: 'bold' },
    roadmapSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    stageCard: { padding: 16, borderRadius: 12, marginBottom: 8 },
    stageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    stageNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
    stageNumberText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    stageDuration: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    stageDurationText: { color: '#6366F1', fontSize: 10, fontWeight: '600' },
    stageTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    stageDescription: { fontSize: 13, lineHeight: 18 },
    enrollBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, backgroundColor: '#6366F1' },
    enrollBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});