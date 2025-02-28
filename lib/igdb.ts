let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Gets an access token for the IGDB API
 * Caches the token to avoid unnecessary requests
 */
export async function getIGDBToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Twitch API credentials');
    }

    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get IGDB token');
    }

    const data = await response.json();
    
    // Cache the token and set expiry (subtract 60 seconds for safety)
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB token:', error);
    throw error;
  }
} 