import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, query } = await request.json();
    console.log('IGDB Request:', { endpoint, query });

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      console.error('Missing Twitch credentials');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Get access token from Twitch
    const tokenUrl = 'https://id.twitch.tv/oauth2/token';
    console.log('Requesting token from:', tokenUrl);

    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }).toString()
      });

      const tokenData = await tokenResponse.text();
      console.log('Token response:', tokenResponse.status, tokenData);

      if (!tokenResponse.ok) {
        console.error('Token error response:', tokenData);
        return NextResponse.json({ error: `Token error: ${tokenData}` }, { status: 500 });
      }

      let accessToken;
      try {
        const tokenJson = JSON.parse(tokenData);
        accessToken = tokenJson.access_token;
        if (!accessToken) {
          throw new Error('No access token in response');
        }
      } catch (e) {
        console.error('Failed to parse token response:', e);
        return NextResponse.json({ error: 'Invalid token response' }, { status: 500 });
      }

      // Make IGDB request
      const igdbUrl = `https://api.igdb.com/v4/${endpoint}`;
      console.log('Making IGDB request:', {
        url: igdbUrl,
        clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        query
      });

      try {
        const igdbResponse = await fetch(igdbUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'text/plain'
          },
          body: query
        });

        const responseData = await igdbResponse.text();
        console.log('IGDB response:', igdbResponse.status, responseData);

        if (!igdbResponse.ok) {
          console.error('IGDB error response:', responseData);
          return NextResponse.json({ error: `IGDB error: ${responseData}` }, { status: igdbResponse.status });
        }

        try {
          const jsonData = JSON.parse(responseData);
          return NextResponse.json(jsonData);
        } catch (e) {
          console.error('Failed to parse IGDB response:', e);
          return NextResponse.json({ error: 'Invalid IGDB response' }, { status: 500 });
        }
      } catch (e) {
        console.error('IGDB request failed:', e);
        return NextResponse.json({ error: 'IGDB request failed' }, { status: 500 });
      }
    } catch (e) {
      console.error('Token request failed:', e);
      return NextResponse.json({ error: 'Token request failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in IGDB proxy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 