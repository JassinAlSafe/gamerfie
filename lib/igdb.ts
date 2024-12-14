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

    console.log('Fetching new IGDB token...');
    console.log('Client ID exists:', !!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID);
    console.log('Client Secret exists:', !!process.env.TWITCH_CLIENT_SECRET);

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
      console.error('Twitch OAuth Error:', errorText);
      throw new Error(`Failed to get IGDB token: ${errorText}`);
    }

    const data = await response.json();
    console.log('Got new IGDB token');
    
    // Cache the token
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB token:', error);
    throw error;
  }
}); 