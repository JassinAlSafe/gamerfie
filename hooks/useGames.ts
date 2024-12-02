import { useInfiniteQuery, useQuery } from 'react-query';
import { supabase } from "@/utils/supabase-client";
import { fetchGameDetails, fetchUserGames } from "@/utils/game-utils";
import { type UserGame, type GameReview, type Game } from "@/types/game";
import { useMemo } from 'react';

const GAMES_PER_PAGE = 12;

export interface UserGamesResponse {
    userGames: (UserGame & Game)[];
    reviews: GameReview[];
}

export function useUserGames(pageSize: number = 12) {
    return useInfiniteQuery<UserGamesResponse, Error>(
        'userGames',
        async ({ pageParam = 0 }) => {
            const start = pageParam * pageSize;
            const end = start + pageSize - 1; // Supabase range is inclusive
            const data = await fetchUserGames(supabase, { start, end });
            
            // Fetch game details for each user game
            const userGamesWithDetails = await Promise.all(
                data.userGames.map(async (userGame) => {
                    try {
                        const gameDetails = await fetchGameDetails(userGame.game_id, data.reviews);
                        console.log(`Fetched details for game ${userGame.game_id}:`, gameDetails);
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
        {
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.hasMore ? allPages.length : undefined;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000, // 30 minutes
            refetchOnWindowFocus: false,
        }
    );
}

export function useGameDetails(gameId: string, reviews: GameReview[]) {
    return useQuery<Game, Error>(
        ['gameDetails', gameId],
        async () => await fetchGameDetails(gameId, reviews),
        {
            staleTime: 60 * 60 * 1000, // 1 hour
            cacheTime: 24 * 60 * 60 * 1000, // 24 hours
        }
    );
}

export function useGamesList(data: UserGamesResponse | undefined, searchQuery: string, statusFilter: string, currentPage: number) {
    const filteredGames = useMemo(() => {
        if (!data?.userGames) return [];
        
        return data.userGames.filter(game => {
            if (!game.name) return false; // Skip games without names
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, searchQuery, statusFilter]);

    const totalPages = useMemo(() => {
        if (!filteredGames) return 0;
        return Math.ceil(filteredGames.length / GAMES_PER_PAGE);
    }, [filteredGames]);

    const paginatedGames = useMemo(() => {
        const start = (currentPage - 1) * GAMES_PER_PAGE;
        const end = start + GAMES_PER_PAGE;
        return filteredGames.slice(start, end);
    }, [filteredGames, currentPage]);

    console.log("Filtered and paginated games:", paginatedGames); // Debug log

    return { filteredGames: paginatedGames, totalPages };
}