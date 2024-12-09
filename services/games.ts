import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Game, FetchGamesResponse } from '@/types/game';

export const GAMES_PER_PAGE = 48;


export async function fetchGamesData(
    page: number,
    platformId: string,
    searchTerm: string,
    sortBy: string
): Promise<FetchGamesResponse> {
    const supabase = createClientComponentClient()

    let query = `fields name,cover.url,platforms.name,genres.name,summary,first_release_date,total_rating,total_rating_count;
               limit ${GAMES_PER_PAGE};
               offset ${(page - 1) * GAMES_PER_PAGE};`;

    if (searchTerm) {
        query += ` search "${searchTerm}";`;
    }

    if (platformId && platformId !== 'all') {
        query += ` where platforms = (${platformId});`;
    }

    switch (sortBy) {
        case 'name':
            query += ' sort name asc;';
            break;
        case 'releaseDate':
            query += ' sort first_release_date desc;';
            break;
        case 'popularity':
        default:
            query += ' sort total_rating_count desc;';
            break;
    }

    try {
        const response = await supabase.functions.invoke('igdb-proxy', {
            body: { endpoint: 'games', query: query }
        })
        const data = (await response.json()) as Game[];

        if (response.error) throw response.error;

        const games = data.map((game: Game) => ({
            id: game.id,
            name: game.name,
            cover: game.cover ? {
                id: game.cover.id,
                url: game.cover.url.replace('t_thumb', 't_cover_big')
            } : null,
            platforms: game.platforms ? game.platforms.map(p => p.name) : [],
            genres: game.genres ? game.genres.map(g => g.name) : [],
            summary: game.summary,
            first_release_date: game.first_release_date,
            total_rating: game.total_rating
        }));

        return {
            games,
            total: data.length // Note: IGDB doesn't provide a total count, so this is an estimate
        };
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
}

