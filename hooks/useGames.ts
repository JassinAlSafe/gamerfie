import { useInfiniteQuery, useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from "@/utils/supabaseClient";
import { fetchGameDetails, fetchUserGames } from "@/utils/game-utils";
import { type UserGame, type GameReview, type Game } from "@/types/game";
import { useMemo } from 'react';
import { useProfile } from '@/app/hooks/use-profile';

const GAMES_PER_PAGE = 12;

export interface UserGamesResponse {
    userGames: (UserGame & Game)[];
    reviews: GameReview[];
    hasMore: boolean;
}

export function useUserGames(pageSize: number = GAMES_PER_PAGE) {
    const { profile, isLoading: isProfileLoading } = useProfile();

    return useInfiniteQuery<UserGamesResponse, Error>({
        queryKey: ['userGames', profile?.id],
        queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
            if (!profile?.id) {
                throw new Error('No authenticated user');
            }

            const start = pageParam * pageSize;
            const end = start + pageSize - 1;

            const data = await fetchUserGames(supabase, { 
                start, 
                end, 
                userId: profile.id 
            });

            const userGamesWithDetails = await Promise.all(
                data.userGames.map(async (userGame: UserGame & Game) => {
                    try {
                        const gameDetails = await fetchGameDetails(userGame.game_id, data.reviews);
                        return { ...userGame, ...gameDetails };
                    } catch (error) {
                        console.error(`Error fetching details for game ${userGame.game_id}:`, error);
                        return userGame;
                    }
                })
            );

            return {
                userGames: userGamesWithDetails,
                reviews: data.reviews,
                hasMore: data.userGames.length === pageSize
            };
        },
        enabled: Boolean(profile?.id),
        retry: 3,
        retryDelay: 1000,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
    });
}

export function useGamesList(
    data: UserGamesResponse[] | undefined,
    searchQuery: string,
    statusFilter: string,
    currentPage: number
) {
    const allGames = useMemo(() => {
        if (!data) return [];
        // Add logging to debug data
        console.log('Games data:', data);
        return data.flatMap(page => page.userGames || []);
    }, [data]);

    const filteredGames = useMemo(() => {
        return allGames.filter(game => {
            if (!game.name) return false; // Skip games without names
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [allGames, searchQuery, statusFilter]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredGames.length / GAMES_PER_PAGE);
    }, [filteredGames]);

    const paginatedGames = useMemo(() => {
        const start = (currentPage - 1) * GAMES_PER_PAGE;
        const end = start + GAMES_PER_PAGE;
        return filteredGames.slice(start, end);
    }, [filteredGames, currentPage]);

    return { filteredGames: paginatedGames, totalPages, totalGames: filteredGames.length };
}

