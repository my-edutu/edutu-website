# Edutu Project

AI-powered education platform connecting learners to opportunities, scholarships, courses, and mentorship globally.

## Quick Start

```bash
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps
npm run lint         # Lint all projects
```

## Project Structure

```
apps/
  web/          # Main app (Vite + React + Clerk + Supabase)
  mobile/       # Mobile app (Expo + React Native)
  admin/        # Admin panel (Vite + React)
  landing/      # Landing page (Vite + React)

services/
  api/          # NestJS backend API with Drizzle ORM

packages/
  core/         # Shared TypeScript types and utilities
```

## Documentation

- **Roadmap**: [docs/ROADMAP.md](docs/ROADMAP.md) — Full build plan with phases and tasks
- **API**: services/api/README.md

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Mobile**: Expo, React Native, NativeWind
- **Backend**: NestJS, Drizzle ORM, PostgreSQL
- **Auth**: Clerk
- **Database/Storage**: Supabase + self-hosted PostgreSQL
- **Hosting**: Vercel (apps), Railway/Render (API)

## Environment Variables

Each app has its own `.env` file:
- `apps/web/.env`
- `apps/mobile/.env`
- `apps/admin/.env`
- `services/api/.env`

Required keys:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL` (API only)