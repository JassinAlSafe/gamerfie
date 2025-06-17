import { NextRequest, NextResponse } from 'next/server';
import { PlaylistService } from '@/services/playlistService';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    switch (type) {
      case 'playlists':
      case 'all':
        // Clear playlist-related caches
        PlaylistService.clearCache();
        
        console.log('Playlist caches invalidated via API');
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid cache type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} cache invalidated`,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
} 