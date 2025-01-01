export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  badge: Badge;
  awarded_at: string;
  awarded_from_challenge?: {
    id: string;
    title: string;
  };
}

export interface ChallengeBadge {
  badge: Badge;
  created_at: string;
}

export type BadgeAward = {
  user_id: string;
  badge_id: string;
  challenge_id?: string;
}; 