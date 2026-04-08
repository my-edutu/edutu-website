# EduTu Mobile App

An AI-powered education platform connecting learners to global opportunities, scholarships, courses, and mentorship.

## Tech Stack

- **Framework**: Expo SDK 55 (React Native 0.83.4)
- **Routing**: expo-router v5 (file-based routing)
- **Styling**: NativeWind (Tailwind CSS) + StyleSheet
- **Auth**: Clerk SDK v2
- **Database**: Supabase (PostgreSQL)
- **State**: React Context + Hooks
- **UI Components**: Radix UI primitives + Custom components
- **Icons**: Lucide React Native

## Project Structure

```
edutu_mobile/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (app)/                   # Authenticated app routes
│   │   ├── _layout.tsx          # App shell with bottom navigation
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── explore.tsx          # Explore opportunities
│   │   ├── chat.tsx             # AI Coach chat
│   │   ├── marketplace.tsx      # Learning roadmaps
│   │   ├── goals/               # Goal tracking
│   │   ├── opportunities/       # Opportunity details
│   │   └── profile/             # User profile & settings
│   ├── (auth)/                  # Authentication routes
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── reset-password.tsx
│   ├── onboarding/              # Onboarding flow
│   ├── creator/                 # Creator dashboard
│   └── _layout.tsx              # Root layout with providers
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI primitives
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ScreenHeader.tsx
│   │   └── EmptyState.tsx
│   └── context/                 # React Context providers
│       └── ThemeContext.tsx
│
├── constants/                   # App constants & config
│   ├── colors.ts               # Color tokens
│   └── config.ts               # App configuration
│
├── lib/                         # Core utilities & services
│   ├── supabase.ts             # Supabase client
│   ├── api.ts                  # API service layer
│   └── utils.ts                # Utility functions
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useOpportunities.ts
│   ├── useGoals.ts
│   └── useChat.ts
│
├── types/                       # TypeScript type definitions
│   ├── opportunity.ts
│   ├── goal.ts
│   ├── user.ts
│   └── api.ts
│
├── services/                    # External service integrations
│   └── supabase/               # Supabase service functions
│
├── app/                         # Data files (onboarding)
│   └── data/
│       └── onboarding-data.ts
│
└── cache.ts                     # Secure token storage
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Expo Dev Client (for native builds)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following:

```env
# Clerk Auth
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API (optional)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## App Flow

### Authentication

1. **Onboarding Welcome** → First-time users see intro screens
2. **Sign Up / Sign In** → Clerk authentication
3. **Onboarding** → Collect user preferences (country, interests, goals)
4. **Dashboard** → Personalized home screen

### Main Features

- **Dashboard**: Personalized opportunities, goals stats, quick actions
- **Explore**: Search & filter opportunities
- **AI Coach**: Chat with Edutu AI for guidance
- **Marketplace**: Discover learning roadmaps
- **Goals**: Track personal objectives
- **Profile**: Settings, notifications, creator tools

## Architecture

### State Management

- **Theme**: React Context (`ThemeContext`)
- **Auth**: Clerk hooks (`useAuth`, `useUser`)
- **Data**: Custom hooks with SWR-like pattern

### API Layer

All API calls go through the service layer:
- `lib/api.ts` - Base API client with error handling
- `services/supabase/` - Database operations
- Custom hooks encapsulate business logic

### Security

- Token storage via expo-secure-store
- Input validation on all forms
- Error boundary for crash handling
- Proper error messages (no stack traces exposed)

## Contributing

1. Follow existing code style
2. Use TypeScript for all new files
3. Add proper JSDoc comments
4. Test on both iOS and Android
5. Run lint before committing

## License

Private - All rights reserved