"use client";

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onGoogleAuth: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function useAuthKeyboard({ onGoogleAuth, onSubmit, isLoading }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when loading
      if (isLoading) return;

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      // Google OAuth shortcut (Cmd/Ctrl + G)
      if (isCmdOrCtrl && event.key === 'g') {
        event.preventDefault();
        onGoogleAuth();
        return;
      }

      // Quick submit (Cmd/Ctrl + Enter)
      if (isCmdOrCtrl && event.key === 'Enter') {
        event.preventDefault();
        onSubmit();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onGoogleAuth, onSubmit, isLoading]);

  // This hook only handles side effects
  return null;
}