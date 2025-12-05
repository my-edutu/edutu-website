import type { Opportunity, OpportunityDifficulty } from '../types/opportunity';
import { syncOpportunityInventorySnapshot } from './analyticsAggregator';
import { updateOpportunitiesInN8n } from './n8nIntegration';

const DEFAULT_ENDPOINT = '/data/opportunities.json';

let cachedOpportunities: Opportunity[] | null = null;

interface FetchOptions {
  signal?: AbortSignal;
  force?: boolean;
  userId?: string; // Optional userId for n8n integration
}

const getEndpoint = () => {
  const envUrl = import.meta.env.VITE_OPPORTUNITIES_API_URL;
  return typeof envUrl === 'string' && envUrl.trim().length > 0
    ? envUrl.trim()
    : DEFAULT_ENDPOINT;
};

export async function fetchOpportunities(options: FetchOptions = {}): Promise<Opportunity[]> {
  const { signal, force, userId } = options;

  if (!force && cachedOpportunities) {
    return cachedOpportunities;
  }

  const response = await fetch(getEndpoint(), { signal });

  if (!response.ok) {
    throw new Error(`Unable to fetch opportunities (status ${response.status})`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Received malformed opportunities payload');
  }

  const normalised = payload
    .map(normaliseOpportunity)
    .filter((item): item is Opportunity => Boolean(item));

  cachedOpportunities = normalised;

  void (async () => {
    try {
      await syncOpportunityInventorySnapshot(normalised);

      // Send opportunities to n8n if userId is provided
      if (userId) {
        await updateOpportunitiesInN8n(normalised, userId);
      }
    } catch (error) {
      console.error('Failed to sync opportunity analytics snapshot or update n8n', error);
    }
  })();

  return normalised;
}

export function clearOpportunitiesCache() {
  cachedOpportunities = null;
}

function normaliseOpportunity(raw: unknown): Opportunity | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = raw as Record<string, unknown>;

  const id = safeString(source.id);
  const title = safeString(source.title);
  const organization = safeString(source.organization);
  const category = safeString(source.category) || 'General';
  const location = safeString(source.location) || 'Remote';
  const description = safeString(source.description) || 'No description provided yet.';

  if (!id || !title || !organization) {
    return null;
  }

  const deadline = source.deadline ? safeString(source.deadline) : null;
  const image = source.image ? safeString(source.image) : null;
  const applicants = source.applicants ? safeString(source.applicants) : undefined;
  const successRate = source.successRate ? safeString(source.successRate) : undefined;
  const applyUrl = source.applyUrl ? safeString(source.applyUrl) : undefined;
  const lastUpdated = source.lastUpdated ? safeString(source.lastUpdated) : undefined;

  const requirements = toStringArray(source.requirements);
  const benefits = toStringArray(source.benefits);
  const applicationProcess = toStringArray(source.applicationProcess);

  const matchScore = toNumber(source.match);
  const difficulty = toDifficulty(source.difficulty);

  return {
    id,
    title,
    organization,
    category,
    location,
    description,
    deadline,
    image,
    requirements,
    benefits,
    applicationProcess,
    applicants,
    successRate,
    applyUrl,
    lastUpdated,
    match: clamp(matchScore, 0, 100),
    difficulty: difficulty ?? 'Medium'
  };
}

function safeString(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return String(value).trim();
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => safeString(entry))
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toDifficulty(value: unknown): OpportunityDifficulty | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalised = value.trim().toLowerCase();
  if (normalised === 'easy') {
    return 'Easy';
  }
  if (normalised === 'hard') {
    return 'Hard';
  }

  if (normalised === 'medium') {
    return 'Medium';
  }

  return null;
}
