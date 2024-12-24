import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ensureAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder-game.jpg';
  
  if (url.startsWith('http')) {
    return url;
  }

  // If it's a relative URL starting with //
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // If it's a relative URL starting with /
  if (url.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`;
  }

  // If it's a relative URL without leading slash
  return `/${url}`;
}
