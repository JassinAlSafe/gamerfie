import { NextResponse } from "next/server";
import { TwitchService } from "@/services/twitch.service";
import { TwitchError } from "@/types/twitch";

export const runtime = 'edge';

export async function POST() {
  try {
    const twitchService = new TwitchService();
    const tokenResult = await twitchService.getAccessToken();

    return NextResponse.json({
      accessToken: tokenResult.accessToken,
      tokenExpiry: tokenResult.tokenExpiry
    });
  } catch (error) {
    console.error("Error fetching access token:", error);
    
    if (error instanceof TwitchError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch access token" },
      { status: 500 }
    );
  }
}
