import { cache } from 'react'
import type { IGDBGame } from '@/types/igdb-types'

let cachedToken: string | null = null
let tokenExpiry: number | null = null

export const getIGDBToken = cache(async () => {
  try {
    // Return cached token if still valid (with 5 minute buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
      return cachedToken;
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_TWITCH_CLIENT_ID is not configured');
    }
    if (!process.env.TWITCH_CLIENT_SECRET) {
      throw new Error('TWITCH_CLIENT_SECRET is not configured');
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get IGDB token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.access_token || typeof data.expires_in !== 'number') {
      throw new Error('Invalid token response from Twitch');
    }

    // Cache the token with a 5-minute buffer before expiry
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return data.access_token;
  } catch (error) {
    // Clear cached token in case of error
    cachedToken = null;
    tokenExpiry = null;
    throw error;
  }
}); 

export async function fetchGameDetails(gameId: string) {
  try {
    const token = await getIGDBToken();
    
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
      },
      body: `
        fields name, summary, storyline, rating, rating_count, total_rating, total_rating_count, 
               first_release_date, cover.url, screenshots.url, videos.video_id, genres.name, 
               platforms.name, involved_companies.company.name, involved_companies.developer,
               involved_companies.publisher, game_modes.name, themes.name, player_perspectives.name,
               status, category, version_title, dlcs, expanded_games, expansions, 
               standalone_expansions, remakes, remasters, bundles, collection.name,
               aggregated_rating, aggregated_rating_count, follows, hypes, websites.url, 
               websites.category, artworks.url;
        where id = ${gameId};
      `,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB game details error:', errorText);
      throw new Error('Failed to fetch game details');
    }

    const [gameDetails] = await response.json();
    
    if (!gameDetails) {
      console.error('No game details found for ID:', gameId);
      return null;
    }

    // Process cover URL to get the highest quality version
    if (gameDetails.cover?.url) {
      let url = gameDetails.cover.url;
      if (url.startsWith('//')) {
        url = `https:${url}`;
      }
      gameDetails.cover.url = url.replace('t_thumb', 't_cover_big');
    }

    // Process screenshot URLs to get high quality versions
    if (gameDetails.screenshots) {
      gameDetails.screenshots = gameDetails.screenshots.map((screenshot: { url: string }) => {
        let url = screenshot.url;
        if (url.startsWith('//')) {
          url = `https:${url}`;
        }
        return {
          ...screenshot,
          url: url.replace('t_thumb', 't_screenshot_huge')
        };
      });
    }

    // Process artwork URLs to get high quality versions
    if (gameDetails.artworks) {
      gameDetails.artworks = gameDetails.artworks.map((artwork: { url: string }) => {
        let url = artwork.url;
        if (url.startsWith('//')) {
          url = `https:${url}`;
        }
        return {
          ...artwork,
          url: url.replace('t_thumb', 't_original')
        };
      });
    }

    return gameDetails;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
}

export async function fetchGameAchievements(gameId: string) {
  try {
    const token = await getIGDBToken();
    
    const response = await fetch('https://api.igdb.com/v4/achievements', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
      },
      body: `
        fields name, description, category, points, rank, game;
        where game = ${gameId};
        sort rank asc;
        limit 50;
      `,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB achievements error:', errorText);
      throw new Error('Failed to fetch achievements');
    }

    const achievements = await response.json();
    console.log('Fetched achievements:', achievements); // Debug log
    return achievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return []; // Return empty array instead of throwing
  }
} 

export async function fetchRelatedGames(gameId: string) {
  try {
    const token = await getIGDBToken();
    console.log(`Fetching related games for game ID: ${gameId}`);
    
    // First, get the game's company and series info
    const gameInfoResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
      },
      body: `
        fields name, involved_companies.company.*, collection.*, dlcs.*, expanded_games.*, expansions.*, standalone_expansions.*;
        where id = ${gameId};
      `,
    });

    if (!gameInfoResponse.ok) {
      const errorText = await gameInfoResponse.text();
      console.error('Failed to fetch game info:', errorText);
      throw new Error(`Failed to fetch game info: ${errorText}`);
    }

    const gameInfoData = await gameInfoResponse.json();
    console.log('Game info response:', gameInfoData);
    
    const [gameInfo] = gameInfoData as IGDBGame[];
    if (!gameInfo) {
      console.error('No game info found for ID:', gameId);
      throw new Error('Game not found');
    }

    // Get company IDs
    const companyIds = gameInfo.involved_companies?.map((ic: { company: { id: number } }) => ic.company.id).filter(Boolean) || [];
    console.log('Found company IDs:', companyIds);
    
    // Get all related game IDs
    const relatedGameIds = new Set<number>();

    // Add games from the same collection/series
    if (gameInfo.collection?.games) {
      gameInfo.collection.games.forEach((id: number) => relatedGameIds.add(id));
    }

    // Add DLCs and expansions
    [
      gameInfo.dlcs || [],
      gameInfo.expanded_games || [],
      gameInfo.expansions || [],
      gameInfo.standalone_expansions || []
    ].flat().forEach(id => relatedGameIds.add(id));

    console.log('Found related game IDs:', Array.from(relatedGameIds));

    // Remove the current game from the set
    relatedGameIds.delete(Number(gameId));

    // If we have no related games yet, get games from the same company
    if (relatedGameIds.size === 0 && companyIds.length > 0) {
      console.log('No direct relations found, fetching games from same companies');
      const companyGamesResponse = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
        body: `
          fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
          where involved_companies.company = (${companyIds.join(',')}) 
          & id != ${gameId} 
          & cover != null 
          & category = (0,8,9,10,11);
          sort total_rating_count desc;
          limit 12;
        `,
      });

      if (!companyGamesResponse.ok) {
        const errorText = await companyGamesResponse.text();
        console.error('Failed to fetch company games:', errorText);
        throw new Error(`Failed to fetch company games: ${errorText}`);
      }

      const companyGames = await companyGamesResponse.json();
      console.log('Found company games:', companyGames.length);
      return companyGames.map((game: any) => ({
        ...game,
        cover: game.cover ? {
          ...game.cover,
          url: game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url
        } : game.cover
      }));
    }

    // If we have related games (DLCs, series games), fetch their details
    if (relatedGameIds.size > 0) {
      console.log('Fetching details for related games');
      const relatedGamesResponse = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
        body: `
          fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
          where id = (${Array.from(relatedGameIds).join(',')}) 
          & cover != null 
          & category = (0,8,9,10,11);
          sort total_rating_count desc;
          limit 12;
        `,
      });

      if (!relatedGamesResponse.ok) {
        const errorText = await relatedGamesResponse.text();
        console.error('Failed to fetch related games:', errorText);
        throw new Error(`Failed to fetch related games: ${errorText}`);
      }

      const relatedGames = await relatedGamesResponse.json();
      console.log('Found related games:', relatedGames.length);
      return relatedGames.map((game: any) => ({
        ...game,
        cover: game.cover ? {
          ...game.cover,
          url: game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url
        } : game.cover
      }));
    }

    console.log('No related games found');
    return [];
  } catch (error) {
    console.error('Error in fetchRelatedGames:', error);
    return [];
  }
} 