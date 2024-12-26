import { create } from 'zustand';
import { toast } from 'sonner';

export type ErrorType = 'auth' | 'api' | 'network' | 'validation' | 'unknown';

interface ErrorState {
  errors: Array<{
    id: string;
    type: ErrorType;
    message: string;
    timestamp: number;
  }>;
  addError: (type: ErrorType, message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],

  addError: (type, message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      errors: [
        ...state.errors,
        {
          id,
          type,
          message,
          timestamp: Date.now(),
        },
      ],
    }));

    // Show toast notification for the error
    toast.error(message, {
      description: `Error type: ${type}`,
    });

    // Remove error after 5 seconds
    setTimeout(() => {
      set((state) => ({
        errors: state.errors.filter((error) => error.id !== id),
      }));
    }, 5000);
  },

  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    })),

  clearErrors: () => set({ errors: [] }),
})); 