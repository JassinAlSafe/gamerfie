
import { addSeconds } from "date-fns";
import { TwitchTokenResponse, TokenResult, TwitchError } from "../types/twitch";

export class TwitchService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new TwitchError("Missing Twitch credentials", 400);
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAccessToken(): Promise<TokenResult> {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials",
      }).toString(),
    });

    if (!response.ok) {
      throw new TwitchError("Failed to fetch access token", response.status);
    }

    const tokenData: TwitchTokenResponse = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      tokenExpiry: addSeconds(new Date(), tokenData.expires_in).toISOString()
    };
  }
}