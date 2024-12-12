import { NextResponse } from "next/server";
import { GameService } from "@/services/gameService";

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

    const game = await GameService.fetchGameById(gameId);
    console.log("Fetched game details:", game);
    
    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
