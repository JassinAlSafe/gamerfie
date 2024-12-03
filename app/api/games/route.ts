import { NextResponse, NextRequest } from "next/server";
import { getAccessToken, fetchGames, fetchTotalGames, ensureAbsoluteUrl } from "@/lib/igdb";
import { ProcessedGame, GameListResponse, GameAPIError, IGDBPlatform, IGDBGenre, FetchedGame } from "@/types/igdb";
import { cache } from 'react';

// Cache the processGames function
const processGames = cache((games: FetchedGame[]): ProcessedGame[] => {
  return games.map((game) => ({
    id: game.id,
    name: game.name,
    cover: game.cover
      ? {
        id: game.cover.id,
        url: ensureAbsoluteUrl(game.cover.url.replace("t_thumb", "t_cover_big")),
      }
      : null,
    platforms: game.platforms?.map((platform: IGDBPlatform): string => platform.name) ?? [],
    genres: game.genres?.map((genre: IGDBGenre): string => genre.name) ?? [],
    summary: game.summary,
    first_release_date: game.first_release_date,
    total_rating: game.total_rating,
  }));
});

async function handleRequest(
  page: number,
  limit: number,
  platformId?: string,
  searchTerm?: string
): Promise<GameListResponse> {
  try {
    const accessToken = await getAccessToken();
    const parsedPlatformId = platformId ? parseInt(platformId, 10) : undefined;

    const [games, totalGames] = await Promise.all([
      fetchGames(accessToken, page, limit, parsedPlatformId, searchTerm),
      fetchTotalGames(accessToken, parsedPlatformId, searchTerm),
    ]);

    const processedGames = await processGames(games);
    return {
      games: processedGames,
      total: totalGames,
      page,
      pageSize: limit
    };
  } catch (error) {
    throw {
      message: error instanceof Error ? error.message : 'Failed to fetch games',
      statusCode: 500
    } as GameAPIError;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "48", 10);
    const platformId = searchParams.get("platformId") || undefined;
    const searchTerm = searchParams.get("search") || undefined;

    const result = await handleRequest(page, limit, platformId, searchTerm);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page = 1, limit = 48, platformId, searchTerm } = body;

    const result = await handleRequest(page, limit, platformId, searchTerm);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}