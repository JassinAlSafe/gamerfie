import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/igdb";
import { IGDBGame, GameAPIError, IGDBPlatform, IGDBGenre } from "@/types/igdb";
import { cache } from 'react';

const CACHE_DURATION = 3600;

const processGameResponse = (game: IGDBGame): IGDBGame => {
  return {
    ...game,
    platforms: game.platforms?.map((platform: IGDBPlatform) => ({
      id: platform.id,
      name: platform.name
    })) ?? [],
    genres: game.genres?.map((genre: IGDBGenre) => ({
      id: genre.id,
      name: genre.name
    })) ?? [],
    cover: game.cover ? {
      ...game.cover,
      url: game.cover.url.replace(/^\/\//, "https://")
    } : undefined
  };
};

const fetchGameDetails = cache(async (gameId: number, accessToken: string): Promise<IGDBGame> => {
  const query = `
    fields name,cover.url,platforms.name,platforms.id,genres.name,genres.id,summary,first_release_date,total_rating,total_rating_count;
    where id = ${gameId};
  `;

  try {
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Cache-Control": `max-age=${CACHE_DURATION}`,
      },
      body: query,
      next: { revalidate: CACHE_DURATION }
    });

    if (!response.ok) {
      throw { message: `IGDB API error: ${response.statusText}`, statusCode: response.status };
    }

    const [game] = await response.json();
    if (!game) {
      throw { message: 'Game not found', statusCode: 404 };
    }

    return processGameResponse(game);
  } catch (error) {
    throw error instanceof Error 
      ? { message: error.message, statusCode: 500 }
      : error as GameAPIError;
  }
});

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();
    console.log("Received game ID:", gameId);

    if (!gameId || typeof gameId !== 'number') {
      console.error("Invalid game ID:", gameId);
      return NextResponse.json(
        { error: 'Invalid game ID' }, 
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const game = await fetchGameDetails(gameId, accessToken);
    console.log("Fetched game details:", game);
    
    return NextResponse.json(game);
  } catch (error) {
    const apiError = error as GameAPIError;
    console.error("Error fetching game details:", apiError);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode }
    );
  }
}
