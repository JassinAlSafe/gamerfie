import { NextResponse } from "next/server";
import { IGDBService } from "@/services/igdb";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const games = await IGDBService.searchGames(query);
    return NextResponse.json(games);
  } catch (error) {
    console.error("Error in search API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search games' },
      { status: 500 }
    );
  }
} 