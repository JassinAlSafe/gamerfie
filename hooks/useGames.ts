import { useInfiniteQuery, useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from "@/utils/supabase-client";
import { fetchGameDetails, fetchUserGames } from "@/utils/game-utils";
import { type UserGame, type GameReview, type Game } from "@/types/game";
import { useMemo } from 'react';

const GAMES_PER_PAGE = 12;

export interface UserGamesResponse {
    userGames: (UserGame & Game)[];
    reviews: GameReview[];
    hasMore: boolean;
}

export function useUserGames(userId: string, pageSize: number = GAMES_PER_PAGE) {
    return useInfiniteQuery<UserGamesResponse, Error>({
        queryKey: ['userGames', userId],
        queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
            const start = pageParam * pageSize;
            const end = start + pageSize - 1; // Supabase range is inclusive
            const data = await fetchUserGames(supabase, { start, end, userId });

            // Fetch game details for each user game
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
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length : undefined;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
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
        return data.flatMap(page => page.userGames);
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

