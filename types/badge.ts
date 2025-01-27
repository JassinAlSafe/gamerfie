// Badge Enums
export type BadgeType = 'challenge' | 'achievement' | 'special' | 'community';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Core Badge interfaces
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  type: BadgeType;
  rarity: BadgeRarity;
  created_at: string;
}

// User Badge relationships
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

// Badge Actions
export type BadgeAward = {
  user_id: string;
  badge_id: string;
  challenge_id?: string;
}; 