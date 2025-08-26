/**
 * Consistent date formatting utilities for server-client hydration compatibility
 * Always uses explicit locale to prevent hydration mismatches
 */

export const DATE_FORMATS = {
  SHORT: 'short', // MM/DD/YYYY
  MEDIUM: 'medium', // MMM DD, YYYY  
  LONG: 'long', // Month DD, YYYY
  NUMERIC: 'numeric' // YYYY-MM-DD
} as const;

/**
 * Format date with consistent locale to prevent hydration errors
 * Always uses 'en-US' locale to ensure server-client consistency
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: {
    format?: 'short' | 'medium' | 'long' | 'numeric';
    includeTime?: boolean;
    fallback?: string;
  } = {}
): string {
  const { format = 'short', includeTime = false, fallback = 'N/A' } = options;

  if (!date) {
    return fallback;
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    if (format === 'numeric') {
      // Return YYYY-MM-DD format for consistency
      return dateObj.toISOString().split('T')[0];
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
      day: 'numeric',
    };

    if (includeTime) {
      dateOptions.hour = 'numeric';
      dateOptions.minute = '2-digit';
    }

    return dateObj.toLocaleDateString('en-US', dateOptions);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Format date for display in lists/tables (consistent short format)
 */
export function formatDisplayDate(date: string | Date | null | undefined): string {
  return formatDate(date, { format: 'short' });
}

/**
 * Format date with time for detailed views
 */
export function formatDateWithTime(date: string | Date | null | undefined): string {
  return formatDate(date, { format: 'medium', includeTime: true });
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * This is safe for hydration as it returns consistent results
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 7) {
      return formatDate(date, { format: 'short' });
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return formatDate(date, { format: 'short' });
  }
}

/**
 * Get consistent date string for data grouping/keys
 * Always returns YYYY-MM-DD format for consistency
 */
export function getDateKey(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

/**
 * Legacy compatibility - use formatDisplayDate instead
 * @deprecated Use formatDisplayDate for consistency
 */
export function formatPlaylistDate(date: string | Date): string {
  return formatDisplayDate(date);
}