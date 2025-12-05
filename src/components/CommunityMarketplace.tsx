import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle,
  ExternalLink,
  Filter,
  Globe,
  Heart,
  Link2,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Users
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/Dialog';
import { useToast } from './ui/ToastProvider';
import { useDarkMode } from '../hooks/useDarkMode';
import type { AppUser } from '../types/user';
import type { CommunityResource, CommunityRoadmapStage, CommunityStoryStats } from '../types/community';
import {
  recordCommunityStoryAdoption,
  recordCommunityStoryLike,
  recordCommunityStorySave,
  fetchCommunityStories,
  listenToCommunityStories
} from '../services/communityMarketplaceSupabase';

interface CommunityRoadmap {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  creatorEmail?: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  users: number;
  successRate: number;
  tags: string[];
  achievements: string[];
  price: 'Free' | 'Premium';
  image: string;
  featured: boolean;
  status: 'approved' | 'pending' | 'hidden';
  type: 'roadmap' | 'marketplace';
  lastUpdatedLabel: string;
  lastUpdatedTimestamp: number;
  story: string;
  resources: CommunityResource[];
  roadmap: CommunityRoadmapStage[];
  stats: CommunityStoryStats;
  paymentLink?: string | null;
}

interface CommunityMarketplaceProps {
  onBack: () => void;
  onRoadmapSelect: (roadmap: CommunityRoadmap) => void;
  user: AppUser | null;
}

interface CreateRoadmapForm {
  title: string;
  summary: string;
  story: string;
  roadmapOutline: string;
  resourceNotes: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: 'Free' | 'Premium';
  successRate: string;
  tags: string;
  outcomes: string;
  coverImage: string;
  creatorTitle: string;
  creatorEmail: string;
  paymentLink: string;
  type: 'roadmap' | 'marketplace';
}

type SortOption = 'Popular' | 'Newest' | 'Highest Rated' | 'Most Used' | 'Free Only';

