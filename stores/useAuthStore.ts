// TEMPORARY PLACEHOLDER - REDIRECT TO OPTIMIZED STORE
// This prevents build errors while migrating to useAuthStoreOptimized

import { 
  useAuthUser, 
  useAuthStatus, 
  useAuthActions
} from './useAuthStoreOptimized';

// Legacy compatibility wrapper
export const useAuthStore = () => {
  console.warn('⚠️ Using legacy useAuthStore - please migrate to useAuthStoreOptimized selectors');
  
  const { user } = useAuthUser();
  const { isLoading, isInitialized, error } = useAuthStatus();
  const actions = useAuthActions();

  return {
    // State
    user,
    session: null, // Not exposed in optimized version
    profile: user?.profile || null,
    isLoading,
    error,
    isInitialized,
    
    // Actions - redirect to optimized store
    ...actions
  };
};