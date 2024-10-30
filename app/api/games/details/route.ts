import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/igdb";

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();
    const accessToken = await getAccessToken();

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: `
        fields name,cover.url,platforms.name,genres.name,summary,first_release_date;
        where id = ${gameId};
      `,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform cover URL to use HTTPS if needed
    if (data[0]?.cover?.url) {
      data[0].cover.url = data[0].cover.url.replace(/^\/\//, "https://");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in game details API:", error);
    return NextResponse.json(
      { error: "Failed to fetch game details" },
      { status: 500 }
    );
  }
}
