import { NextResponse } from "next/server";
import axios from "axios";
import { fetchGames, fetchTotalGames } from "@/lib/igdb";

export async function getAccessToken(): Promise<string> {
  try {
    const res = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        client_secret: process.env.TWITCH_CLIENT_SECRET as string,
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return res.data.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fetchAll = body.fetchAll === true;
    const page = parseInt(body.page || "1", 10);
    const limit = parseInt(body.limit || "48", 10);
    const offset = (page - 1) * limit;

    console.log(`Fetching games with offset: ${offset} and limit: ${limit}`);

    const accessToken = await getAccessToken();
    console.log("Access token obtained");


    const [games, totalGames] = await Promise.all([
      fetchGames(accessToken, offset, limit),
      fetchTotalGames(accessToken),
    ]);

    const processedGames = games.map((game) => ({
      ...game,
      cover: game.cover
        ? {
            ...game.cover,
            url: game.cover.url.replace("t_thumb", "t_cover_big"),
          }
        : null,
    }));

    console.log("Processed games. Sending response.");
    return NextResponse.json({ games: processedGames, total: totalGames });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      },
      { status: 500 }
    );
  }
}