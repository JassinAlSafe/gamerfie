import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import GameDetailWrapper from '@/components/game/GameDetailWrapper'
import { IGDBService } from '@/services/igdb'

interface Props {
  params: { slug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  
  try {
    // Convert slug back to search term (replace hyphens with spaces)
    const searchTerm = slug.replace(/-/g, ' ')
    
    // Search for the game
    const igdbService = new IGDBService()
    const searchResults = await igdbService.searchGames(searchTerm, 1)
    
    if (!searchResults || searchResults.length === 0) {
      return {
        title: 'Game Not Found - Game Vault',
        description: 'The requested game could not be found. Explore our database of thousands of games.',
      }
    }

    const game = searchResults[0]
    const gameTitle = game.name || 'Unknown Game'
    
    // Create SEO-optimized metadata
    const description = `Track ${gameTitle} progress, achievements, and reviews. Join thousands of gamers tracking this game on the best video game tracker platform.`
    const title = `${gameTitle} Tracker - Game Vault | Track Progress & Achievements`

    return {
      title,
      description,
      keywords: [
        `${gameTitle.toLowerCase()} tracker`,
        `track ${gameTitle.toLowerCase()}`,
        `${gameTitle.toLowerCase()} achievements`,
        `${gameTitle.toLowerCase()} progress`,
        'video game tracker',
        'game tracking',
        'achievement tracker'
      ],
      openGraph: {
        title: `${gameTitle} - Video Game Tracker`,
        description,
        type: 'article',
        images: game.cover?.url ? [{
          url: game.cover.url.replace('t_thumb', 't_1080p'),
          width: 1080,
          height: 1440,
          alt: `${gameTitle} cover image`
        }] : [],
      },
      twitter: {
        title: `Track ${gameTitle} Progress - Game Vault`,
        description,
        card: 'summary_large_image',
        images: game.cover?.url ? [game.cover.url.replace('t_thumb', 't_1080p')] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for game:', error)
    return {
      title: 'Game Tracker - Game Vault',
      description: 'Track your gaming progress with the best video game tracker.',
    }
  }
}

export default async function GamePage({ params }: Props) {
  const { slug } = params
  
  try {
    // Convert slug back to search term
    const searchTerm = slug.replace(/-/g, ' ')
    
    // Search for the game
    const igdbService = new IGDBService()
    const searchResults = await igdbService.searchGames(searchTerm, 1)
    
    if (!searchResults || searchResults.length === 0) {
      notFound()
    }

    const game = searchResults[0]

    // Generate structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": game.name,
      "description": game.summary || `Track ${game.name} progress and achievements on Game Vault`,
      "image": game.cover?.url?.replace('t_thumb', 't_1080p'),
      "datePublished": game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
      "genre": game.genres?.map((g: any) => g.name) || [],
      "platform": game.platforms?.map((p: any) => p.name) || [],
      "publisher": game.involved_companies?.find((c: any) => c.publisher)?.company?.name,
      "developer": game.involved_companies?.find((c: any) => c.developer)?.company?.name,
      "aggregateRating": game.total_rating ? {
        "@type": "AggregateRating",
        "ratingValue": (game.total_rating / 10).toFixed(1),
        "bestRating": "10",
        "worstRating": "0",
        "ratingCount": game.total_rating_count || 1
      } : undefined,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "Free game tracking service"
      }
    }

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Game Detail Component */}
        <GameDetailWrapper gameId={game.id.toString()} />
      </>
    )
  } catch (error) {
    console.error('Error loading game page:', error)
    notFound()
  }
}

// Generate static params for popular games (for better performance)
export async function generateStaticParams() {
  // Popular games that we want to pre-generate
  const popularGameSlugs = [
    'cyberpunk-2077',
    'the-witcher-3-wild-hunt',
    'elden-ring',
    'baldurs-gate-3',
    'grand-theft-auto-v',
    'red-dead-redemption-2',
    'the-legend-of-zelda-breath-of-the-wild',
    'god-of-war',
    'horizon-zero-dawn',
    'assassins-creed-valhalla'
  ]

  return popularGameSlugs.map((slug) => ({
    slug: slug,
  }))
}