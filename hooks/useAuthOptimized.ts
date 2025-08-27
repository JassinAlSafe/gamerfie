import { useAuthStore } from '@/stores/useAuthStore';

export const useAuthActions = () => {
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const onAuthStateChange = useAuthStore((state) => state.onAuthStateChange);

  return {
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    onAuthStateChange,
  };
};

export const useAuthState = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return {
    user,
    isLoading,
    error,
    isInitialized,
  };
};

export const useAuthUser = () => {
  return useAuthStore((state) => state.user);
};

export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};