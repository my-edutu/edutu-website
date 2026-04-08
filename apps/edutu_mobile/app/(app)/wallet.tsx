import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, CreditCard, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const TX_TYPE_CONFIG: Record<string, { color: string; label: string; isCredit: boolean }> = {
    creator_earning: { color: '#10B981', label: 'Creator Earning', isCredit: true },
    marketplace_purchase: { color: '#EF4444', label: 'Marketplace Purchase', isCredit: false },
    payout: { color: '#10B981', label: 'Payout', isCredit: true },
    reward: { color: '#10B981', label: 'Reward', isCredit: true },
    credit: { color: '#10B981', label: 'Credit Added', isCredit: true },
    payment: { color: '#EF4444', label: 'Payment', isCredit: false },
};

export default function WalletScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [txHistory, setTxHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchWallet = async () => {
            const url = `${API_BASE}/wallet`;
            try {
                const res = await fetch(url, {
                    headers: { 'x-user-id': user?.id || '' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance ?? 0);
                    setTxHistory(data.transactions ?? []);
                } else {
                    console.error(`Wallet fetch failed with status: ${res.status} at ${url}`);
                }
            } catch (e) {
                console.error(`Wallet fetch failed at ${url}:`, e);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) {
            fetchWallet();
        }
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="Financial Hub" showBack onBack={() => router.push('/')} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.balanceCard}>
                    <View style={styles.balanceCenter}>
                        <Text style={styles.balanceLabel}>Credits Balance</Text>
                        {loading ? (
                            <ActivityIndicator color="#3B82F6" size="large" style={{ marginTop: 8 }} />
                        ) : (
                            <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
                        )}
                        <Text style={styles.balanceSub}>Credits</Text>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={styles.actionIcon}>
                                <PlusCircle color="white" size={22} />
                            </View>
                            <Text style={styles.actionLabel}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={styles.actionIcon}>
                                <ArrowUpRight color="white" size={22} />
                            </View>
                            <Text style={styles.actionLabel}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={styles.actionIcon}>
                                <TrendingUp color="white" size={22} />
                            </View>
                            <Text style={styles.actionLabel}>Cashout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={styles.actionIcon}>
                                <CreditCard color="white" size={22} />
                            </View>
                            <Text style={styles.actionLabel}>History</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Transactions Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                </View>

                {loading ? (
                    <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
                ) : txHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CreditCard color="#334155" size={36} />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                        <Text style={styles.emptySubText}>Enroll in courses or earn from your content to see activity here.</Text>
                    </View>
                ) : (
                    txHistory.map((tx, i) => {
                        const config = TX_TYPE_CONFIG[tx.type] || { color: '#94A3B8', label: tx.type, isCredit: tx.amount > 0 };
                        return (
                            <View key={tx.id || i} style={styles.txCard}>
                                <View style={[styles.txIcon, { backgroundColor: `${config.color}20` }]}>
                                    {config.isCredit ? (
                                        <ArrowDownLeft color={config.color} size={22} />
                                    ) : (
                                        <ArrowUpRight color={config.color} size={22} />
                                    )}
                                </View>
                                <View style={styles.txContent}>
                                    <Text style={styles.txTitle}>{tx.description || config.label}</Text>
                                    <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                                </View>
                                <Text style={[styles.txAmount, { color: config.color }]}>
                                    {config.isCredit ? '+' : ''}{tx.amount} cr
                                </Text>
                            </View>
                        );
                    })
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    scrollView: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
    title: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
    balanceCard: { padding: 32, borderRadius: 28, borderWidth: 1, borderColor: '#334155', marginBottom: 32 },
    balanceCenter: { alignItems: 'center', marginBottom: 24 },
    balanceLabel: { color: '#94A3B8', fontWeight: '500', marginBottom: 4, fontSize: 14 },
    balanceAmount: { color: 'white', fontSize: 52, fontWeight: 'bold' },
    balanceSub: { color: '#3B82F6', fontWeight: '700', letterSpacing: 2, marginTop: 4, fontSize: 13 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    actionItem: { alignItems: 'center' },
    actionIcon: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionLabel: { color: 'white', fontSize: 12, fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
    emptyText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
    emptySubText: { color: '#475569', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
    txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    txIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    txContent: { flex: 1 },
    txTitle: { color: 'white', fontWeight: '600', fontSize: 14 },
    txDate: { color: '#64748B', fontSize: 12, marginTop: 2 },
    txAmount: { fontWeight: 'bold', fontSize: 15 },
});
