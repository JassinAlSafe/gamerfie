import { NextRequest, NextResponse } from 'next/server'
import { UnifiedGameService } from '@/services/unifiedGameService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  try {
    // Fetch game data to get the name for SEO-friendly slug
    const gameResult = await UnifiedGameService.getGameById(parseInt(id))
    
    if (!gameResult || !gameResult.name) {
      // If game not found, redirect to all-games page
      return NextResponse.redirect(new URL('/all-games', request.url), 308)
    }
    
    // Convert game name to slug (replace spaces with hyphens, lowercase, remove special chars)
    const slug = gameResult.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Redirect to the SEO-friendly URL
    return NextResponse.redirect(new URL(`/games/${slug}`, request.url), 301)
    
  } catch (error) {
    console.error('Error redirecting game:', error)
    // Fallback to all-games page if there's an error
    return NextResponse.redirect(new URL('/all-games', request.url), 308)
  }
}