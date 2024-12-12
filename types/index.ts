export * from './game';
export * from './timeline';
export * from './about';

// Keep this utility here or move to utils/
export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

