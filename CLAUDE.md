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

### Authentication Architecture Overhaul (Completed - Dec 2024)
#### Critical Issues Fixed:
- ✅ **Removed NextAuth Mixed Architecture**: Eliminated all NextAuth references (auth.ts, auth.config.ts, API routes)
- ✅ **Consolidated Auth Components**: Unified `/components/auth/` directory structure, removed duplicate SignIn/SignUp forms
- ✅ **Verified Database Functions**: Confirmed `check_user_exists` and `create_user_profile_safe` functions exist and work correctly
- ✅ **Enhanced Type Safety**: Replaced all `any` types with proper TypeScript interfaces
- ✅ **Quality Assurance**: All TypeScript errors resolved, ESLint passes clean

#### Key Architectural Decisions:
- **Pure Supabase Authentication**: Project now uses 100% Supabase auth (no NextAuth dependencies)
- **Unified Component Structure**: Single `/components/auth/` directory for all auth-related components
- **Strong Type Safety**: Created comprehensive `types/auth.types.ts` with proper interfaces
- **Database Function Verification**: Used Supabase MCP tools to verify production database functions
- **Environment Cleanup**: Removed NextAuth environment variables, updated service configurations

#### Type Safety Improvements:
- **AuthState Interface**: Proper typing for user, session, and profile states
- **GoogleAuthResponse**: Strongly typed OAuth response handling
- **ActivityData/ReactionData/CommentData**: Comprehensive interfaces for friends store
- **MediaData Types**: ScreenshotData, VideoData, GameData interfaces for media processing
- **FilterValue Type**: Proper typing for games store filter values

#### Authentication Flow Architecture:
```
User → AuthForm (SignIn/SignUp) → Supabase Auth → Database Functions → Profile Creation
                                                                   ↓
Authentication State (Zustand) ← Session Management ← User Profile Fetch
```

#### Database Functions Confirmed:
- `check_user_exists(user_email text)` → Returns JSONB with user existence info
- `create_user_profile_safe(user_id uuid, user_email text, user_metadata jsonb)` → Creates user profile safely

#### Files Structure Post-Cleanup:
```
/components/auth/
├── AuthForm.tsx (main form component)
├── AuthInitializer.tsx (session initialization)
├── AuthOptimizer.tsx (performance optimization)
├── AuthSkeleton.tsx (loading states)
├── SignInForm.tsx (wrapper component)
├── SignUpForm.tsx (wrapper component)
└── Other auth utilities...

/types/
└── auth.types.ts (comprehensive auth type definitions)
```

## Development Guidelines & Lessons Learned

### Authentication Best Practices
- **Single Source of Truth**: Use only Supabase for authentication - avoid mixing auth providers
- **Type Safety First**: Always define proper TypeScript interfaces before implementing features
- **Database Function Verification**: Use Supabase MCP tools to verify database functions exist before deployment
- **Component Organization**: Keep auth components in a single directory with clear naming conventions
- **Environment Variables**: Clean up unused environment variables to avoid confusion

### Code Quality Standards
- **No `any` Types**: Replace all `any` types with specific interfaces
- **Consistent Error Handling**: Use standardized error handling patterns across auth flows  
- **Type Checking**: Always run `npm run type-check` before commits
- **Component Consolidation**: Eliminate duplicate components and prefer single, well-designed components
- **Import Management**: Use consistent import paths and avoid hardcoded URLs

### Architecture Patterns
- **Pure Supabase Architecture**: 
  ```
  Frontend (Next.js) → Supabase Auth → Database → Profile Management
  ```
- **State Management**: Use Zustand for auth state with proper TypeScript interfaces
- **Database Functions**: Leverage Supabase RPC functions for complex auth operations
- **Security**: Always use server-side Supabase clients for sensitive operations

### Testing & Verification
- **MCP Tools**: Use Supabase MCP tools to verify database state and functions
- **Type Safety**: Ensure `tsc --noEmit` passes without errors
- **Lint Compliance**: Maintain ESLint compliance with `npm run lint`
- **Manual Testing**: Test complete auth flows (signup, signin, profile creation)