const FALLBACK_ROADMAPS: CommunityRoadmap[] = [
  {
    id: 'sample-oxford-mba',
    title: 'Oxford MBA Admission Journey',
    description:
      'How Amara layered leadership, GMAT prep, and scholarship outreach to secure a fully funded Oxford MBA seat.',
    creator: { name: 'Amara Bello', avatar: 'MBA', title: 'Oxford Said MBA Scholar', verified: true },
  creatorEmail: 'amara@edutu.ai',
  category: 'Education',
  duration: '18 months',
  difficulty: 'Advanced',
  rating: 4.9,
  users: 912,
  successRate: 62,
  tags: ['MBA', 'Scholarships', 'Leadership'],
  achievements: ['Oxford Said offer', 'Clarendon Scholarship', 'GMAT 740'],
  price: 'Premium',
  image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
  featured: true,
  status: 'approved',
  type: 'roadmap',
  lastUpdatedLabel: '3 days ago',
  lastUpdatedTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  story:
    'Follow the exact playbook Amara used to balance leadership impact, GMAT excellence, and scholarship outreach to secure a fully funded Oxford MBA. Each milestone includes templates, outreach scripts, and scorecards.',
  resources: [
    {
      id: 'ox-res-1',
      title: 'Leadership Impact Tracker Template',
      description: 'Spreadsheet template to quantify community and professional impact.',
      url: 'https://example.com/resources/leadership-tracker',
      type: 'tool',
      cost: 'free'
    },
    {
      id: 'ox-res-2',
      title: 'GMAT 740 Study Schedule',
      url: 'https://example.com/resources/gmat-740-plan',
      type: 'article',
      cost: 'free'
    },
    {
      id: 'ox-res-3',
      title: 'Clarendon Scholarship Outreach Email Pack',
      url: 'https://example.com/resources/clarendon-outreach',
      type: 'other',
      cost: 'paid',
      notes: 'Included in premium bundle'
    }
  ],
  roadmap: [
    {
      id: 'ox-stage-1',
      title: 'Months 1-3: Clarify your MBA narrative',
      description: 'Audit achievements, map leadership themes, and shortlist programs.',
      duration: '12 weeks',
      tasks: []
    },
    {
      id: 'ox-stage-2',
      title: 'Months 4-6: GMAT excellence sprint',
      description: 'Target a 720+ GMAT using Amara’s split-day approach.',
      duration: '12 weeks',
      tasks: []
    },
    {
      id: 'ox-stage-3',
      title: 'Months 7-12: Scholarship outreach & essays',
      description: 'Run scholarship outreach cadences and polish your essays.',
      duration: '24 weeks',
      tasks: []
    }
  ],
  stats: {
    rating: 4.9,
    users: 912,
    successRate: 62,
    saves: 420,
    adoptionCount: 318,
    likes: 198,
    comments: 64
  },
  paymentLink: 'https://market.edutu.ai/guides/oxford-mba'
},
{
  id: 'sample-data-science',
  title: 'Pivot to Senior Data Scientist',
  description: 'Isaac moved from support specialist to senior data science through night classes and ML projects.',
    creator: { name: 'Isaac Mensah', avatar: 'DS', title: 'Senior Data Scientist', verified: true },
    creatorEmail: 'isaac@edutu.ai',
    category: 'Programming',
    duration: '14 months',
    difficulty: 'Intermediate',
    rating: 4.8,
    users: 1245,
    successRate: 68,
    tags: ['Python', 'ML', 'Career switch'],
  achievements: ['Senior DS offer', 'Portfolio of 6 projects', 'Conference talk'],
  price: 'Free',
  image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg',
  featured: false,
  status: 'approved',
  type: 'roadmap',
  lastUpdatedLabel: '1 week ago',
  lastUpdatedTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  story:
    'Isaac documents how he balanced a support role with night classes, project-based learning, and community showcases to become a senior data scientist. The guide includes weekly checkpoints and portfolio templates.',
  resources: [
    {
      id: 'ds-res-1',
      title: 'Night School ML Curriculum',
      url: 'https://example.com/resources/night-ml',
      type: 'course',
      cost: 'free'
    },
    {
      id: 'ds-res-2',
      title: 'Portfolio Project Rubric',
      url: 'https://example.com/resources/ds-rubric',
      type: 'tool',
      cost: 'free'
    },
    {
      id: 'ds-res-3',
      title: 'Weekly Study Tracker',
      url: 'https://example.com/resources/study-tracker',
      type: 'tool',
      cost: 'free'
    }
  ],
  roadmap: [
    {
      id: 'ds-stage-1',
      title: 'Weeks 1-6: Solidify Python & statistics',
      description: 'Refresh Python, statistics, and SQL foundations with targeted exercises.',
      duration: '6 weeks',
      tasks: []
    },
    {
      id: 'ds-stage-2',
      title: 'Weeks 7-16: Build portfolio-ready ML projects',
      description: 'Ship three end-to-end projects that demonstrate experimentation and storytelling.',
      duration: '10 weeks',
      tasks: []
    },
    {
      id: 'ds-stage-3',
      title: 'Weeks 17-24: Showcase & grow community proof',
      description: 'Publish case studies, present at meetups, and prepare interview artifacts.',
      duration: '8 weeks',
      tasks: []
    }
  ],
  stats: {
    rating: 4.8,
    users: 1245,
    successRate: 68,
    saves: 512,
    adoptionCount: 402,
    likes: 276,
    comments: 81
  },
  paymentLink: null
}
];

const CREATE_DEFAULTS: CreateRoadmapForm = {
  title: '',
  summary: '',
  story: '',
  roadmapOutline: '',
  resourceNotes: '',
  category: 'Programming',
  duration: '6 months',
  difficulty: 'Intermediate',
  price: 'Free',
  successRate: '60',
  tags: '',
  outcomes: '',
  coverImage: '',
  creatorTitle: '',
  creatorEmail: '',
  paymentLink: '',
  type: 'roadmap'
};

const normaliseDifficulty = (value: unknown): 'Beginner' | 'Intermediate' | 'Advanced' => {
  if (value === 'Beginner' || value === 'Advanced') {
    return value;
  }
  return 'Intermediate';
};

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
};

