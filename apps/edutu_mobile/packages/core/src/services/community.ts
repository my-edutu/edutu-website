import { SupabaseClient } from '@supabase/supabase-js';
import {
  CommunityStory,
  CommunityStoryQueryOptions,
  CommunityStoryStatus,
  CommunityStoryType,
  CommunityDifficulty,
  CommunityStoryStats,
  CommunityResource,
  CommunityRoadmapStage,
} from '../types/community';

function mapPostToStory(post: any): CommunityStory {
  const metadata = post.metadata || {};
  return {
    id: post.id,
    title: post.title,
    summary: metadata.summary || post.content?.substring(0, 150) + '...',
    story: post.content,
    category: metadata.category || 'General',
    duration: metadata.duration,
    difficulty: (metadata.difficulty as CommunityDifficulty) || 'Intermediate',
    price: metadata.price || 'Free',
    successRate: metadata.successRate || 0,
    image: metadata.image || '',
    creator: {
      name: metadata.creator_name || 'Community Member',
      title: metadata.creator_title || '',
      avatar: metadata.creator_avatar || '',
      email: metadata.creator_email || '',
      verified: metadata.creator_verified || false
    },
    tags: post.tags || [],
    outcomes: metadata.outcomes || [],
    resources: metadata.resources || [],
    roadmap: metadata.roadmap || [],
    status: (post.visibility === 'public' ? 'approved' : post.visibility === 'admins' ? 'pending' : 'hidden') as CommunityStoryStatus,
    type: post.type as CommunityStoryType,
    featured: metadata.featured || false,
    featuredRank: metadata.featuredRank || null,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    approvedAt: metadata.approved_at,
    approvedBy: metadata.approved_by,
    moderatorNotes: metadata.moderator_notes || [],
    stats: {
      rating: metadata.rating || 0,
      users: metadata.users || 0,
      successRate: metadata.successRate || 0,
      saves: metadata.saves || 0,
      adoptionCount: metadata.adoptionCount || 0,
      likes: post.likes || 0,
      comments: post.comments_count || 0
    },
    lastUpdatedLabel: 'Recently updated',
    lastUpdatedTimestamp: new Date(post.updated_at).getTime()
  };
}

function mapListingToStory(listing: any): CommunityStory {
  const metadata = listing.metadata || {};
  return {
    id: listing.id,
    title: listing.title,
    summary: listing.description?.substring(0, 150) + '...',
    story: listing.description,
    category: listing.category || 'Marketplace',
    duration: listing.availability,
    difficulty: 'Intermediate',
    price: listing.price_range ? 'Premium' : 'Free',
    successRate: metadata.successRate || 0,
    image: metadata.image || '',
    creator: {
      name: metadata.creator_name || 'Service Provider',
      title: metadata.creator_title || '',
      avatar: metadata.creator_avatar || '',
      email: metadata.creator_email || '',
      verified: metadata.creator_verified || false
    },
    tags: listing.skills || [],
    outcomes: metadata.outcomes || [],
    resources: [],
    roadmap: [],
    status: (listing.status === 'active' ? 'approved' : 'pending') as CommunityStoryStatus,
    type: 'marketplace',
    featured: metadata.featured || false,
    featuredRank: metadata.featuredRank || null,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    stats: {
      rating: metadata.rating || 0,
      users: metadata.users || 0,
      successRate: metadata.successRate || 0,
      saves: metadata.saves || 0,
      adoptionCount: metadata.adoptionCount || 0,
      likes: metadata.likes || 0,
      comments: metadata.comments || 0
    },
    lastUpdatedLabel: 'Recently active',
    lastUpdatedTimestamp: new Date(listing.updated_at).getTime()
  };
}

export async function fetchCommunityStories(
  supabase: SupabaseClient,
  options: CommunityStoryQueryOptions
): Promise<CommunityStory[]> {
  const stories: CommunityStory[] = [];
  const typeFilter = options.type || ['roadmap', 'marketplace'];
  const types = Array.isArray(typeFilter) ? typeFilter : [typeFilter];

  if (types.includes('roadmap')) {
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('type', 'roadmap');

    if (options.status) {
      const visibility = options.status === 'approved' ? 'public' : options.status === 'pending' ? 'admins' : 'public';
      query = query.eq('visibility', visibility);
    } else {
      query = query.eq('visibility', 'public');
    }

    if (options.category) {
      query = query.contains('metadata', { category: options.category });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (!error && data) {
      stories.push(...data.map(mapPostToStory));
    }
  }

  if (types.includes('marketplace')) {
    let query = supabase
      .from('marketplace_listings')
      .select('*');

    if (options.status) {
      const statusValue = options.status === 'approved' ? 'active' : 'paused';
      query = query.eq('status', statusValue);
    } else {
      query = query.eq('status', 'active');
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (!error && data) {
      stories.push(...data.map(mapListingToStory));
    }
  }

  if (options.orderBy === 'featuredRank') {
    return stories.sort((a, b) => (a.featuredRank || 999) - (b.featuredRank || 999));
  }

  const sortDirection = options.descending === false ? 1 : -1;
  return stories.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return (timeB - timeA) * sortDirection;
  });
}

export async function getCommunityStory(
  supabase: SupabaseClient,
  id: string
): Promise<CommunityStory | null> {
  const { data: post } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (post) return mapPostToStory(post);

  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (listing) return mapListingToStory(listing);

  return null;
}