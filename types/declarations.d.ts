// Declaration file for missing modules

// For tailwindcss/lib/util/flattenColorPalette
declare module 'tailwindcss/lib/util/flattenColorPalette' {
  export default function flattenColorPalette(colors: Record<string, any>): Record<string, string>;
}

// For @/hooks/Settings/use-debounce
declare module '@/hooks/Settings/use-debounce' {
  export function useDebounce<T>(value: T, delay?: number): T;
}

// For @/utils/supabase-client
declare module '@/utils/supabase-client' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}

// For @/lib/supabase
declare module '@/lib/supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}

// For Deno in Supabase functions
declare namespace Deno {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

// Challenge component declarations
declare module '@/components/challenges/GoalProgress' {
  export default function GoalProgress(props: any): JSX.Element;
}

declare module '@/components/challenges/TeamManagement' {
  export default function TeamManagement(props: any): JSX.Element;
}

declare module '@/components/challenges/TeamLeaderboard' {
  export default function TeamLeaderboard(props: any): JSX.Element;
}

declare module '@/components/challenges/ProgressHistory' {
  export default function ProgressHistory(props: any): JSX.Element;
}

// Game component declarations
declare module '@/components/game/GameGrid' {
  export function GameGrid(props: any): JSX.Element;
}

declare module '@/components/game/GameCard' {
  export function GameCard(props: any): JSX.Element;
}

// Game hooks declarations
declare module '@/hooks/use-games' {
  export function useGames(options?: any): {
    data: any[];
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@/types/challenges' {
  export interface Challenge {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    created_by: string;
    goals: Goal[];
    teams?: Team[];
    title?: string;
    type?: string;
  }

  export interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    challenge_id: string;
    progress?: number;
    description?: string;
  }

  export interface Team {
    id: string;
    name: string;
    challenge_id: string;
    members: TeamMember[];
  }

  export interface TeamMember {
    id: string;
    user_id: string;
    team_id: string;
    username: string;
    avatar_url?: string;
  }

  export interface ClaimedReward {
    id: string;
    user_id: string;
    reward_id: string;
    claimed_at: string;
    reward: {
      id: string;
      name: string;
      description: string;
      image_url?: string;
      points_required: number;
    };
  }
}

// Auth type declarations
declare module '@/types/auth' {
  export interface TokenError {
    message: string;
    code?: string;
    status?: number;
  }
}

// Session module declaration
declare module '@/lib/session' {
  export interface Session {
    user: {
      id: string;
      email: string;
      username?: string;
    };
  }
  
  export function getSession(): Promise<Session | null>;
}

// Game stats interface
declare module '@/types/game' {
  export interface GameStats {
    total_played: number;
    played_this_year: number;
    backlog: number;
    totalGames: number;
    totalPlaytime: number;
    recentlyPlayed: any[];
    mostPlayed: any[];
  }

  export interface Game {
    id: string;
    name: string;
    cover?: string | { id: string; url: string };
    cover_url?: string | null;
    rating?: number;
    first_release_date?: number;
    platforms?: { id: string; name: string; }[];
    genres?: { id: string; name: string; }[];
    status?: string;
    updated_at?: string;
    videos?: { id: string; name: string; video_id: string; }[];
    games?: any; // For compatibility with existing code
    title?: string; // For compatibility with existing code
  }

  export interface ProcessedGame extends Game {
    coverImage: string;
    formattedRating: string;
    releaseYear: number;
  }

  export interface GamePageProps {
    params: {
      id: string;
    };
  }
} 