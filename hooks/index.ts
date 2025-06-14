// Optimized hooks for game functionality
export { useGameFetch } from './Games/useGameFetch';
export type { GameFetchSource } from './Games/useGameFetch';

export { useExploreOptimized } from './useExploreOptimized';
export { useOptimizedSearch } from './useOptimizedSearch';
export { useDebounce } from './useDebounce';
export { useAuthActions, useAuthState, useAuthUser, useAuthLoading } from './useAuthOptimized';