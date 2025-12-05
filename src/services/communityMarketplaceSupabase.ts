// Mock service to replace Firebase functionality with Supabase
import { supabase } from '../lib/supabaseClient';
import type {
  CommunityModeratorNote,
  CommunityResource,
  CommunityRoadmapStage,
  CommunityStory,
  CommunityStoryQueryOptions,
  CommunityStoryStats,
  CommunityStoryStatus,
  CommunityStorySubmissionInput,
  CommunityStoryType,
  CommunityStoryUpdateInput
} from '../types/community';

// Mock data for demonstration purposes
const mockStories: CommunityStory[] = [
  {
    id: '1',
    title: 'Getting Started with Web Development',
    summary: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    story: 'A comprehensive guide for beginners',
    category: 'Technology',
    duration: '3 months',
    difficulty: 'Beginner',
    price: 'Free',
    successRate: 85,
    image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    creator: {
      name: 'Jane Smith',
      title: 'Senior Frontend Developer',
      avatar: undefined,
      email: undefined,
      verified: true
    },
    tags: ['Web Development', 'HTML', 'CSS'],
    outcomes: ['Build a portfolio website', 'Understand responsive design'],
    resources: [],
    roadmap: [],
    status: 'approved',
    type: 'roadmap',
    featured: true,
    featuredRank: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'admin',
    moderatorNotes: [],
    stats: {
      rating: 4.7,
      users: 120,
      successRate: 85,
      saves: 45,
      adoptionCount: 90,
      likes: 78,
      comments: 12
    },
    lastUpdatedLabel: 'Just now',
    lastUpdatedTimestamp: Date.now()
  },
  {
    id: '2',
    title: 'Data Science Career Path',
    summary: 'Comprehensive roadmap to becoming a data scientist',
    story: 'From basics to advanced concepts',
    category: 'Data Science',
    duration: '6 months',
    difficulty: 'Advanced',
    price: 'Premium',
    successRate: 90,
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg',
    creator: {
      name: 'John Doe',
      title: 'Data Science Lead',
      avatar: undefined,
      email: undefined,
      verified: true
    },
    tags: ['Python', 'Machine Learning', 'Statistics'],
    outcomes: ['Build ML models', 'Deploy data products'],
    resources: [],
    roadmap: [],
    status: 'approved',
    type: 'roadmap',
    featured: true,
    featuredRank: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'admin',
    moderatorNotes: [],
    stats: {
      rating: 4.9,
      users: 85,
      successRate: 90,
      saves: 32,
      adoptionCount: 70,
      likes: 65,
      comments: 8
    },
    lastUpdatedLabel: 'Just now',
    lastUpdatedTimestamp: Date.now()
  }
];

// Mock implementation of all functions required by the Firebase service
export function listenToCommunityStories(
  options: CommunityStoryQueryOptions,
  handlers: {
    onNext: (stories: CommunityStory[]) => void;
    onError?: (error: Error) => void;
  }
) {
  // Simulate real-time updates with mock data
  setTimeout(() => {
    handlers.onNext(mockStories.filter(story => {
      if (options.status && story.status !== options.status) return false;
      if (options.type && story.type !== options.type) return false;
      if (options.category && story.category !== options.category) return false;
      if (options.featuredOnly && !story.featured) return false;
      return true;
    }));
  }, 0);

  // Return a mock unsubscribe function
  return {
    unsubscribe: () => {}
  };
}

export async function fetchCommunityStories(
  options: CommunityStoryQueryOptions
): Promise<CommunityStory[]> {
  // Filter mock stories based on options
  return mockStories.filter(story => {
    if (options.status && story.status !== options.status) return false;
    if (options.type && story.type !== options.type) return false;
    if (options.category && story.category !== options.category) return false;
    if (options.featuredOnly && !story.featured) return false;
    return true;
  });
}

export async function getCommunityStory(id: string): Promise<CommunityStory | null> {
  return mockStories.find(story => story.id === id) || null;
}

export async function submitCommunityStory(input: CommunityStorySubmissionInput) {
  // TODO: Implement actual submission to Supabase when schema is ready
  console.log('Submitting story:', input);
  // For now, just return a mock ID
  return { id: `mock-${Date.now()}` };
}

export async function updateCommunityStory(id: string, updates: CommunityStoryUpdateInput) {
  // TODO: Implement actual update to Supabase when schema is ready
  console.log('Updating story:', id, updates);
  return { id };
}

export async function setCommunityStoryStatus(
  id: string,
  status: CommunityStoryStatus,
  metadata?: { approvedBy?: string }
) {
  // TODO: Implement actual status update to Supabase when schema is ready
  console.log('Updating status:', id, status, metadata);
  return { id };
}

export async function setCommunityStoryFeatured(
  id: string,
  featured: boolean,
  featuredRank?: number | null
) {
  // TODO: Implement actual featured update to Supabase when schema is ready
  console.log('Setting featured:', id, featured, featuredRank);
  return { id };
}

export async function recordCommunityStoryAdoption(id: string) {
  // TODO: Implement actual adoption recording to Supabase when schema is ready
  console.log('Recording adoption for story:', id);
  return { id };
}

export async function recordCommunityStoryLike(id: string) {
  // TODO: Implement actual like recording to Supabase when schema is ready
  console.log('Recording like for story:', id);
  return { id };
}

export async function recordCommunityStorySave(id: string) {
  // TODO: Implement actual save recording to Supabase when schema is ready
  console.log('Recording save for story:', id);
  return { id };
}

export async function appendModeratorNote(
  id: string,
  entry: { note: string; author?: string }
) {
  // TODO: Implement actual note appending to Supabase when schema is ready
  console.log('Appending moderator note for story:', id, entry);
  return { id };
}