import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    Filter,
    GraduationCap,
    Calendar,
    MapPin,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Users
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { supabase } from '../../../lib/supabase';
import { useOpportunities } from '@edutu/core/src/hooks/useOpportunities';
import { Opportunity } from '@edutu/core/src/types/opportunity';

export default function OpportunitiesScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: opportunities,
        loading,
        error
    } = useOpportunities({
        supabase,
        userId: user?.id || undefined
    });

    const filteredOpportunities = useMemo(() => {
        if (!searchTerm) return opportunities;
        return opportunities.filter(o =>
            o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.organization.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [opportunities, searchTerm]);

    const renderOpportunity = ({ item }: { item: Opportunity }) => (
        <TouchableOpacity
            onPress={() => router.push(`/opportunities/${item.id}`)}
            className="mb-4"
        >
            <Card className="p-0 overflow-hidden border-slate-800">
                <View className="h-40 bg-slate-800 relative">
                    {item.image ? (
                        <Image source={{ uri: item.image }} className="w-full h-full object-cover" />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <GraduationCap size={40} color="#334155" />
                        </View>
                    )}
                    {item.featured && (
                        <View className="absolute top-3 left-3 bg-brand-500 px-2 py-1 rounded-lg">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Featured</Text>
                        </View>
                    )}
                </View>

                <View className="p-5">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">{item.category}</Text>
                        <Text className="text-slate-600">•</Text>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.organization}</Text>
                    </View>

                    <Text className="text-white text-lg font-bold mb-4" style={{ color: 'white' }}>
                        {item.title}
                    </Text>

                    <View className="flex-row justify-between items-center pt-4 border-t border-slate-800">
                        <View className="flex-row items-center">
                            <Users size={12} color="#94A3B8" />
                            <Text className="text-text-secondary text-[10px] font-bold ml-1">852 Enrolled</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push(`/opportunities/${item.id}`)}
                            className="bg-slate-800 px-4 py-2 rounded-xl flex-row items-center"
                        >
                            <Text className="text-white text-[10px] font-bold mr-1">VIEW PLAN</Text>
                            <ChevronRight size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScreenHeader
                title="Discovery Hub"
                right={
                    <TouchableOpacity className="p-2 bg-slate-800 rounded-lg">
                        <Filter size={20} color="#94A3B8" />
                    </TouchableOpacity>
                }
            />

            <View className="flex-1 px-5">
                {/* Search Bar */}
                <View className="flex-row bg-slate-800 rounded-2xl px-4 py-3 items-center my-6 border border-slate-700">
                    <Search size={18} color="#94A3B8" />
                    <TextInput
                        className="flex-1 text-white ml-3 text-sm font-bold uppercase tracking-widest"
                        placeholder="LOCATE OPPORTUNITY..."
                        placeholderTextColor="#475569"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
                ) : error ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-rose-500 font-bold text-center">{error}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredOpportunities}
                        keyExtractor={item => item.id}
                        renderItem={renderOpportunity}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 opacity-40">
                                <GraduationCap size={48} color="#475569" />
                                <Text className="text-white font-bold text-lg mt-4 uppercase italic">No Matches Found</Text>
                                <Text className="text-text-secondary text-xs mt-2 uppercase tracking-widest">Try adjusting your search filters</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
