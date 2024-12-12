import { NextResponse, NextRequest } from "next/server";
import { GameService } from "@/services/gameService";
import type { GameQueryParams, SortOption } from "@/types/game";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const queryParams: GameQueryParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      platformId: searchParams.get("platformId") || 'all',
      searchTerm: searchParams.get("search") || '',
      sortBy: (searchParams.get("sortBy") || 'popularity') as SortOption
    };

    const result = await GameService.fetchGames(queryParams);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}