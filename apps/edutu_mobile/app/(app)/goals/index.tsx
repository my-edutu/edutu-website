import React, { useMemo, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Target, 
    Plus, 
    Search, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    ShieldAlert, 
    RefreshCcw,
    Zap,
    Award,
    Flame
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { supabase } from '../../../lib/supabase';
import { useGoals, Goal } from '@edutu/core/src/hooks/useGoals';

const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Mastered' },
] as const;

type StatusFilter = (typeof statusFilters)[number]['id'];

export default function GoalsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { goals, isLoading, updateGoal } = useGoals(supabase, user?.id || null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGoals = useMemo(() => {
        return goals
            .filter(g => statusFilter === 'all' ? true : g.status === statusFilter)
            .filter(g => !searchTerm || g.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [goals, statusFilter, searchTerm]);

    const stats = useMemo(() => {
        const active = goals.filter(g => g.status === 'active');
        const completed = goals.filter(g => g.status === 'completed');
        const avgProgress = active.length 
            ? Math.round(active.reduce((acc, g) => acc + g.progress, 0) / active.length) 
            : 0;
        
        return [
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: Zap, color: '#6366f1' },
            { label: 'Active', value: active.length, icon: Target, color: '#3b82f6' },
            { label: 'Mastered', value: completed.length, icon: Award, color: '#10b981' },
            { label: 'Streak', value: '12d', icon: Flame, color: '#f59e0b' },
        ];
    }, [goals]);

    const renderGoalCard = (goal: Goal) => (
        <Card key={goal.id} className="mb-4 p-5">
            <View className="flex-row justify-between items-start mb-4">
                <Badge 
                    label={goal.priority || 'Medium'} 
                    variant={goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'yellow' : 'blue'}
                    size="sm"
                />
                <Text className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">
                    {goal.category || 'General'}
                </Text>
            </View>

            <Text className="text-white text-lg font-bold mb-2">{goal.title}</Text>
            <Text className="text-text-secondary text-sm mb-6 italic" numberOfLines={2}>
                {goal.description || "Take small steps every day to reach your objective."}
            </Text>

            <View className="space-y-3">
                <View className="flex-row justify-between items-center">
                    <Text className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Progression</Text>
                    <Text className="text-brand-400 text-[10px] font-bold">{Math.round(goal.progress)}%</Text>
                </View>
                <ProgressBar progress={goal.progress} />
                
                <View className="flex-row items-center mt-2">
                    <Calendar size={12} color="#94A3B8" />
                    <Text className="text-text-secondary text-[10px] ml-1 mr-4">
                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                    </Text>
                    <Clock size={12} color="#94A3B8" />
                    <Text className="text-text-secondary text-[10px] ml-1">
                        {new Date(goal.updated_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <View className="flex-row mt-6 pt-4 border-t border-slate-800">
                {goal.status === 'active' ? (
                    <TouchableOpacity 
                        onPress={() => updateGoal(goal.id, { status: 'completed', progress: 100 })}
                        className="flex-1 flex-row items-center justify-center bg-brand-500 py-3 rounded-xl mr-2"
                    >
                        <CheckCircle2 size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-xs uppercase">Complete</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        onPress={() => updateGoal(goal.id, { status: 'active', progress: 90 })}
                        className="flex-1 flex-row items-center justify-center bg-slate-700 py-3 rounded-xl mr-2"
                    >
                        <RefreshCcw size={16} color="white" />
                        <Text className="text-white font-bold ml-2 text-xs uppercase">Reopen</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    onPress={() => updateGoal(goal.id, { status: 'archived' })}
                    className="flex-1 flex-row items-center justify-center bg-slate-800 py-3 rounded-xl"
                >
                    <ShieldAlert size={16} color="#94A3B8" />
                    <Text className="text-text-secondary font-bold ml-2 text-xs uppercase">Archive</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScreenHeader 
                title="Mission Board" 
                showBack
                onBack={() => router.push('/')}
                right={
                    <TouchableOpacity 
                        onPress={() => router.push('/goals/add')}
                        className="w-10 h-10 bg-brand-500 rounded-xl items-center justify-center"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Stats Summary */}
                <View className="flex-row flex-wrap justify-between mt-6 mb-8">
                    {stats.map((stat, i) => (
                        <View key={i} className="w-[48%] bg-slate-800/50 p-4 rounded-2xl mb-3 border border-slate-800">
                            <View className="p-2 rounded-lg bg-white/5 self-start mb-2">
                                <stat.icon size={16} color={stat.color} />
                            </View>
                            <Text className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">{stat.label}</Text>
                            <Text className="text-white text-xl font-bold mt-1">{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Filter & Search */}
                <View className="mb-6">
                    <View className="flex-row bg-slate-800 rounded-2xl px-4 py-3 items-center mb-4 border border-slate-700">
                        <Search size={18} color="#94A3B8" />
                        <TextInput 
                            className="flex-1 text-white ml-3 text-sm font-bold uppercase tracking-widest"
                            placeholder="LOCATE QUEST..."
                            placeholderTextColor="#475569"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {statusFilters.map(filter => (
                            <TouchableOpacity 
                                key={filter.id}
                                onPress={() => setStatusFilter(filter.id)}
                                className={`px-5 py-3 rounded-xl mr-2 border ${
                                    statusFilter === filter.id 
                                    ? 'bg-white border-white' 
                                    : 'bg-slate-800 border-slate-700'
                                }`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${
                                    statusFilter === filter.id ? 'text-slate-950' : 'text-slate-400'
                                }`}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Goals List */}
                {isLoading ? (
                    <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
                ) : filteredGoals.length > 0 ? (
                    <View className="pb-10">
                        {filteredGoals.map(renderGoalCard)}
                    </View>
                ) : (
                    <View className="items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-[32px]">
                        <Target size={48} color="#475569" />
                        <Text className="text-white font-bold text-lg mt-4 uppercase italic">No Missions Found</Text>
                        <Text className="text-text-secondary text-xs mt-2 uppercase tracking-widest">Initiate a new quest to begin</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/goals/add')}
                            className="mt-6 bg-brand-500 px-8 py-3 rounded-2xl"
                        >
                            <Text className="text-white font-black uppercase italic text-xs">Initiate Mission</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
