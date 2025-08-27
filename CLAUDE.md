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

### All-Games Page Improvements (Completed - Aug 2024)
#### Issues Fixed:
- ✅ **Fixed Pagination Duplication**: All-games page was returning same games for all pages due to missing pagination support
- ✅ **Resolved CSP Violations**: RAWG background images causing service worker CSP violations fixed by prioritizing IGDB images
- ✅ **Enhanced Infinite Scroll**: Proper accumulation of game pages for seamless user experience

#### Technical Implementation:
- **IGDB Service Enhancement**: Added pagination support to `IGDBService.getPopularGames(limit, page)` using IGDB's offset parameter
- **Unified Service Architecture**: Created `UnifiedGameService.getPopularGamesPaginated()` method for proper pagination with metadata
- **API Route Optimization**: Updated `/api/games` route to use paginated method for `category='all'` requests
- **Background Image Strategy**: Modified hybrid merging to prioritize IGDB images over RAWG to prevent CSP violations

#### Sustainability Analysis:
- **Performance**: ✅ Excellent - API performs well even at page 100+ (tested with 2400+ games offset)
- **Scalability**: ✅ Good - IGDB offset-based pagination scales linearly, no performance degradation
- **Caching**: ✅ Optimal - React Query handles client-side caching, 5-30min server cache depending on mobile
- **Memory Usage**: ✅ Efficient - Infinite scroll only loads data as needed, React Query manages memory
- **Rate Limiting**: ✅ Protected - IGDB rate limiter prevents API abuse
- **Error Handling**: ✅ Robust - Fallback mechanisms and proper error states

#### Key Files Modified:
- `services/igdb.ts`: Added page parameter to getPopularGames method
- `services/unifiedGameService.ts`: Created getPopularGamesPaginated + fixed hybrid background image priority
- `app/api/games/route.ts`: Updated category='all' logic to use paginated method
- `hooks/IGDB/use-igdb.ts`: Updated to use new pagination signature

#### Cleanup Completed:
- **Removed Dead Files**: Cleaned up deleted files from git status (migration docs, temp files, old SQL dumps)
- **Fixed Compatibility**: Updated all IGDBService.getPopularGames() calls to use new (limit, page) signature
- **No Redundant Code**: All changes are necessary and integrated, no duplicate implementations

### Explore Page Data Quality Improvements (Completed - Aug 2024)
#### Issues Fixed:
- ✅ **Corrected Data Sources**: Fixed explore page sections showing incorrect data from RAWG instead of properly configured IGDB
- ✅ **Fixed "Recently Released"**: Now shows actual latest releases sorted by date (newest first) instead of old games with high ratings
- ✅ **Improved "Coming Soon"**: Enhanced upcoming games filtering to show truly anticipated titles with proper date ranges

#### Root Cause Analysis:
- **Source Selection Issue**: UnifiedGameService was configured to prefer RAWG for `recent` and `upcoming` games instead of IGDB
- **Data Quality Problem**: RAWG was returning 2025 future releases in "Recently Released" section, causing user confusion
- **Logic Mismatch**: "Recently Released" was sorting by rating count rather than actual release date

#### Technical Implementation:
- **Updated Source Priority**: Modified `getOptimalSource()` in UnifiedGameService to prefer IGDB for all game categories
- **Enhanced Date Logic**: Implemented dynamic date calculations that adapt to current system date
- **Improved Sorting Strategy**: Changed "Recently Released" to sort by `first_release_date desc` for true chronological order

#### Date Range Logic:
```typescript
// Recent Games (Actually Released)
const now = Math.floor(Date.now() / 1000);
const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60);
// Filter: first_release_date >= sixMonthsAgo & first_release_date <= now
// Sort: first_release_date desc (newest first)
// Requirements: total_rating_count >= 3, cover != null

// Upcoming Games (Future Releases)
const oneWeekFromNow = now + (7 * 24 * 60 * 60);
const eighteenMonthsAhead = now + (18 * 30 * 24 * 60 * 60);
// Filter: first_release_date >= oneWeekFromNow & first_release_date <= eighteenMonthsAhead
// Sort: hypes desc (most anticipated first)
// Requirements: hypes >= 5, cover != null
```

#### Results:
- **Recently Released**: Shows actual latest games (e.g., "The Rogue Prince of Persia" Aug 2025, "Mafia: The Old Country" Aug 2025)
- **Coming Soon**: Shows properly anticipated upcoming titles (e.g., "Grand Theft Auto VI" 2026, "Vampire: The Masquerade - Bloodlines 2" 2025)
- **Data Source**: All sections now consistently use IGDB (`dataSource: "igdb"`) for unified data quality
- **Sustainability**: Dynamic date calculations ensure logic continues working correctly over time

#### Key Files Modified:
- `services/unifiedGameService.ts`: Updated optimal source selection to prefer IGDB
- `services/igdb.ts`: Enhanced `getRecentGames()` and `getUpcomingGames()` with proper date logic and sorting
- `app/api/explore/route.ts`: Added cache refresh mechanism for development testing

### Video Gallery & Media Tab Fixes (Completed - Aug 2024)
#### Issues Fixed:
- ✅ **Fixed Video Display**: Media tab videos were not displaying due to missing `video_id` field in processed video data
- ✅ **Fixed Watch Trailer Button**: GameHero "Watch Trailer" button was not working due to incorrect video URL processing
- ✅ **Resolved Data Transformation**: Video data was being incorrectly transformed, losing the crucial `video_id` field from IGDB

#### Root Cause Analysis:
- **Data Loss in Transformation**: The `useGameDetailsStore` was over-processing video data from the IGDB service, inadvertently removing the `video_id` field
- **IGDB Service Correctness**: The IGDB service (`services/igdb.ts`) was correctly creating video objects with all required fields including `video_id`
- **Pipeline Issue**: Video data was being transformed multiple times, with the game details store transformation removing crucial fields

#### Technical Implementation:
- **Preserved Original Video Structure**: Modified `useGameDetailsStore.processGameData()` to preserve the `video_id` field from API responses
- **Fixed Media Store Processing**: Updated `useMediaStore.processGameMedia()` to correctly extract YouTube video IDs from the preserved `video_id` field
- **Enhanced GameHero Integration**: Updated GameHero component to properly construct YouTube URLs from video data with `video_id`

#### Data Flow After Fix:
```typescript
IGDB API Response → Game Details Store (preserve video_id) → Media Store (process video_id) → Components (working videos)
```

#### Key Technical Details:
- **IGDB Service**: Correctly creates video objects with `video_id`, `url`, `thumbnail_url`, and `provider` fields
- **Game Details Store**: Now preserves all original video fields while ensuring type compatibility
- **Media Store**: Processes videos using the preserved `video_id` to generate proper YouTube embed URLs
- **Components**: Both MediaTab and GameHero now receive properly structured video data

#### Files Modified:
- `stores/useGameDetailsStore.ts`: Fixed video data processing to preserve `video_id` field
- `stores/useMediaStore.ts`: Enhanced video processing logic to use `video_id` directly
- `components/game/hero/GameHero.tsx`: Improved trailer URL construction logic
- `components/game/tabs/MediaTab.tsx`: Already correctly structured for video display

#### Key Lesson Learned:
- **Data Preservation**: When transforming API data through multiple layers (API → Store → Component), it's crucial to preserve all necessary fields
- **Debugging Strategy**: Console logging at each transformation step helps identify where data loss occurs
- **Type Safety vs Functionality**: Ensure type compatibility transformations don't remove essential functional data