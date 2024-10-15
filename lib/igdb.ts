import axios from "axios";
import { Game, Platform } from "@/types/game";

const IGDB_API_ENDPOINT = "https://api.igdb.com/v4";

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
  offset: number = 0,
  limit: number = 48,
  platformId?: number
): Promise<
  {
    id: number;
    name: string;
    cover: { id: number; url: string } | null;
    total_rating: number;
    first_release_date: number;
    platforms: { name: string }[];
  }[]
> {
  try {
    let query = `fields name,cover.url,rating,total_rating,first_release_date,platforms.name;
      where cover != null;`;

    if (platformId) {
      query += ` where platforms = ${platformId};`;
    }

    query += ` sort total_rating desc;
      limit ${limit};
      offset ${offset};`;

    console.log(
      `Fetching games with offset: ${offset}, limit: ${limit}, platform ID: ${platformId}`
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

export async function fetchTotalGames(accessToken: string): Promise<number> {
  try {
    const response = await axios.post(
      `${IGDB_API_ENDPOINT}/games/count`,
      "where cover != null;",
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
): Promise<{ url: string }[]> {
  const query = `
    fields url;
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
      screenshots: gameData.screenshots
        ? gameData.screenshots.map((s: { id: number; url: string }) => ({
            id: s.id,
            url: s.url,
          }))
        : [],
      artworks: gameData.artworks
        ? gameData.artworks.map((a: { id: number; url: string }) => ({
            id: a.id,
            url: a.url,
          }))
        : [],
      genres: gameData.genres
        ? gameData.genres.map((g: { id: number; name: string }) => ({
            id: g.id,
            name: g.name,
          }))
        : [],
      platforms: gameData.platforms
        ? gameData.platforms.map((p: { id: number; name: string }) => ({
            id: p.id,
            name: p.name,
          }))
        : [],
      involved_companies: gameData.involved_companies
        ? gameData.involved_companies.map(
            (ic: {
              id: number;
              company: { id: number; name: string };
              developer: boolean;
              publisher: boolean;
            }) => ({
              id: ic.id,
              company: { id: ic.company.id, name: ic.company.name },
              developer: ic.developer,
              publisher: ic.publisher,
            })
          )
        : [],
      websites: gameData.websites
        ? gameData.websites.map(
            (w: { id: number; url: string; category: number }) => ({
              id: w.id,
              url: w.url,
              category: w.category,
            })
          )
        : [],
      videos: gameData.videos
        ? gameData.videos.map(
            (v: { id: number; name: string; video_id: string }) => ({
              id: v.id,
              name: v.name,
              video_id: v.video_id,
            })
          )
        : [],
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

export interface FetchedGame extends Omit<Game, "platforms"> {
  platforms: string[];
  first_release_date?: number;
  total_rating?: number;
}

export interface FetchGamesResponse {
  games: FetchedGame[];
  total: number;
}