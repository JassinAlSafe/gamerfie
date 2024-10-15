import { NextResponse } from "next/server";
import {
  getAccessToken,
  fetchGames,
  fetchTotalGames,
  FetchedGame,
} from "@/lib/igdb";
import { Game } from "@/types/game";

interface ProcessedGame {
  id: number;
  name: string;
  cover: { id: number; url: string } | null;
  platforms: string[];
  first_release_date?: number;
  total_rating?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "48", 10);

    const accessToken = await getAccessToken();

    const [games, totalGames] = await Promise.all([
      fetchGames(accessToken, page, limit),
      fetchTotalGames(accessToken),
    ]);

    // Process games data (e.g., formatting, filtering)
    const processedGames: ProcessedGame[] = games.map((game: FetchedGame) => ({
      id: game.id,
      name: game.name,
      cover: game.cover
        ? {
            id: game.cover.id,
            url: game.cover.url.replace("t_thumb", "t_cover_big"),
          }
        : null,
      platforms: Array.isArray(game.platforms)
        ? game.platforms.map((platform) => platform.name)
        : [],
      first_release_date: game.first_release_date,
      total_rating: game.total_rating,
    }));

    return NextResponse.json({ games: processedGames, total: totalGames });
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

    const accessToken = await getAccessToken();

    const [games, totalGames] = await Promise.all([
      fetchGames(accessToken, page, limit, platformId),
      fetchTotalGames(accessToken, platformId),
    ]);

    // Process games data (e.g., formatting, filtering)
    const processedGames: ProcessedGame[] = games.map((game: FetchedGame) => ({
      id: game.id,
      name: game.name,
      cover: game.cover
        ? {
            id: game.cover.id,
            url: game.cover.url.replace("t_thumb", "t_cover_big"),
          }
        : null,
      platforms: Array.isArray(game.platforms)
        ? game.platforms.map((platform) => platform.name)
        : [],
      first_release_date: game.first_release_date,
      total_rating: game.total_rating,
    }));

    return NextResponse.json({ games: processedGames, total: totalGames });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
