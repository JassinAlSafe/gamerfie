export interface UserSettings {
  general?: {
    darkMode?: boolean;
    accentColor?: string;
    language?: string;
    timeZone?: string;
  };
  profile?: {
    displayName?: string;
    bio?: string;
    socialLinks?: {
      twitter?: string;
      discord?: string;
    };
  };
  library?: {
    view: 'grid' | 'list';
    sortBy: 'recent' | 'name' | 'rating';
    sortOrder: 'asc' | 'desc';
    showPlaytime?: boolean;
    showRatings?: boolean;
    autoTrackTime?: boolean;
    showCovers?: boolean;
    gamesPerPage?: number;
    defaultFilter?: 'all' | 'playing' | 'completed' | 'want_to_play';
  };
  privacy?: {
    profileVisibility?: 'public' | 'friends' | 'private';
    showOnlineStatus?: boolean;
    showGameActivity?: boolean;
    twoFactorEnabled?: boolean;
  };
  notifications?: {
    emailGameUpdates?: boolean;
    emailFriendActivity?: boolean;
    emailNewsletter?: boolean;
    pushFriendRequests?: boolean;
    pushMessages?: boolean;
    pushGameInvites?: boolean;
  };
}

export const defaultSettings: UserSettings = {
  general: {
    darkMode: true,
    accentColor: 'purple',
    language: 'en',
    timeZone: 'UTC'
  },
  profile: {
    socialLinks: {}
  },
  library: {
    view: 'grid',
    sortBy: 'recent',
    sortOrder: 'desc',
    showPlaytime: true,
    showRatings: true,
    autoTrackTime: true,
    showCovers: true,
    gamesPerPage: 20,
    defaultFilter: 'all'
  },
  privacy: {
    profileVisibility: 'public',
    showOnlineStatus: true,
    showGameActivity: true,
    twoFactorEnabled: false
  },
  notifications: {
    emailGameUpdates: true,
    emailFriendActivity: true,
    emailNewsletter: true,
    pushFriendRequests: true,
    pushMessages: true,
    pushGameInvites: true
  }
}; 