import { cache } from 'react'

let cachedToken: string | null = null
let tokenExpiry: number | null = null

export const getIGDBToken = cache(async () => {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('Using cached IGDB token');
      return cachedToken;
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_TWITCH_CLIENT_ID is not configured');
    }
    if (!process.env.TWITCH_CLIENT_SECRET) {
      throw new Error('TWITCH_CLIENT_SECRET is not configured');
    }

    console.log('Fetching new IGDB token...');

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitch OAuth Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to get IGDB token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.access_token || typeof data.expires_in !== 'number') {
      console.error('Invalid token response:', data);
      throw new Error('Invalid token response from Twitch');
    }

    console.log('Successfully obtained new IGDB token');
    
    // Cache the token
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB token:', error);
    // Clear cached token in case of error
    cachedToken = null;
    tokenExpiry = null;
    throw error;
  }
}); 