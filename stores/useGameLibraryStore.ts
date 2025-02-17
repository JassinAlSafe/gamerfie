import { create } from 'zustand';
import { Game, GameStats, Platform, Genre } from '@/types/game';

interface GameLibraryState {
  isLoading: boolean;
  error: string | null;
  stats: GameStats;
  fetchGameLibrary: () => Promise<void>;
}

const defaultPlatforms: Platform[] = [
  { id: '1', name: 'PC' },
  { id: '2', name: 'PlayStation' }
];

const defaultGenres: Genre[] = [
  { id: '1', name: 'RPG' },
  { id: '2', name: 'Action' }
];

// This would typically come from an environment variable
const COVER_BASE_URL = 'https://images.igdb.com/igdb/image/upload/t_cover_big/';

export const useGameLibraryStore = create<GameLibraryState>((set) => ({
  isLoading: false,
  error: null,
  stats: {
    totalGames: 0,
    totalPlaytime: 0,
    recentlyPlayed: [],
    mostPlayed: [],
  },
  fetchGameLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const mockData: GameStats = {
        totalGames: 42,
        totalPlaytime: 12600, // 210 hours
        recentlyPlayed: [
          {
            id: '1',
            title: 'Cyberpunk 2077',
            coverImage: `${COVER_BASE_URL}co2mjs.jpg`, // Actual IGDB cover ID for Cyberpunk 2077
            lastPlayed: new Date().toISOString(),
            playtime: 3600,
            platform: 'PC',
            platforms: defaultPlatforms,
            genres: defaultGenres,
            achievements: { total: 45, completed: 23 },
            rating: 4.5,
            releaseDate: '2020-12-10',
            summary: 'An open-world action game set in Night City',
            status: 'playing'
          },
          {
            id: '2',
            title: 'Elden Ring',
            coverImage: `${COVER_BASE_URL}co4jni.jpg`, // Actual IGDB cover ID for Elden Ring
            lastPlayed: new Date(Date.now() - 86400000).toISOString(),
            playtime: 4800,
            platform: 'PlayStation',
            platforms: defaultPlatforms,
            genres: defaultGenres,
            achievements: { total: 42, completed: 31 },
            rating: 4.8,
            releaseDate: '2022-02-25',
            summary: 'A new fantasy action-RPG',
            status: 'playing'
          }
        ],
        mostPlayed: [
          {
            id: '3',
            title: 'The Witcher 3',
            coverImage: `${COVER_BASE_URL}co1wyy.jpg`, // Actual IGDB cover ID for The Witcher 3
            lastPlayed: new Date(Date.now() - 172800000).toISOString(),
            playtime: 6000,
            platform: 'PC',
            platforms: defaultPlatforms,
            genres: defaultGenres,
            achievements: { total: 78, completed: 65 },
            rating: 4.9,
            releaseDate: '2015-05-19',
            summary: 'An award-winning action RPG',
            status: 'completed'
          }
        ]
      };
      
      set({ stats: mockData });
    } catch (error) {
      set({ error: 'Failed to fetch game library' });
    } finally {
      set({ isLoading: false });
    }
  }
})); 