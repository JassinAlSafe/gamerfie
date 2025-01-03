export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  type: 'challenge' | 'achievement' | 'special' | 'community';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserBadge {
  badge: Badge;
  claimed_at: string;
  challenge?: {
    id: string;
    title: string;
  };
}

export interface ChallengeBadge {
  badge: Badge;
  reward_id: string;
  created_at: string;
}

export type BadgeAward = {
  user_id: string;
  badge_id: string;
  challenge_id?: string;
}; 