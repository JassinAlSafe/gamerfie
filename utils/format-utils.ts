/**
 * Formats a rating value to a single decimal place
 */
export function formatRating(rating: number): string {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

/**
 * Formats a Unix timestamp to a readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats playtime in minutes to a readable string
 */
export function formatPlaytime(minutes: number): string {
  if (!minutes) return "0h";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a number with K/M suffix for large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formats a relative timestamp to a readable string (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string | number): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    return formatDate(date.getTime() / 1000);
  }
  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return "Just now";
}


/**
 * Formats status strings (e.g., want_to_play -> Want To Play)
 */
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats percentage values
 */
export function formatPercentage(value: number | undefined): string {
  if (value === undefined) return "0%";
  return `${Math.round(value)}%`;
}

/**
 * Formats achievement counts
 */
export function formatAchievements(completed: number | undefined, total: number | undefined): string {
  if (completed === undefined || total === undefined) return "0/0";
  return `${completed}/${total}`;
} 