const ensureImage = (category: string, provided?: string): string => {
  if (provided && provided.trim().length > 0) {
    return provided.trim();
  }
  const key = category.toLowerCase();
  if (key === 'education') {
    return 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg';
  }
  if (key === 'programming') {
    return 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg';
  }
  if (key === 'business') {
    return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
  }
  return 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg';
};

const createLocalId = (prefix: string, index: number) => `${prefix}-${index}-${Math.random().toString(36).slice(2, 10)}`;

const normaliseResourceList = (value: unknown): CommunityResource[] => {
  if (!value) {
    return [];
  }

  const rawList = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [value];

  return rawList
    .map((entry, index) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim();
        if (!trimmed) {
          return null;
        }
        return {
          id: createLocalId('resource', index),
          title: trimmed,
          description: undefined,
          url: undefined,
          type: undefined,
          cost: undefined,
          notes: undefined
        } as CommunityResource;
      }

      if (entry && typeof entry === 'object') {
        const resource = entry as Record<string, unknown>;
        const title =
          typeof resource.title === 'string' && resource.title.trim().length > 0
            ? resource.title.trim()
            : typeof resource.name === 'string'
              ? resource.name.trim()
              : '';
        if (!title) {
          return null;
        }

        const url =
          typeof resource.url === 'string' && resource.url.trim().length > 0
            ? resource.url.trim()
            : typeof resource.link === 'string'
              ? resource.link.trim()
              : undefined;

        const description =
          typeof resource.description === 'string' && resource.description.trim().length > 0
            ? resource.description.trim()
            : undefined;

        const provider =
          typeof resource.provider === 'string' && resource.provider.trim().length > 0
            ? resource.provider.trim()
            : undefined;

        const notes =
          typeof resource.notes === 'string' && resource.notes.trim().length > 0
            ? resource.notes.trim()
            : undefined;

        const type =
          typeof resource.type === 'string' && resource.type.trim().length > 0
            ? (resource.type.trim() as CommunityResource['type'])
            : undefined;

        const cost =
          typeof resource.cost === 'string' && resource.cost.trim().length > 0
            ? (resource.cost.trim() === 'paid' ? 'paid' : 'free')
            : undefined;

        return {
          id:
            (typeof resource.id === 'string' && resource.id.trim().length > 0
              ? resource.id.trim()
              : createLocalId('resource', index)),
          title,
          description,
          url,
          provider,
          type,
          cost,
          notes
        };
      }

      return null;
    })
    .filter((item): item is CommunityResource => Boolean(item));
};

