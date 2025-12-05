# Edutu - Your AI Opportunity Coach

## Project Snapshot
Edutu delivers a high fidelity, mobile first learner experience with React and TypeScript. The current build showcases the product vision around opportunity discovery, personal goal tracking, roadmap guidance, and CV tooling while persisting data in the browser. References to AI mentorship and Firebase are aspirational; no production backend is wired in yet.

## Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tooling**: Vite
- **Icons**: Lucide React
- **Fonts**: Inter and Outfit

## Project Structure
```
edutu app/
  public/
    data/                # Static JSON datasets (opportunities catalog)
  src/
    components/          # Learner screens and UI modules
    design-system/       # Theme tokens and shared UI primitives
    firebase/            # Firebase config stub (unused)
    hooks/               # Local storage and analytics hooks
    pages/api/           # Edge handler prototype for chat proxy
    services/            # Helpers over localStorage and static JSON
    types/               # Shared TypeScript models
    App.tsx              # Learner screen state machine
    main.tsx             # Entry point (providers + renderer)
  package.json
  tailwind.config.js
  vite.config.ts
```

## Implemented Features
- **Screen based Navigation**: `App.tsx` drives landing, auth, dashboard, opportunity, roadmap, profile, settings, notifications, help, and community screens without react-router.
- **Opportunity Explorer**: Static data from `public/data/opportunities.json` feeds featured cards, list filters, and detail views with roadmap hand offs.
- **Goal and Roadmap Management**: `GoalsProvider` persists goals in `localStorage` (`edutu_goals_v1`), offers templates, and renders progress visualisations.
- **Analytics Touchpoints**: `AnalyticsProvider` tracks opportunities explored, chat sessions, days active, and goals completed, also persisted locally.
- **CV Toolkit Simulation**: `cvService.ts` mimics upload, ATS analysis, optimisation, and AI assisted generation flows stored in `localStorage` (`edutu.cv.records`).
- **Notification and Community Mock Data**: Inbox, marketplace, and support flows read from seeded arrays to demonstrate UX direction.
- **Dark Mode**: `useDarkMode` toggles CSS variables that Tailwind utilities consume for themed UI.

## Not Yet Production Ready
- **Authentication**: Firebase is configured but unused; auth screens simulate accounts.
- **AI Chat**: `ChatInterface.tsx` throws until a backend proxy handles OpenRouter calls. A prototype exists at `src/pages/api/chat.js`.
- **Server Persistence**: All stateful experiences rely on browser storage, no Firestore or REST APIs yet.
- **Community and Support Integrations**: Marketplace data, support responses, and announcements are static fixtures.
- **n8n Integration**: Basic webhook service exists (`src/services/n8nIntegration.ts`) but requires backend endpoint implementation for production.

## Data Model Overview
- `usePersistentState` wraps `localStorage` for reusable statefulness.
- `GoalsProvider` supplies CRUD helpers and computed metadata to goal aware components.
- `AnalyticsProvider` watches user actions and exposes derived stats to dashboards and profile cards.
- `services/opportunities.ts` normalises the static opportunities payload and caches results per session.
- `cvService.ts` contains deterministic generators and analysers that emulate backend behaviour.

## Developer Workflow
1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Build for production: `npm run build`

## Architecture Notes
- The app favours a controlled screen state over routing to keep prototypes fast.
- Providers (`GoalsProvider`, `AnalyticsProvider`) wrap `<App />` in `main.tsx`, guaranteeing access to shared state.
- Firebase, chat proxy, and other backend hooks are intentionally decoupled, keeping the current build as a polished front end sandbox ready for real services.
