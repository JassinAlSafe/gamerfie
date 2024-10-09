import { NextResponse } from "next/server";
import { addSeconds } from "date-fns";

export async function POST() {
  const client_id = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
  const client_secret = process.env.TWITCH_CLIENT_SECRET as string;

  if (!client_id || !client_secret) {
    return NextResponse.json(
      { error: "Missing Twitch client_id or client_secret" },
      { status: 400 }
    );
  }

  try {
    // Request new access token from Twitch
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        client_secret: process.env.TWITCH_CLIENT_SECRET as string,
        grant_type: "client_credentials",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch access token" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const tokenExpiry = addSeconds(
      new Date(),
      tokenData.expires_in
    ).toISOString();

    // Log the generated token and expiry
    console.log("Generated Access Token:", accessToken);
    console.log("Token Expiry:", tokenExpiry);

    // Return the access token and expiry in JSON format
    return NextResponse.json({
      accessToken,
      tokenExpiry,
    });
  } catch (error) {
    console.error("Error fetching access token:", error);
    return NextResponse.json(
      { error: "Failed to fetch access token" },
      { status: 500 }
    );
  }
}