const normaliseRoadmapStages = (value: unknown): CommunityRoadmapStage[] => {
  if (!value) {
    return [];
  }

  const serialiseStringStage = (raw: string, index: number): CommunityRoadmapStage => {
    const trimmed = raw.trim();
    const [heading, ...rest] = trimmed.split(/[-:]/);
    const description = rest.join('-').trim();
    return {
      id: createLocalId('stage', index),
      title: heading.trim() || `Stage ${index + 1}`,
      description: description || undefined,
      tasks: []
    };
  };

  if (typeof value === 'string') {
    const segments = value.split(/\n{2,}|\r\n{2,}/).map((segment) => segment.trim());
    return segments.filter(Boolean).map((segment, index) => serialiseStringStage(segment, index));
  }

  const rawList = Array.isArray(value) ? value : [value];

  return rawList
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return serialiseStringStage(entry, index);
      }

      if (entry && typeof entry === 'object') {
        const stage = entry as Record<string, unknown>;
        const title =
          typeof stage.title === 'string' && stage.title.trim().length > 0
            ? stage.title.trim()
            : typeof stage.name === 'string'
              ? stage.name.trim()
              : '';

        const description =
          typeof stage.description === 'string' && stage.description.trim().length > 0
            ? stage.description.trim()
            : typeof stage.summary === 'string'
              ? stage.summary.trim()
              : undefined;

        const milestone =
          typeof stage.milestone === 'string' && stage.milestone.trim().length > 0
            ? stage.milestone.trim()
            : undefined;

        const duration =
          typeof stage.duration === 'string' && stage.duration.trim().length > 0
            ? stage.duration.trim()
            : undefined;

        const tasksRaw = stage.tasks;
        const tasks =
          Array.isArray(tasksRaw) && tasksRaw.length > 0
            ? tasksRaw
                .map((task, taskIndex) => {
                  if (task && typeof task === 'object') {
                    const taskRecord = task as Record<string, unknown>;
                    const taskTitle =
                      typeof taskRecord.title === 'string' && taskRecord.title.trim().length > 0
                        ? taskRecord.title.trim()
                        : '';
                    if (!taskTitle) {
                      return null;
                    }

                    const taskDescription =
                      typeof taskRecord.description === 'string' && taskRecord.description.trim().length > 0
                        ? taskRecord.description.trim()
                        : undefined;

                    return {
                      id:
                        typeof taskRecord.id === 'string' && taskRecord.id.trim().length > 0
                          ? taskRecord.id.trim()
                          : createLocalId(`task-${index}`, taskIndex),
                      title: taskTitle,
                      description: taskDescription,
                      duration:
                        typeof taskRecord.duration === 'string' && taskRecord.duration.trim().length > 0
                          ? taskRecord.duration.trim()
                          : undefined,
                      resourceIds: Array.isArray(taskRecord.resourceIds)
                        ? (taskRecord.resourceIds.filter((id): id is string => typeof id === 'string') as string[])
                        : undefined,
                      outcome:
                        typeof taskRecord.outcome === 'string' && taskRecord.outcome.trim().length > 0
                          ? taskRecord.outcome.trim()
                          : undefined
                    };
                  }
                  if (typeof task === 'string' && task.trim().length > 0) {
                    return {
                      id: createLocalId(`task-${index}`, taskIndex),
                      title: task.trim(),
                      description: undefined
                    };
                  }
                  return null;
                })
                .filter((task): task is CommunityRoadmapStage['tasks'][number] => Boolean(task))
            : [];

        return {
          id:
            typeof stage.id === 'string' && stage.id.trim().length > 0
              ? stage.id.trim()
              : createLocalId('stage', index),
          title: title || `Stage ${index + 1}`,
          description,
          duration,
          milestone,
          tasks,
          resourceIds: Array.isArray(stage.resourceIds)
            ? (stage.resourceIds.filter((id): id is string => typeof id === 'string') as string[])
            : undefined,
          checkpoint:
            typeof stage.checkpoint === 'string' && stage.checkpoint.trim().length > 0
              ? stage.checkpoint.trim()
              : undefined
        };
      }

      return null;
    })
    .filter((stage): stage is CommunityRoadmapStage => Boolean(stage));
};

const deriveStatsFromPayload = (
  payload: Record<string, unknown>,
  defaults: Pick<CommunityStoryStats, 'rating' | 'users' | 'successRate'>
): CommunityStoryStats => {
  const statsPayload = payload.stats as Record<string, unknown> | undefined;
  const read = (key: string, fallback: number) => {
    if (statsPayload && key in statsPayload) {
      return toNumber(statsPayload[key], fallback);
    }
    if (key in payload) {
      return toNumber(payload[key], fallback);
    }
    return fallback;
  };

  const rating = Math.min(Math.max(read('rating', defaults.rating), 0), 5);
  const users = Math.max(0, Math.round(read('users', defaults.users)));
  const successRate = Math.min(Math.max(read('successRate', defaults.successRate), 1), 100);

  return {
    rating,
    users,
    successRate,
    saves: Math.max(0, Math.round(read('saves', 0))),
    adoptionCount: Math.max(0, Math.round(read('adoptionCount', defaults.users))),
    likes: Math.max(0, Math.round(read('likes', 0))),
    comments: Math.max(0, Math.round(read('comments', 0)))
  };
};

