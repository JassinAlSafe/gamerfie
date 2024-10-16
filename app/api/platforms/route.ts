import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/igdb';
import axios from 'axios';

const IGDB_API_ENDPOINT = "https://api.igdb.com/v4";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${IGDB_API_ENDPOINT}/platforms`,
      "fields id,name,category; where category = (1,2,3,4,5,6); sort name asc; limit 500;",
      {
        headers: {
          'Accept': 'application/json',
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    // Filter out duplicate platform names
    const uniquePlatforms = response.data.reduce((acc: any[], platform: any) => {
      if (!acc.find((p: any) => p.name === platform.name)) {
        acc.push(platform);
      }
      return acc;
    }, []);

    return NextResponse.json(uniquePlatforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}