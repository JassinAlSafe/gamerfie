import { NextResponse } from "next/server";
import { getIGDBToken } from "@/lib/igdb";

interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
  total_rating_count?: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  first_release_date?: number;
  summary?: string;
}

export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_TWITCH_CLIENT_ID is not configured');
    }
    if (!process.env.TWITCH_CLIENT_SECRET) {
      throw new Error('TWITCH_CLIENT_SECRET is not configured');
    }

    const accessToken = await getIGDBToken();
    if (!accessToken) {
      throw new Error('Failed to get IGDB access token');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const oneYearAgo = currentTimestamp - (365 * 24 * 60 * 60);
    const fiveYearsAgo = currentTimestamp - (5 * 365 * 24 * 60 * 60);

    // Fetch top rated games
    const topRatedResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & rating != null & total_rating_count > 100 & rating >= 85;
            sort rating desc;
            limit 50;`,
      next: { revalidate: 3600 }
    });

    // Fetch highly rated games
    const highlyRatedResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & rating != null & total_rating_count > 50 & rating >= 75;
            sort rating desc;
            limit 50;`,
      cache: 'no-store'
    });

    // Fetch popular games
    const popularGamesResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & total_rating_count > 200;
            sort total_rating_count desc;
            limit 50;`,
      cache: 'no-store'
    });

    // Fetch classic games
    const classicGamesResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & first_release_date < ${fiveYearsAgo} & total_rating_count > 1000 & rating >= 80;
            sort rating desc;
            limit 50;`,
      cache: 'no-store'
    });

    // Fetch new releases
    const newReleasesResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & first_release_date >= ${oneYearAgo} & first_release_date <= ${currentTimestamp};
            sort first_release_date desc;
            limit 50;`,
      cache: 'no-store'
    });

    // Fetch upcoming games
    const upcomingResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, first_release_date, summary;
            where category = 0 & version_parent = null & cover != null & first_release_date > ${currentTimestamp};
            sort first_release_date asc;
            limit 50;`,
      cache: 'no-store'
    });

    if (!topRatedResponse.ok || !highlyRatedResponse.ok || !popularGamesResponse.ok || 
        !classicGamesResponse.ok || !newReleasesResponse.ok || !upcomingResponse.ok) {
      throw new Error('Failed to fetch games from IGDB');
    }

    const [topRated, highlyRated, popularGames, classicGames, newReleases, upcoming] = await Promise.all([
      topRatedResponse.json(),
      highlyRatedResponse.json(),
      popularGamesResponse.json(),
      classicGamesResponse.json(),
      newReleasesResponse.json(),
      upcomingResponse.json()
    ]);

    // Process games to ensure high-quality images
    const processGames = (games: IGDBGame[]) => {
      return games.map(game => ({
        id: game.id,
        name: game.name,
        cover: game.cover ? {
          url: game.cover.url.replace('t_thumb', 't_cover_big')
        } : null,
        rating: game.rating ? Math.round(game.rating) : null,
        total_rating_count: game.total_rating_count || 0,
        genres: game.genres || [],
        platforms: game.platforms || [],
        first_release_date: game.first_release_date,
        summary: game.summary || null
      }));
    };

    // Combine all games for the "all" category
    const allGames = [...topRated, ...highlyRated, ...popularGames, ...classicGames, ...newReleases, ...upcoming];
    const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());

    return NextResponse.json({
      all: processGames(uniqueGames),
      topRated: processGames(topRated),
      highlyRated: processGames(highlyRated),
      popularGames: processGames(popularGames),
      classicGames: processGames(classicGames),
      newReleases: processGames(newReleases),
      upcoming: processGames(upcoming),
      trending: processGames(popularGames.slice(0, 10)),
      mostAnticipated: processGames(upcoming.filter(game => game.total_rating_count && game.total_rating_count > 50))
    });

  } catch (error) {
    console.error('Error in /api/games/popular:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular games' },
      { status: 500 }
    );
  }
} 