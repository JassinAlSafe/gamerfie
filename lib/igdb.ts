import { Game } from "@/types/game";

const IGDB_API_ENDPOINT = "https://api.igdb.com/v4";

async function fetchFromIGDB(
  endpoint: string,
  query: string,
  accessToken: string
) {
  const response = await fetch(`${IGDB_API_ENDPOINT}/${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${accessToken}`,
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGames(
  accessToken: string,
  platformId: number,
  limit: number
): Promise<Game[]> {
  const query = `
    fields name,cover.url,first_release_date,total_rating,screenshots.id;
    where platforms = ${platformId};
    sort total_rating desc;
    limit ${limit};
  `;
  return fetchFromIGDB("games", query, accessToken);
}

export async function fetchCovers(
  accessToken: string,
  coverIds: number[]
): Promise<{ url: string }[]> {
  const query = `
    fields url;
    where id = (${coverIds.join(",")});
  `;
  return fetchFromIGDB("covers", query, accessToken);
}

export async function fetchGameDetails(
  accessToken: string,
  gameId: number
): Promise<Game | null> {
  const query = `
    fields name,cover.url,first_release_date,genres.name,platforms.name,summary,total_rating,screenshots.url;
    where id = ${gameId};
  `;
  const games = await fetchFromIGDB("games", query, accessToken);
  return games.length > 0 ? games[0] : null;
}

export async function fetchScreenshots(
  accessToken: string,
  gameIds: number[]
): Promise<{ id: number; screenshots: { id: number; url: string }[] }[]> {
  const query = `
    fields id,screenshots.id,screenshots.url;
    where id = (${gameIds.join(",")});
  `;
  return fetchFromIGDB("games", query, accessToken);
}

// Add any other IGDB-related functions here