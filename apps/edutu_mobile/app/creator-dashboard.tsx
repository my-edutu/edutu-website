import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Modal, TextInput, Alert, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
    TrendingUp, BookOpen, Calendar, Users, Plus,
    ChevronLeft, DollarSign, Star, X, CheckCircle, ChevronRight,
    LayoutGrid, Award, Briefcase, Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { ScreenHeader } from '../components/ui/ScreenHeader';

const { width } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORY_COLORS: Record<string, string> = {
    course: '#3B82F6', event: '#8B5CF6', mentorship: '#10B981',
    template: '#F59E0B', resource: '#94A3B8',
};

export default function CreatorDashboard() {
    const { user } = useUser();
    const router = useRouter();
    const { isDark, colors } = useTheme();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newListing, setNewListing] = useState({
        title: '', description: '', category: 'course',
        price: '0', eventDate: '', eventLocation: '',
    });

    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_BASE}/creator/dashboard`, {
                headers: { 'x-user-id': user?.id || '' },
            });
            if (res.ok) setData(await res.json());
        } catch (e) {
            console.error('Failed to load creator dashboard:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleCreateListing = async () => {
        if (!newListing.title || !newListing.description) {
            Alert.alert('Required', 'Title and description are required.');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/marketplace/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({
                    ...newListing,
                    price: parseInt(newListing.price || '0', 10),
                }),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewListing({ title: '', description: '', category: 'course', price: '0', eventDate: '', eventLocation: '' });
                await fetchDashboard();
                Alert.alert('Submitted!', 'Your listing is pending admin approval. You\'ll be notified once it\'s live.');
            } else {
                const err = await res.json();
                Alert.alert('Error', err.message || 'Failed to create listing.');
            }
        } catch {
            Alert.alert('Error', 'Connection failed.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScreenHeader title="Creator Studio" showBack={true} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Modern Header Section */}
                <View style={styles.headerSection}>
                    <View>
                        <Text style={[styles.welcomeText, { color: textSecondary }]}>Welcome back,</Text>
                        <Text style={[styles.nameText, { color: textPrimary }]}>{user?.firstName || 'Creator'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: colors.accent }]}
                        onPress={() => setShowCreateModal(true)}
                        activeOpacity={0.8}
                    >
                        <Plus color="white" size={20} />
                        <Text style={styles.createBtnText}>New Listing</Text>
                    </TouchableOpacity>
                </View>

                {/* Glassmorphic Stats Grid */}
                <View style={styles.statsGrid}>
                    <Card variant="glass" style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <DollarSign color="#10b981" size={20} />
                        </View>
                        <Text style={[styles.statValue, { color: textPrimary }]}>{data?.totalEarnings ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: textSecondary }]}>Credits</Text>
                    </Card>

                    <Card variant="glass" style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                            <Users color="#3b82f6" size={20} />
                        </View>
                        <Text style={[styles.statValue, { color: textPrimary }]}>{data?.totalEnrollments ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: textSecondary }]}>Students</Text>
                    </Card>

                    <Card variant="glass" style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <LayoutGrid color="#8b5cf6" size={20} />
                        </View>
                        <Text style={[styles.statValue, { color: textPrimary }]}>{data?.totalListings ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: textSecondary }]}>Listings</Text>
                    </Card>
                </View>

                {/* Revenue Split Banner */}
                <View style={styles.splitBanner}>
                    <LinearGradient
                        colors={isDark ? ['#1e1b4b', '#312e81'] : ['#e0e7ff', '#c7d2fe']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.splitGradient}
                    >
                        <Award color={isDark ? "#818cf8" : "#4f46e5"} size={24} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.splitTitle, { color: isDark ? "white" : "#1e1b4b" }]}>Creator Rewards</Text>
                            <Text style={[styles.splitText, { color: isDark ? "#a5b4fc" : "#4338ca" }]}>
                                You earn <Text style={{ fontWeight: 'bold' }}>85%</Text> of every sale.
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* My Listings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textPrimary }]}>My Listings</Text>
                        <TouchableOpacity onPress={() => router.push('/marketplace')}>
                            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {(!data?.listings || data.listings.length === 0) ? (
                        <Card variant="glass" style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Briefcase color={textSecondary} size={32} />
                            </View>
                            <Text style={[styles.emptyText, { color: textPrimary }]}>No active listings</Text>
                            <Text style={[styles.emptySubtext, { color: textSecondary }]}>Start sharing your knowledge today!</Text>
                            <TouchableOpacity style={[styles.emptyBtn, { borderColor: colors.border }]} onPress={() => setShowCreateModal(true)}>
                                <Text style={[styles.emptyBtnText, { color: textPrimary }]}>Create First Listing</Text>
                            </TouchableOpacity>
                        </Card>
                    ) : (
                        data.listings.map((listing: any) => {
                            const color = CATEGORY_COLORS[listing.category] || '#94A3B8';
                            return (
                                <Card key={listing.id} variant={isDark ? "glass" : "elevated"} style={styles.listingCard}>
                                    <View style={[styles.listingIcon, { backgroundColor: `${color}15` }]}>
                                        <BookOpen color={color} size={20} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.listingTitle, { color: textPrimary }]} numberOfLines={1}>{listing.title}</Text>
                                        <View style={styles.listingMeta}>
                                            <Text style={[styles.categoryText, { color: textSecondary }]}>{listing.category}</Text>
                                            <View style={[styles.statusDot, { backgroundColor: listing.status === 'active' ? '#10b981' : '#64748b' }]} />
                                            <Text style={[styles.statusText, { color: listing.status === 'active' ? '#10b981' : '#64748b' }]}>{listing.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.listingRight}>
                                        <Text style={[styles.listingPrice, { color: colors.accent }]}>{listing.price === 0 ? 'Free' : `${listing.price} cr`}</Text>
                                        <View style={styles.enrollBox}>
                                            <Users size={12} color={textSecondary} />
                                            <Text style={[styles.enrollText, { color: textSecondary }]}>{listing.enrollmentCount}</Text>
                                        </View>
                                    </View>
                                </Card>
                            );
                        })
                    )}
                </View>

                {/* Recent Activity */}
                {data?.recentEarnings?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textPrimary, marginBottom: 16 }]}>Recent Sales</Text>
                        {data.recentEarnings.slice(0, 5).map((tx: any) => (
                            <View key={tx.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.txIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <TrendingUp color="#10b981" size={16} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.txDesc, { color: textPrimary }]} numberOfLines={1}>{tx.description}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                        <Clock size={10} color={textSecondary} />
                                        <Text style={[styles.txDate, { color: textSecondary, marginLeft: 4 }]}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.txAmount, { color: '#10b981' }]}>+{tx.amount}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Create Listing Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textPrimary }]}>New Listing</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                                <X color={textSecondary} size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalLabel, { color: textSecondary }]}>Choose Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {Object.keys(CATEGORY_COLORS).map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.catChip,
                                            { borderColor: colors.border },
                                            newListing.category === cat && { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
                                        ]}
                                        onPress={() => setNewListing(p => ({ ...p, category: cat }))}
                                    >
                                        <Text style={[styles.catChipText, { color: textSecondary }, newListing.category === cat && { color: 'white' }]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.modalLabel, { color: textSecondary }]}>Title</Text>
                            <TextInput
                                value={newListing.title}
                                onChangeText={v => setNewListing(p => ({ ...p, title: v }))}
                                style={[styles.modalInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border }]}
                                placeholder="e.g. Masterclass in Web Design"
                                placeholderTextColor={textSecondary}
                            />

                            <Text style={[styles.modalLabel, { color: textSecondary }]}>Description</Text>
                            <TextInput
                                value={newListing.description}
                                onChangeText={v => setNewListing(p => ({ ...p, description: v }))}
                                style={[styles.modalInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border, minHeight: 100, textAlignVertical: 'top' }]}
                                placeholder="Describe what students will learn..."
                                placeholderTextColor={textSecondary}
                                multiline
                            />

                            <Text style={[styles.modalLabel, { color: textSecondary }]}>Price (Credits, 0 = Free)</Text>
                            <TextInput
                                value={newListing.price}
                                onChangeText={v => setNewListing(p => ({ ...p, price: v }))}
                                style={[styles.modalInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: textPrimary, borderColor: colors.border }]}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={textSecondary}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: colors.accent }, creating && { opacity: 0.6 }]}
                                onPress={handleCreateListing}
                                disabled={creating}
                            >
                                {creating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <CheckCircle color="white" size={20} />
                                        <Text style={styles.submitBtnText}>Submit for Review</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, marginBottom: 24 },
    welcomeText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    nameText: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
    createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    createBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
    statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 20 },
    statIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    splitBanner: { paddingHorizontal: 20, marginBottom: 32 },
    splitGradient: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
    splitTitle: { fontSize: 16, fontWeight: 'bold' },
    splitText: { fontSize: 13, marginTop: 2 },
    section: { paddingHorizontal: 20, marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    emptyState: { padding: 40, alignItems: 'center', borderRadius: 24 },
    emptyIconBox: { width: 64, height: 64, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: 'bold' },
    emptySubtext: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
    emptyBtnText: { fontSize: 13, fontWeight: '700' },
    listingCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12, borderRadius: 20 },
    listingIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    listingTitle: { fontSize: 15, fontWeight: 'bold' },
    listingMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    categoryText: { fontSize: 12, textTransform: 'capitalize' },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 8 },
    statusText: { fontSize: 12, fontWeight: '600' },
    listingRight: { alignItems: 'flex-end' },
    listingPrice: { fontSize: 15, fontWeight: 'bold' },
    enrollBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    enrollText: { fontSize: 11, fontWeight: '600' },
    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
    txIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    txDesc: { fontSize: 14, fontWeight: '600' },
    txDate: { fontSize: 11 },
    txAmount: { fontSize: 15, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%', borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    modalLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    modalInput: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 15, marginBottom: 20 },
    catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
    catChipText: { fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 10, marginBottom: 30 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

