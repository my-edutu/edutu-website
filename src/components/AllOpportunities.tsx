import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Star, Calendar, MapPin, Filter } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useDarkMode } from '../hooks/useDarkMode';
import { usePersonalizedOpportunities } from '../hooks/usePersonalizedOpportunities';
import type { Opportunity } from '../types/opportunity';

interface AllOpportunitiesProps {
  onBack: () => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

const LOADING_PLACEHOLDERS = 4;

const getDifficultyColor = (difficulty?: string | null) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'Hard':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
};

const AllOpportunities: React.FC<AllOpportunitiesProps> = ({ onBack, onSelectOpportunity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode } = useDarkMode();
  const {
    data: personalizedOpportunities,
    loading,
    error,
    refresh,
    userPreferences,
    updateUserPreferences
  } = usePersonalizedOpportunities();

  // Extract the opportunities from the personalized data
  const opportunities = useMemo(() =>
    personalizedOpportunities.map(item => item.opportunity),
    [personalizedOpportunities]
  );

  const categories = useMemo(() => {
    const dynamic = new Set<string>();
    opportunities.forEach((opportunity) => {
      if (opportunity.category) {
        dynamic.add(opportunity.category);
      }
    });
    return ['All', ...Array.from(dynamic).sort()];
  }, [opportunities]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const filteredOpportunities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return personalizedOpportunities.filter(({ opportunity, matchScore }) => {
      if (selectedCategory !== 'All' && opportunity.category !== selectedCategory) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        opportunity.title,
        opportunity.organization,
        opportunity.description,
        opportunity.category,
        opportunity.location
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [personalizedOpportunities, searchTerm, selectedCategory]);

  const headerSubtitle = useMemo(() => {
    if (loading) {
      return 'Loading personalized opportunities...';
    }

    if (error) {
      return 'We ran into a problem fetching opportunities';
    }

    return `${filteredOpportunities.length} personalized opportunities available`;
  }, [error, filteredOpportunities.length, loading]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    scrollToTop();
    onBack();
  };

  const showEmptyState = !loading && !error && filteredOpportunities.length === 0;

  // Function to handle preference updates
  const handleUpdatePreferences = () => {
    if (userPreferences) {
      // Example: update with temporary values, in real app these would come from UI
      updateUserPreferences({
        interests: ['Technology', 'Leadership', 'Entrepreneurship'],
        preferredCategories: ['Tech', 'Leadership'],
        experienceLevel: 'intermediate'
      });
    }
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 animate-fade-in ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="secondary" onClick={handleBack} className="p-2">
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Personalized Opportunities</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{headerSubtitle}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="shrink-0"
            >
              Refresh
            </Button>
          </div>

          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {showFilters && userPreferences && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Your Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Interests</label>
                  <input
                    type="text"
                    value={userPreferences.interests.join(', ')}
                    onChange={(e) => updateUserPreferences({ interests: e.target.value.split(',').map(i => i.trim()) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    placeholder="e.g., Technology, Leadership"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Preferred Categories</label>
                  <input
                    type="text"
                    value={userPreferences.preferredCategories.join(', ')}
                    onChange={(e) => updateUserPreferences({ preferredCategories: e.target.value.split(',').map(c => c.trim()) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    placeholder="e.g., Tech, Scholarships"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Experience Level</label>
                  <select
                    value={userPreferences.experienceLevel}
                    onChange={(e) => updateUserPreferences({ experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={userPreferences.location || ''}
                    onChange={(e) => updateUserPreferences({ location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    placeholder="Your location"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleUpdatePreferences}>
                  Apply Preferences
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Card className="mt-4 border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Couldn&apos;t refresh the latest opportunities. Please try again.</p>
                <Button variant="secondary" size="sm" onClick={refresh}>
                  Try again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading &&
          Array.from({ length: LOADING_PLACEHOLDERS }).map((_, index) => (
            <Card
              key={`loading-${index}`}
              className="border-subtle bg-surface-layer animate-pulse"
            >
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="flex gap-2">
                    <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {!loading &&
          filteredOpportunities.map(({ opportunity, matchScore }, index) => (
            <Card
              key={opportunity.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectOpportunity(opportunity)}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  {opportunity.image ? (
                    <img src={opportunity.image} alt={opportunity.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 mb-1">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{opportunity.organization}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star size={14} className="text-yellow-500" />
                      <span className={`text-sm font-medium ${
                        matchScore >= 70 ? 'text-green-600 dark:text-green-400' :
                        matchScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(matchScore)}% match
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{opportunity.deadline || 'No deadline listed'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{opportunity.location}</span>
                    </div>
                    {opportunity.successRate && <span>Success rate {opportunity.successRate}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(opportunity.difficulty)}`}
                      >
                        {opportunity.difficulty ?? 'Medium'}
                      </span>
                      {opportunity.applicants && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{opportunity.applicants} applicants</span>
                      )}
                    </div>
                    <span className="text-xs text-primary font-medium">{opportunity.category}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {showEmptyState && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">:(</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No opportunities found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOpportunities;
