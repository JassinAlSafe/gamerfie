import { Metadata } from "next";
import { GamePageClient } from "./GamePageClient";
import { GamePageProps } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { siteMetadata } from "@/app/config/metadata";
import { getTrendingGamesFromDB } from "@/lib/react-cache";

// Server-side game data fetching - use API route instead of direct service calls
async function fetchGameDataServerSide(gameId: string) {
  try {
    console.log('🎮 Server-side game fetch for ID:', gameId);
    
    // Use fetch to call our own API route server-side
    // This ensures consistent behavior and avoids import issues
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/games/${gameId}`, {
      // Add headers to indicate this is a server-side request
      headers: {
        'User-Agent': 'GameVault-Server/1.0',
        'X-Requested-With': 'server-side'
      }
    });
    
    if (!response.ok) {
      console.error(`Server-side API call failed: ${response.status} ${response.statusText}`);
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const gameData = await response.json();
    console.log('✅ Server-side game data fetched via API:', {
      gameId: gameData.id,
      name: gameData.name,
      dataSource: gameData.dataSource
    });
    
    return gameData;
  } catch (error) {
    console.error('Server-side game fetch error:', error);
    
    // Return fallback data
    return {
      id: gameId,
      name: `Game ${gameId.replace(/^(igdb_|rawg_)/, '')}`,
      summary: 'Unable to load game details at this time. Please try again later.',
      dataSource: 'server-fallback',
      error: error instanceof Error ? error.message : 'Server-side fetch failed',
      cover_url: null,
      first_release_date: null,
      genres: [],
      platforms: [],
      screenshots: [],
      videos: [],
      rating: null,
      total_rating: null
    };
  }
}

// Generate metadata for individual game pages
export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: game } = await supabase
      .from('games')
      .select('id, name, description, cover_url, release_date, developer, publisher, genres')
      .eq('id', params.id)
      .single();

    if (!game) {
      return {
        title: "Game Not Found | Game Vault",
        description: "The requested game could not be found in our database.",
        robots: { index: false, follow: false }
      };
    }

    const gameTitle = game.name || "Unknown Game";
    const gameDescription = game.description || `Discover ${gameTitle} on Game Vault. Track your progress, read reviews, and connect with other players.`;
    const genresList = Array.isArray(game.genres) ? game.genres.join(', ') : (game.genres || '');
    
    // Enhanced SEO description with gaming keywords
    const enhancedDescription = `${gameDescription.slice(0, 120)}... Track your progress, achievements, and gameplay time for ${gameTitle}. Join the gaming community discussion, read reviews, and discover similar games on Game Vault.`;

    const gameKeywords = [
      gameTitle,
      `${gameTitle} tracker`,
      `${gameTitle} progress`,
      `${gameTitle} review`,
      `${gameTitle} achievements`,
      game.developer,
      game.publisher,
      genresList,
      'video game tracker',
      'game progress tracking',
      'gaming statistics',
      'game reviews',
      'gaming community'
    ].filter(Boolean);

    return {
      title: `${gameTitle} - Track Progress & Reviews | Game Vault`,
      description: enhancedDescription,
      keywords: gameKeywords,
      authors: siteMetadata.authors,
      openGraph: {
        title: `${gameTitle} - Game Vault`,
        description: enhancedDescription,
        type: 'article',
        url: `https://gamersvaultapp.com/game/${params.id}`,
        images: game.cover_url ? [
          {
            url: game.cover_url,
            width: 800,
            height: 600,
            alt: `${gameTitle} - Cover Art`
          }
        ] : undefined,
        siteName: 'Game Vault',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${gameTitle} - Game Vault`,
        description: enhancedDescription,
        images: game.cover_url ? [game.cover_url] : undefined,
      },
      alternates: {
        canonical: `https://gamersvaultapp.com/game/${params.id}`
      },
      other: {
        'game:name': gameTitle,
        'game:developer': game.developer || '',
        'game:publisher': game.publisher || '',
        'game:release_date': game.release_date || '',
        'game:genre': genresList
      }
    };
  } catch {
    // Handle metadata generation errors gracefully
    return {
      title: "Game Details | Game Vault",
      description: "Explore game details, track your progress, and connect with the gaming community on Game Vault.",
      robots: { index: false, follow: false }
    };
  }
}

// Generate static params for popular games to enable Full Route Cache
export async function generateStaticParams() {
  try {
    const popularGames = await getTrendingGamesFromDB(50);
    return popularGames.map((game) => ({
      id: game.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for games:', error);
    return [];
  }
}

export default async function GamePage({ params }: GamePageProps) {
  // Fetch game data server-side where IGDB OAuth credentials are available
  const gameData = await fetchGameDataServerSide(params.id);
  
  // Pass pre-fetched data to client component
  return <GamePageClient gameData={gameData} params={params} />;
}
