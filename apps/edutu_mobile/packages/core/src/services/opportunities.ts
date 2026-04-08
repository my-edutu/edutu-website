import { SupabaseClient } from '@supabase/supabase-js';
import { Opportunity, OpportunityDifficulty } from '../types/opportunity';

let cachedOpportunities: Opportunity[] | null = null;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions {
  supabase: SupabaseClient;
  signal?: AbortSignal;
  force?: boolean;
  userId?: string;
  onSyncSnapshot?: (opportunities: Opportunity[]) => Promise<void>;
  onUpdateN8n?: (opportunities: Opportunity[], userId: string) => Promise<void>;
}

function normaliseOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organization: row.category || 'Community Provider',
    category: row.category || 'General',
    location: row.target_region || (row.is_remote ? 'Remote' : ''),
    description: row.description || row.eligibility_criteria || 'No description provided.',
    deadline: row.deadline || null,
    image: row.image_url || null,
    requirements: [],
    benefits: [],
    applicationProcess: [],
    applicants: undefined,
    successRate: undefined,
    applyUrl: row.apply_url || row.source_url,
    lastUpdated: row.updated_at,
    match: 0,
    difficulty: (row.difficulty as OpportunityDifficulty) || 'Medium',
    featured: row.is_featured || false
  };
}

async function fetchFromSupabaseFallback(supabase: SupabaseClient): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching opportunities from Supabase:', error);
    return [];
  }

  const normalised = data.map(normaliseOpportunity);
  cachedOpportunities = normalised;
  return normalised;
}

export async function fetchOpportunities(options: FetchOptions): Promise<Opportunity[]> {
  const { supabase, force } = options;

  if (!force && cachedOpportunities) {
    return cachedOpportunities;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/opportunities?limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const normalised = data.map(normaliseOpportunity);
    cachedOpportunities = normalised;

    // Background tasks - keep Supabase for analytics sync
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      void (async () => {
        try {
          if (options.onSyncSnapshot) {
            await options.onSyncSnapshot(normalised);
          }
          if (options.userId && options.onUpdateN8n) {
            await options.onUpdateN8n(normalised, options.userId);
          }
        } catch (err) {
          console.error('Failed to sync opportunity analytics or update n8n:', err);
        }
      })();
    }

    return normalised;
  } catch (error) {
    console.error('Error fetching opportunities from API:', error);
    // Fallback to Supabase if API fails
    return fetchFromSupabaseFallback(supabase);
  }
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return normaliseOpportunity(data);
  } catch (error) {
    console.error('Error fetching opportunity from API:', error);
    return null;
  }
}

export function clearOpportunitiesCache() {
  cachedOpportunities = null;
}