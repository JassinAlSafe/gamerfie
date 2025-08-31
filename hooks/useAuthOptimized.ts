// DEPRECATED: Use hooks from useAuthStoreOptimized directly
// This file is kept for backward compatibility
import { 
  useAuthActions as useAuthActionsOptimized,
  useAuthUser as useAuthUserOptimized,
  useAuthStatus as useAuthStatusOptimized 
} from '@/stores/useAuthStoreOptimized';

export const useAuthActions = useAuthActionsOptimized;

export const useAuthState = () => {
  const { user } = useAuthUserOptimized();
  const { isLoading, error, isInitialized } = useAuthStatusOptimized();

  return {
    user,
    isLoading,
    error,
    isInitialized,
  };
};

export const useAuthUser = useAuthUserOptimized;

export const useAuthLoading = () => {
  const { isLoading } = useAuthStatusOptimized();
  return isLoading;
};