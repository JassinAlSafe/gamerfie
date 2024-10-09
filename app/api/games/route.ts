import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string> {
  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        client_secret: process.env.TWITCH_CLIENT_SECRET as string,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to fetch access token: ${res.status} ${res.statusText}. Error: ${errorText}`
      );
    }

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
}

async function fetchGames(
  accessToken: string,
  platformId: number,
  limit: number
) {
  try {
    const gameRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: `
        fields name,cover,rating,total_rating,first_release_date;
        where platforms = ${platformId} & cover != null;
        sort total_rating desc;
        limit ${limit};
      `,
    });

    if (!gameRes.ok) {
      const errorText = await gameRes.text();
      throw new Error(
        `IGDB games API request failed with status: ${gameRes.status} ${gameRes.statusText}. Error: ${errorText}`
      );
    }

    const games = await gameRes.json();
    console.log(`Fetched ${games.length} games for platform ${platformId}`);
    return games;
  } catch (error) {
    console.error(`Error fetching games for platform ${platformId}:`, error);
    throw error;
  }
}

function constructImageUrl(
  imageId: string,
  size: string = "cover_big"
): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

async function fetchCovers(accessToken: string, coverIds: number[]) {
  try {
    console.log(`Fetching covers for ${coverIds.length} games`);
    const batchSize = 10; // Adjust this value based on API limits
    const coverBatches = [];

    for (let i = 0; i < coverIds.length; i += batchSize) {
      const batch = coverIds.slice(i, i + batchSize);
      coverBatches.push(batch);
    }

    const coverPromises = coverBatches.map(async (batch) => {
      const coverRes = await fetch("https://api.igdb.com/v4/covers", {
        method: "POST",
        headers: {
          "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: `fields game,image_id,url; where id = (${batch.join(",")});`,
      });

      if (!coverRes.ok) {
        const errorText = await coverRes.text();
        throw new Error(
          `IGDB covers API request failed with status: ${coverRes.status} ${coverRes.statusText}. Error: ${errorText}`
        );
      }

      return coverRes.json();
    });

    const coverResults = await Promise.all(coverPromises);
    const coverData = coverResults.flat();
    console.log(`Fetched ${coverData.length} covers`);
    return coverData.map((cover: any) => ({
      ...cover,
      url: constructImageUrl(cover.image_id),
    }));
  } catch (error) {
    console.error("Error fetching covers:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    console.log("API route started");
    const cookieStore = cookies();
    let accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      console.log("No access token found in cookies, fetching new one");
      accessToken = await getAccessToken();
      // Set the new access token as a cookie
      cookieStore.set("accessToken", accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600 // 1 hour
      });
    }

    console.log("Access token obtained:", accessToken ? "Yes" : "No");

    const platforms = [
      { id: 167, name: "PS5" },
      { id: 48, name: "PS4" },
      { id: 130, name: "Switch" },
      { id: 169, name: "Xbox Series X|S" },
      { id: 6, name: "PC" },
    ];

    const allGames = await Promise.all(
      platforms.map(async (platform) => {
        const games = await fetchGames(accessToken as string, platform.id, 10);
        return { platform, games };
      })
    );

    console.log("Games fetched for all platforms");

    const coverIds = allGames.flatMap(({ games }) =>
      games.map((game: any) => game.cover).filter(Boolean)
    );

    console.log(`Total cover IDs to fetch: ${coverIds.length}`);

    const covers = await fetchCovers(accessToken as string, coverIds);

    console.log("Cover data fetched:", covers.length);

    const platformGamesWithCovers = allGames.map(({ platform, games }) => ({
      platform,
      games: games.map((game: any) => {
        const gameCover = covers.find((cover: any) => cover.game === game.id);
        if (!gameCover) {
          console.warn(
            `No cover found for game: ${game.name} (ID: ${game.id})`
          );
        }
        return {
          ...game,
          cover: gameCover || null,
        };
      }),
    }));

    console.log("API route completed successfully");
    return NextResponse.json({
      platformGames: platformGamesWithCovers,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export { getAccessToken}