const mapListingToRoadmap = (payload: Record<string, unknown>, id: string): CommunityRoadmap => {
  const category = typeof payload.category === 'string' ? payload.category : 'Community';
  const updatedAt = parseDate(payload.updatedAt ?? payload.createdAt);

  const creatorRecord =
    payload.creator && typeof payload.creator === 'object' ? (payload.creator as Record<string, unknown>) : null;
  const creatorName =
    typeof creatorRecord?.name === 'string' && creatorRecord.name.trim().length > 0
      ? creatorRecord.name.trim()
      : typeof payload.creatorName === 'string'
        ? payload.creatorName
        : 'Community creator';
  const creatorAvatar =
    typeof creatorRecord?.avatar === 'string' && creatorRecord.avatar.trim().length > 0
      ? creatorRecord.avatar.trim()
      : typeof payload.creatorAvatar === 'string' && payload.creatorAvatar.trim().length > 0
        ? payload.creatorAvatar.trim()
        : 'CC';
  const creatorTitle =
    typeof creatorRecord?.title === 'string' && creatorRecord.title.trim().length > 0
      ? creatorRecord.title.trim()
      : typeof payload.creatorTitle === 'string'
        ? payload.creatorTitle
        : '';
  const creatorEmail =
    typeof creatorRecord?.email === 'string' && creatorRecord.email.trim().length > 0
      ? creatorRecord.email.trim()
      : typeof payload.creatorEmail === 'string'
        ? payload.creatorEmail.trim()
        : undefined;
  const creatorVerified =
    typeof creatorRecord?.verified === 'boolean' ? creatorRecord.verified : Boolean(payload.creatorVerified);

  const rawRating = Math.max(4.2, toNumber(payload.rating, 4.7));
  const rawUsers = toNumber(payload.users ?? payload.submissions, 0);
  const rawSuccessRate = Math.min(Math.max(toNumber(payload.successRate, 60), 1), 100);
  const stats = deriveStatsFromPayload(payload, {
    rating: rawRating,
    users: rawUsers,
    successRate: rawSuccessRate
  });

  const story =
    typeof payload.story === 'string' && payload.story.trim().length > 0
      ? payload.story.trim()
      : typeof payload.longDescription === 'string' && payload.longDescription.trim().length > 0
        ? payload.longDescription.trim()
        : typeof payload.description === 'string'
          ? payload.description
          : typeof payload.summary === 'string'
            ? payload.summary
            : 'Community submission awaiting more details.';

  const paymentLink =
    typeof payload.paymentLink === 'string' && payload.paymentLink.trim().length > 0
      ? payload.paymentLink.trim()
      : typeof payload.checkoutUrl === 'string' && payload.checkoutUrl.trim().length > 0
        ? payload.checkoutUrl.trim()
        : typeof payload.purchaseLink === 'string' && payload.purchaseLink.trim().length > 0
          ? payload.purchaseLink.trim()
          : undefined;

  return {
    id,
    title: typeof payload.title === 'string' ? payload.title : 'Untitled submission',
    description:
      typeof payload.description === 'string' && payload.description.trim().length > 0
        ? payload.description
        : typeof payload.summary === 'string'
          ? payload.summary
          : 'Community submission awaiting more details.',
    creator: {
      name: creatorName,
      avatar: creatorAvatar,
      title: creatorTitle,
      verified: creatorVerified
    },
    creatorEmail,
    category,
    duration: typeof payload.duration === 'string' ? payload.duration : 'Flexible',
    difficulty: normaliseDifficulty(payload.difficulty),
    rating: stats.rating,
    users: stats.users,
    successRate: stats.successRate,
    tags: toStringList(payload.tags),
    achievements: toStringList(payload.outcomes ?? payload.achievements),
    price: payload.priceType === 'premium' ? 'Premium' : 'Free',
    image: ensureImage(
      category,
      typeof payload.coverImage === 'string'
        ? payload.coverImage
        : typeof payload.image === 'string'
          ? payload.image
          : undefined
    ),
    featured: Boolean(payload.featured),
    status: payload.status === 'approved' ? 'approved' : payload.status === 'hidden' ? 'hidden' : 'pending',
    type: payload.type === 'marketplace' ? 'marketplace' : 'roadmap',
    lastUpdatedLabel: updatedAt.toLocaleDateString(),
    lastUpdatedTimestamp: updatedAt.getTime(),
    story,
    resources: normaliseResourceList(payload.resources),
    roadmap: normaliseRoadmapStages(payload.roadmap),
    stats,
    paymentLink
  };
};

