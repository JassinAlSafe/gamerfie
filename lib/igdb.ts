import axios from "axios";
import { Game, Platform, Cover } from "@/types/game";
import { FetchedGame } from "@/types/igdb";

const IGDB_API_ENDPOINT = "https://api.igdb.com/v4";

export interface FetchGamesResponse {
  games: FetchedGame[];
  total: number;
}

export async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        client_secret: process.env.TWITCH_CLIENT_SECRET as string,
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
}

async function fetchFromIGDB(
  endpoint: string,
  query: string,
  accessToken: string
) {
  console.log(`Fetching from IGDB: ${endpoint}`);
  console.log(`Query: ${query}`);
  try {
    const response = await axios.post(
      `${IGDB_API_ENDPOINT}/${endpoint}`,
      query,
      {
        headers: {
          Accept: "application/json",
          "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`Response from IGDB (${endpoint}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from IGDB (${endpoint}):`, error);
    throw error;
  }
}

export async function fetchGames(
  accessToken: string,
  page: number,
  limit: number,
  platformId?: number,
  searchTerm?: string,
  offset?: number
): Promise<FetchedGame[]> {
  try {
    const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;
    let query = `fields name,cover.url,rating,total_rating,first_release_date,platforms.name;
      where cover != null`;

    if (searchTerm) {
      query += ` & name ~ *"${searchTerm}"*`;
    }

    if (platformId) {
      query += ` & platforms = ${platformId}`;
    }

    query += `; sort total_rating desc;
      limit ${limit};
      offset ${calculatedOffset};`;

    console.log(
      `Fetching games with page: ${page}, limit: ${limit}, platform ID: ${platformId}, searchTerm: ${searchTerm}`
    );

    const response = await axios.post(`${IGDB_API_ENDPOINT}/games`, query, {
      headers: {
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`Fetched games:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}

export async function fetchTotalGames(
  accessToken: string,
  platformId?: number,
  searchTerm?: string
): Promise<number> {
  try {
    let whereClause = "where cover != null";

    if (platformId) {
      whereClause += ` & platforms = (${platformId})`;
    }

    if (searchTerm) {
      whereClause += ` & name ~ *"${searchTerm}"*`;
    }

    whereClause += ";";

    const response = await axios.post(
      `${IGDB_API_ENDPOINT}/games/count`,
      whereClause,
      {
        headers: {
          "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.count;
  } catch (error) {
    console.error("Error fetching total games count:", error);
    throw error;
  }
}

export function ensureAbsoluteUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

export async function fetchCovers(
  accessToken: string,
  coverIds: number[]
): Promise<Cover[]> {
  const query = `
    fields id,game,url;
    where id = (${coverIds.join(",")});
  `;
  console.log(`Fetching covers for cover IDs: ${coverIds}`);
  const covers = await fetchFromIGDB("covers", query, accessToken);
  console.log(`Fetched covers:`, covers);
  return covers;
}

export async function fetchGameDetails(
  accessToken: string,
  gameId: number
): Promise<Game | null> {
  const query = `
    fields name,cover.url,first_release_date,genres.name,platforms.name,summary,storyline,total_rating,screenshots.url,artworks.url,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,websites.*,videos.*;
    where id = ${gameId};
  `;
  console.log(`Fetching game details for game ID: ${gameId}`);
  const games = await fetchFromIGDB("games", query, accessToken);
  console.log(`Fetched game details:`, games);

  if (games.length > 0) {
    const gameData = games[0];
    const game: Game = {
      id: gameData.id,
      name: gameData.name,
      summary: gameData.summary,
      storyline: gameData.storyline,
      total_rating: gameData.total_rating,
      first_release_date: gameData.first_release_date,
      cover: gameData.cover
        ? { id: gameData.cover.id, url: gameData.cover.url }
        : null,
      screenshots: gameData.screenshots,
      artworks: gameData.artworks,
      genres: gameData.genres,
      platforms: gameData.platforms,
      involved_companies: gameData.involved_companies,
      websites: gameData.websites,
      videos: gameData.videos,
    };
    console.log(`Processed game details:`, game);
    return game;
  }
  return null;
}

export async function fetchScreenshots(
  accessToken: string,
  gameIds: number[]
): Promise<{ id: number; screenshots: { id: number; url: string }[] }[]> {
  const query = `
    fields id,screenshots.id,screenshots.url;
    where id = (${gameIds.join(",")});
  `;
  console.log(`Fetching screenshots for game IDs: ${gameIds}`);
  const screenshots = await fetchFromIGDB("games", query, accessToken);
  console.log(`Fetched screenshots:`, screenshots);
  return screenshots;
}

export async function fetchPlatforms(accessToken: string): Promise<Platform[]> {
  const query = `
    fields id,name,abbreviation,alternative_name,category,generation,platform_family,slug,summary,url;
  `;
  console.log(`Fetching platforms`);
  const platforms = await fetchFromIGDB("platforms", query, accessToken);
  console.log(`Fetched platforms:`, platforms);
  return platforms;
}

export async function fetchPlatformDetails(
  accessToken: string,
  platformId: number
): Promise<Platform | null> {
  const query = `
    fields id,name,abbreviation,alternative_name,category,generation,platform_family,slug,summary,url;
    where id = ${platformId};
  `;
  console.log(`Fetching platform details for platform ID: ${platformId}`);
  const platforms = await fetchFromIGDB("platforms", query, accessToken);
  console.log(`Fetched platform details:`, platforms);
  return platforms.length > 0 ? platforms[0] : null;
}

export async function searchGames(accessToken: string, searchTerm: string) {
  try {
    const query = `search "${searchTerm}"; fields name,cover.url,first_release_date,total_rating,platforms.name; limit 50;`;

    const response = await axios.post(`${IGDB_API_ENDPOINT}/games`, query, {
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error in searchGames:", error);
    throw error;
  }
}
