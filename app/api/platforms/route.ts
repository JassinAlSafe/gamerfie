import { NextResponse } from 'next/server';
import { GameService } from '@/services/gameService';

export async function GET() {
  try {
    const platforms = await GameService.fetchPlatforms();
    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}