const CommunityMarketplace: React.FC<CommunityMarketplaceProps> = ({ onBack, onRoadmapSelect, user }) => {
  const { isDarkMode } = useDarkMode();
  const { toast } = useToast();

  const [ remoteRoadmaps, setRemoteRoadmaps ] = useState<CommunityRoadmap[]>([]);
  const [ loadingRemote, setLoadingRemote ] = useState(true);
  const [ hasRealtimeData, setHasRealtimeData ] = useState(false);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ categoryFilter, setCategoryFilter ] = useState<string>('All');
  const [ typeFilter, setTypeFilter ] = useState<'all' | 'roadmap' | 'marketplace'>('all');
  const [ priceFilter, setPriceFilter ] = useState<'all' | 'Free' | 'Premium'>('all');
  const [ difficultyFilter, setDifficultyFilter ] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [ tagFilter, setTagFilter ] = useState<string>('All');
  const [ verifiedOnly, setVerifiedOnly ] = useState(false);
  const [ sortOption, setSortOption ] = useState<SortOption>('Popular');
  const [ showFilters, setShowFilters ] = useState(false);
  const [ selectedRoadmap, setSelectedRoadmap ] = useState<CommunityRoadmap | null>(null);
  const [ detailOpen, setDetailOpen ] = useState(false);
  const [ createOpen, setCreateOpen ] = useState(false);
  const [ submitting, setSubmitting ] = useState(false);
  const [ submissionMessage, setSubmissionMessage ] = useState<string | null>(null);
  const [ formState, setFormState ] = useState<CreateRoadmapForm>({ ...CREATE_DEFAULTS });
  const [ likeLoading, setLikeLoading ] = useState(false);
  const [ saveLoading, setSaveLoading ] = useState(false);
  const [ adoptLoading, setAdoptLoading ] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoadingRemote(false);
      setHasRealtimeData(false);
      return;
    }

    const listener = onSnapshot(
      query(collection(db, 'community_marketplace'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const mapped = snapshot.docs.map((doc) =>
          mapListingToRoadmap(doc.data() as Record<string, unknown>, doc.id)
        );
        setRemoteRoadmaps(mapped);
        setHasRealtimeData(true);
        setLoadingRemote(false);
      },
      () => {
        setHasRealtimeData(false);
        setLoadingRemote(false);
      }
    );

    return () => listener();
  }, []);

  const combinedRoadmaps = hasRealtimeData && remoteRoadmaps.length > 0 ? remoteRoadmaps : FALLBACK_ROADMAPS;

  const approvedRoadmaps = useMemo(
    () => combinedRoadmaps.filter((roadmap) => roadmap.status === 'approved'),
    [combinedRoadmaps]
  );

  const categories = useMemo(() => {
    const unique = new Set<string>();
    approvedRoadmaps.forEach((roadmap) => unique.add(roadmap.category));
    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [approvedRoadmaps]);

  useEffect(() => {
    if (categoryFilter !== 'All' && !categories.includes(categoryFilter)) {
      setCategoryFilter('All');
    }
  }, [categories, categoryFilter]);

  const filteredRoadmaps = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return approvedRoadmaps
      .filter((roadmap) => {
        const matchesSearch =
          search.length === 0 ||
          roadmap.title.toLowerCase().includes(search) ||
          roadmap.description.toLowerCase().includes(search) ||
          roadmap.creator.name.toLowerCase().includes(search) ||
          roadmap.tags.some((tag) => tag.toLowerCase().includes(search));

        const matchesCategory =
          categoryFilter === 'All' || roadmap.category.toLowerCase() === categoryFilter.toLowerCase();

        const matchesPrice = sortOption === 'Free Only' ? roadmap.price === 'Free' : true;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'Newest':
            return b.lastUpdatedTimestamp - a.lastUpdatedTimestamp;
          case 'Highest Rated':
            return b.rating - a.rating;
          case 'Most Used':
            return b.users - a.users;
          default:
            return Number(b.featured) - Number(a.featured) || b.successRate - a.successRate;
        }
      });
  }, [approvedRoadmaps, categoryFilter, sortOption, searchTerm]);

  useEffect(() => {
    if (!selectedRoadmap && filteredRoadmaps.length > 0) {
      setSelectedRoadmap(filteredRoadmaps[0]);
      return;
    }
    if (selectedRoadmap && filteredRoadmaps.length > 0) {
      const stillPresent = filteredRoadmaps.find((roadmap) => roadmap.id === selectedRoadmap.id);
      if (!stillPresent) {
        setSelectedRoadmap(filteredRoadmaps[0]);
      }
      return;
    }
    if (filteredRoadmaps.length === 0) {
      setSelectedRoadmap(null);
    }
  }, [filteredRoadmaps, selectedRoadmap]);

  const resetForm = () => setFormState({ ...CREATE_DEFAULTS });

  const handleCreateRoadmap = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedTitle = formState.title.trim();
    const trimmedSummary = formState.summary.trim();

    if (!trimmedTitle || !trimmedSummary) {
      toast({
        title: 'Add a title and summary',
        description: 'Share a short title and description so learners know what your roadmap covers.',
        variant: 'error'
      });
      return;
    }

    if (!db) {
      toast({
        title: 'Submission unavailable',
        description: 'Connect Firebase to enable community roadmap submissions.',
        variant: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'community_marketplace'), {
        title: trimmedTitle,
        summary: trimmedSummary,
        description: trimmedSummary,
        category: formState.category.trim() || 'Community',
        duration: formState.duration.trim() || 'Flexible',
        difficulty: formState.difficulty,
        priceType: formState.price === 'Premium' ? 'premium' : 'free',
        successRate: Math.min(Math.max(Number.parseInt(formState.successRate || '60', 10), 1), 100),
        tags: toStringList(formState.tags),
        outcomes: toStringList(formState.outcomes),
        coverImage: formState.coverImage.trim() || null,
        creatorName: user?.name ?? 'Anonymous learner',
        creatorEmail: formState.creatorEmail.trim() || null,
        creatorTitle: formState.creatorTitle.trim() || null,
        type: 'roadmap',
        status: 'pending',
        featured: false,
        likes: 0,
        submissions: 0,
        users: 0,
        createdAt: serverTimestamp()
      });

      setCreateOpen(false);
      resetForm();
      setSubmissionMessage('Your roadmap has been submitted for review. We will notify you once it is live.');
      toast({
        title: 'Submission received',
        description: 'Thank you for sharing your success story!',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to submit roadmap',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const { themeClass } = useMemo(() => ({ themeClass: isDarkMode ? 'dark' : '' }), [isDarkMode]);

  const displayRoadmaps = filteredRoadmaps;

  return (
    <div className={`min-h-screen bg-white transition-theme dark:bg-gray-900 ${themeClass}`}>
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="p-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Globe size={22} className="text-primary" />
              Community Marketplace
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Submit your roadmap and explore stories the admin team has approved for learners.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search roadmaps, creators, or topics"
              className="w-full rounded-2xl border-gray-200 pl-9 pr-12 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition ${
                showFilters
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Filter size={14} />
            </button>
          </div>
          {showFilters && (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        size="sm"
                        variant={categoryFilter === category ? 'primary' : 'secondary'}
                        onClick={() => {
                          setCategoryFilter(category);
                          setShowFilters(false);
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sort</p>
                  <Select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value as SortOption)}
                    className="mt-2 w-full"
                  >
                    <option value="Popular">Popular</option>
                    <option value="Newest">Newest</option>
                    <option value="Highest Rated">Highest rated</option>
                    <option value="Most Used">Most used</option>
                    <option value="Free Only">Free only</option>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        {submissionMessage && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
            {submissionMessage}
          </div>
        )}

        {loadingRemote && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            Syncing the latest community submissions...
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Approved roadmaps</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{filteredRoadmaps.length} published</span>
          </div>
          {filteredRoadmaps.length === 0 ? (
            <Card className="border border-dashed border-gray-300 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
              No roadmaps match your filters yet. Try adjusting the search or submit your own success story.
            </Card>
          ) : (
            filteredRoadmaps.map((roadmap) => (
              <Card
                key={roadmap.id}
                className="border border-gray-200 transition hover:border-primary/40 dark:border-gray-700"
                onClick={() => onRoadmapSelect(roadmap)}
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <img
                    src={roadmap.image}
                    alt={roadmap.title}
                    className="h-24 w-full rounded-xl object-cover md:h-28 md:w-32"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{roadmap.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{roadmap.description}</p>
                      </div>
                      <span className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-300">
                        {roadmap.price}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {roadmap.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {roadmap.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {roadmap.users.toLocaleString()} learners
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} />
                        {roadmap.rating.toFixed(1)}
                      </span>
                      <span>{roadmap.lastUpdatedLabel}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 dark:border-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {roadmap.achievements.slice(0, 3).map((achievement) => (
                        <span key={achievement} className="flex items-center gap-1">
                          <CheckCircle size={12} className="text-green-500" />
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>

        <section>
          <Card className="border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 dark:border-primary/40 dark:from-primary/20 dark:to-accent/20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
                <Plus size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share your success story</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Submit a roadmap for review. The admin team will approve it before it becomes visible in the marketplace.
              </p>
              <Button type="button" className="mt-4 inline-flex items-center gap-2" onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                Create roadmap
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (submitting) return;
          setCreateOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent preventCloseOnBackdropClick={submitting} className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share your success story</DialogTitle>
            <DialogDescription>
              Tell us about the roadmap or offer you created. An admin will review the submission before it appears in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateRoadmap}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</label>
                <Input
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="From intern to senior product manager"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
                <Input
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="Programming, Business, Education..."
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Short summary</label>
              <Textarea
                rows={4}
                value={formState.summary}
                onChange={(event) => setFormState((prev) => ({ ...prev, summary: event.target.value }))}
                placeholder="What did you accomplish and how can learners follow this roadmap?"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</label>
                <Input
                  value={formState.duration}
                  onChange={(event) => setFormState((prev) => ({ ...prev, duration: event.target.value }))}
                  placeholder="e.g. 9 months"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</label>
                <Select
                  value={formState.difficulty}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      difficulty: event.target.value as CreateRoadmapForm['difficulty']
                    }))
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price</label>
                <Select
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, price: event.target.value as CreateRoadmapForm['price'] }))
                  }
                >
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Success rate (%)</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formState.successRate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, successRate: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cover image URL</label>
                <Input
                  value={formState.coverImage}
                  onChange={(event) => setFormState((prev) => ({ ...prev, coverImage: event.target.value }))}
                  placeholder="Optional image to spotlight your story"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Key outcomes (comma separated)</label>
                <Textarea
                  rows={3}
                  value={formState.outcomes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, outcomes: event.target.value }))}
                  placeholder="Promotion to senior engineer, Published research paper, Scholarship award"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags (comma separated)</label>
                <Textarea
                  rows={3}
                  value={formState.tags}
                  onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="Leadership, Scholarships, Remote work"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your role or title</label>
                <Input
                  value={formState.creatorTitle}
                  onChange={(event) => setFormState((prev) => ({ ...prev, creatorTitle: event.target.value }))}
                  placeholder="Lead product manager at Edutu"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact email (optional)</label>
                <Input
                  type="email"
                  value={formState.creatorEmail}
                  onChange={(event) => setFormState((prev) => ({ ...prev, creatorEmail: event.target.value }))}
                  placeholder="We will notify you once approved"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (submitting) return;
                  setCreateOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for review'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityMarketplace;
