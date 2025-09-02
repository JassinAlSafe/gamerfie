
export interface ProfileModalUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  created_at: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ProfileModalStats {
  gamesPlayed: number;
  gamesCompleted: number;
  completionPercentage: number;
  totalHours?: number;
  achievementsUnlocked: number;
  reviewsWritten: number;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface ProfileModalActivity {
  id: string;
  type: 'started_playing' | 'completed' | 'achievement' | 'review';
  game: {
    id: string;
    name: string;
    cover_url?: string;
  };
  created_at: string;
  description?: string;
}

export interface ProfileModalBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface ProfileCardModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onShare?: (userId: string, shareType: ShareType) => void;
  currentUserId?: string; // For checking if viewing own profile
}

export interface ProfileCardProps {
  user: ProfileModalUser;
  stats: ProfileModalStats;
  recentActivities?: ProfileModalActivity[];
  badges?: ProfileModalBadge[];
  isFollowing?: boolean;
  isFriend?: boolean;
  isCurrentUser?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
  onShare?: (shareType: ShareType) => void;
}

export type ShareType = 'link' | 'twitter' | 'discord' | 'qr';

export interface ProfileCardActionsProps {
  userId: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  isCurrentUser?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

export interface ProfileCardStatsProps {
  stats: ProfileModalStats;
}

export interface ProfileCardShareProps {
  userId: string;
  username: string;
  onShare: (shareType: ShareType) => void;
}