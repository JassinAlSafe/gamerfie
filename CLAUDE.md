# Claude AI Assistant Configuration

This file contains configuration and context for Claude AI assistant when working on the Gamerfie project.

## Project Overview
Gamerfie is a Next.js gaming platform that allows users to track games, create challenges, manage friends, and share activities.

## Key Technologies
- Next.js 14 with App Router
- TypeScript
- Supabase (Database & Auth)
- Tailwind CSS
- Zustand (State Management)
- React Query/TanStack Query

## Common Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks (note: project uses Next.js built-in type checking)

## Project Structure
- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and configurations
- `/stores` - Zustand state management stores
- `/types` - TypeScript type definitions
- `/utils` - Helper utilities
- `/supabase` - Database migrations and configurations

## Important Notes
- This project uses Supabase for authentication and database
- All API routes follow Next.js App Router conventions
- State management is handled with Zustand stores
- The project includes a comprehensive challenge system
- Friend system and activity feeds are core features

## Recent Code Quality Improvements
### First Batch (Completed)
- ✅ Removed duplicate auth store implementations
- ✅ Removed redundant Supabase client wrapper file
- ✅ Fixed security vulnerabilities with innerHTML usage

### API Routes Improvements (Completed)
- ✅ Fixed mixed Supabase client usage (client vs server)
- ✅ Removed unused imports from API routes
- ✅ Created standardized authentication helper (`app/api/lib/auth.ts`)
- ✅ Improved error handling consistency
- ✅ All API routes now use server-side Supabase client for security

### Component Optimizations (Completed)
- ✅ Removed duplicate GameCard components (eliminated 4 duplicates)
- ✅ Cleaned up dead code (removed commented-out components)
- ✅ Added React.memo to performance-critical components (GameCard, ListViewGameCard, FriendCard)
- ✅ Fixed duplicate dialog components (removed redundant completion/status dialogs)
- ✅ Improved component structure and maintainability

### Infrastructure Optimizations (Completed)
- ✅ Fixed duplicate useToast implementations (consolidated into single source)
- ✅ Removed duplicate useProfile hooks (standardized on React Query version)
- ✅ Consolidated duplicate type definitions (GameStats, AuthError interfaces)
- ✅ Removed hardcoded API endpoints and added proper validation
- ✅ Enhanced type safety across hooks, types, and services

### Utils & Final Optimizations (Completed)
- ✅ Fixed critical missing imports that would cause runtime errors
- ✅ Resolved duplicate Next.js configuration files (merged into single .mjs)
- ✅ Consolidated duplicate Supabase client implementations
- ✅ Merged duplicate utility functions (formatters consolidation)
- ✅ Removed unused and duplicate files across utils directory
- ✅ Updated all imports to use modern patterns and consolidated sources