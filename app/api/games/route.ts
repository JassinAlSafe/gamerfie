import { NextResponse } from "next/server";
import {
  getAccessToken,
  fetchGames,
  fetchTotalGames,
  FetchedGame,
  ensureAbsoluteUrl,
} from "@/lib/igdb";

interface ProcessedGame {
  id: number;
  name: string;
  cover: { id: number; url: string } | null;
  platforms: string[];
  first_release_date?: number;
  total_rating?: number;
}

async function processGames(games: FetchedGame[]): Promise<ProcessedGame[]> {
  return games.map((game) => ({
    id: game.id,
    name: game.name,
    cover: game.cover
      ? {
          id: game.cover.id,
          url: ensureAbsoluteUrl(game.cover.url.replace("t_thumb", "t_cover_big")),
        }
      : null,
    platforms: Array.isArray(game.platforms)
      ? game.platforms.map((platform) => platform.name)
      : [],
    first_release_date: game.first_release_date,
    total_rating: game.total_rating,
  }));
}

async function handleRequest(
  page: number,
  limit: number,
  platformId: string | undefined
) {
  const accessToken = await getAccessToken();
  const parsedPlatformId = platformId ? parseInt(platformId, 10) : undefined;

  const [games, totalGames] = await Promise.all([
    fetchGames(accessToken, page, limit, parsedPlatformId),
    fetchTotalGames(accessToken, parsedPlatformId),
  ]);

  const processedGames = await processGames(games);

  return { games: processedGames, total: totalGames };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "48", 10);
    const platformId = searchParams.get("platformId") || undefined;

    const result = await handleRequest(page, limit, platformId);
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
    const { page = 1, limit = 48, platformId } = body;

    const result = await handleRequest(page, limit, platformId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}