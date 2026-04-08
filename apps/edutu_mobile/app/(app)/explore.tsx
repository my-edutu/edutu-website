import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, RefreshCw, Sparkles, Globe, ChevronRight, ArrowLeft } from "lucide-react-native";
import { useState, useMemo, useCallback } from "react";
import { useTheme } from "../../components/context/ThemeContext";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useOpportunities } from "@edutu/core/src/hooks/useOpportunities";
import { Opportunity } from "@edutu/core/src/types/opportunity";

const CATEGORY_COLORS: Record<string, string> = {
  'Scholarship': '#8B5CF6',
  'Internship': '#6366F1',
  'Bootcamp': '#84CC16',
  'Fellowship': '#F97316',
  'Competition': '#EF4444',
  'Mentorship': '#A855F7',
  'Course': '#3B82F6',
  'Certification': '#22C55E',
  'Job': '#0EA5E9',
  'default': '#94A3B8',
};

export default function Explore() {
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { data: opportunities, loading, error, refresh } = useOpportunities({
    supabase,
  });

  const backgroundColor = colors.background;
  const textPrimary = colors.foreground;
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const cardBg = colors.card;
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const borderColor = colors.border;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    opportunities.forEach((opp: Opportunity) => {
      if (opp.category) cats.add(opp.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return opportunities.filter((opp: Opportunity) => {
      if (selectedCategory !== 'All' && opp.category !== selectedCategory) return false;
      if (!term) return true;
      const haystack = [opp.title, opp.organization, opp.description, opp.location]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [opportunities, searchTerm, selectedCategory]);

  const renderOpportunity = useCallback(({ item, index }: { item: Opportunity; index: number }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['default'];
    const difficultyColor = item.difficulty === 'Easy' ? '#10B981' : item.difficulty === 'Hard' ? '#EF4444' : '#F59E0B';

    return (
      <TouchableOpacity
        style={[styles.opportunityCard, { backgroundColor: cardBg, borderColor }]}
        activeOpacity={0.85}
        onPress={() => router.push(`/opportunities/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{item.category}</Text>
          </View>
          {item.difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}15` }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>{item.difficulty}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={2}>{item.title}</Text>
        
        <Text style={[styles.cardOrg, { color: textSecondary }]}>{item.organization}</Text>
        
        <Text style={[styles.cardDescription, { color: textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
          <View style={styles.footerInfo}>
            <View style={styles.infoDot} />
            <Text style={[styles.footerText, { color: textSecondary }]}>
              {item.deadline || 'Ongoing'}
            </Text>
          </View>
          <View style={styles.footerInfo}>
            <View style={[styles.infoDot, { backgroundColor: '#6366F1' }]} />
            <Text style={[styles.footerText, { color: textSecondary }]}>
              {item.location || 'Remote'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/opportunities/${item.id}`)}>
          <Text style={styles.viewButtonText}>Explore Journey</Text>
          <ChevronRight size={16} color="#6366F1" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [cardBg, borderColor, textPrimary, textSecondary, router]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={textPrimary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: textPrimary }]}>Explore Opportunities</Text>
      <Text style={[styles.subtitle, { color: textSecondary }]}>
        {loading ? 'Curating your matches...' : `${filteredOpportunities.length} personalized matches`}
      </Text>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor }]}>
          <Search color={textSecondary} size={18} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor={textSecondary}
            style={[styles.searchInput, { color: textPrimary }]}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: showFilters ? '#6366F1' : cardBg, borderColor }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={showFilters ? '#fff' : textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: cardBg, borderColor }]}
          onPress={refresh}
          disabled={loading}
        >
          <RefreshCw size={18} color={textSecondary} style={loading ? { transform: [{ rotate: '45deg' }] } : undefined} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          style={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor },
                selectedCategory === item && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.filterChipText,
                { color: selectedCategory === item ? '#fff' : textSecondary }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Globe size={48} color={textSecondary} />
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>Refining Feed...</Text>
      <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
        Try adjusting your filters to see more results.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={[]}>
      <FlatList
        data={filteredOpportunities}
        keyExtractor={(item) => item.id}
        renderItem={renderOpportunity}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#6366F1"
          />
        }
      />
      {loading && filteredOpportunities.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={[styles.loadingText, { color: textSecondary }]}>Loading opportunities...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterList: {
    marginTop: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  opportunityCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 24,
  },
  cardOrg: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});