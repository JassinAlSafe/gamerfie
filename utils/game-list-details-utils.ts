import { formatDistanceToNow } from "date-fns";
import { MESSAGES } from "@/config/game-list-details-config";
import type { GameListItem, GameList } from "@/types/gamelist/game-list";

export function formatListDate(dateString: string | undefined): string {
  if (!dateString) return MESSAGES.PLACEHOLDERS.FALLBACK_DATE;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return MESSAGES.PLACEHOLDERS.FALLBACK_DATE;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return MESSAGES.PLACEHOLDERS.FALLBACK_DATE;
  }
}

export function isContentDescription(content: string | null | undefined): boolean {
  if (!content) return false;
  return !content.startsWith("[");
}

export function generateShareData(list: GameList) {
  return {
    title: `${list.title}${MESSAGES.SHARE.TITLE_SUFFIX}`,
    text: isContentDescription(list.content) ? list.content || "" : `Check out this game list: ${list.title}`,
    url: typeof window !== 'undefined' ? window.location.href : ''
  };
}

export function calculateGameStats(games: GameListItem[]) {
  // Calculate estimated hours based on average game completion time
  // Using a conservative estimate of 15 hours per game as average
  const estimatedHours = games.length * 15;
  
  return {
    total: games.length,
    hasGames: games.length > 0,
    isEmpty: games.length === 0,
    estimatedHours
  };
}

export function processCommentsData(commentsData: any[], profilesData: any[]) {
  const profilesMap = new Map(
    profilesData?.map((profile) => [profile.id, profile]) || []
  );

  return commentsData.map((comment) => {
    const profile = profilesMap.get(comment.user_id);
    return {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user_id,
      user: {
        username: profile?.username || "Unknown User",
        avatar_url: profile?.avatar_url || null,
      },
    };
  });
}

export function extractUniqueUserIds(comments: any[]): string[] {
  return [...new Set(comments.map((comment) => comment.user_id))];
}

export function validateCommentInput(comment: string, profile: any): boolean {
  return Boolean(comment.trim() && profile);
}

export function createShareHandler(list: GameList, onSuccess: (message: string) => void) {
  return async () => {
    try {
      const shareData = generateShareData(list);
      await navigator.share(shareData);
    } catch {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        onSuccess(MESSAGES.SUCCESS.LINK_COPIED);
      }
    }
  };
}

export function createLikeHandler(
  isLiked: boolean,
  setIsLiked: (liked: boolean) => void,
  setLikeCount: (updater: (prev: number) => number) => void
) {
  return async () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    // TODO: Implement like functionality with Supabase
  };
}

export function getUserInitials(username: string | undefined): string {
  return username?.[0]?.toUpperCase() || "U";
}

export function getGameCoverUrl(coverUrl: string | null | undefined): string | null {
  return coverUrl || null;
}

export function createSkeletonArray(count: number): null[] {
  return Array.from({ length: count }, () => null);
}