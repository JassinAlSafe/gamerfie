
import React from "react";
import { Game } from "@/types/game";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAccessToken } from "../../../lib/igdb";
import { fetchGameDetails } from "@/lib/igdb";
import {
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Gamepad2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BackButton from "./BackButton";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const accessToken = await getAccessToken();
  const game = await fetchGameDetails(accessToken, parseInt(params.id));

  return {
    title: game ? `${game.name} | Gamerfie` : "Game Details",
    description: game?.summary || "View game details",
  };
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-2xl font-bold">Loading game details...</div>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-2xl font-bold text-red-500">
        Error: {error.message}
      </div>
    </div>
  );
}

function GameDetails({ game }: { game: Game }) {
  const getHighQualityImageUrl = (url: string) => {
    return url.startsWith("//")
      ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
      : url.replace("/t_thumb/", "/t_1080p/");
  };

  const getWebsiteUrl = (game: Game) => {
    if (game.websites && game.websites.length > 0) {
      const officialSite = game.websites.find((site) => site.category === 1);
      return officialSite ? officialSite.url : game.websites[0].url;
    }
    return null;
  };

  const websiteUrl = getWebsiteUrl(game);

  const backgroundImage =
    game.artworks && game.artworks.length > 0
      ? getHighQualityImageUrl(game.artworks[0].url)
      : game.screenshots && game.screenshots.length > 0
      ? getHighQualityImageUrl(game.screenshots[0].url)
      : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div
        className="relative h-[85vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900" />
      </div>
      <div className="relative z-10 -mt-64 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              {game.cover && (
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={getHighQualityImageUrl(game.cover.url)}
                    alt={`${game.name} cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {websiteUrl && (
                <Button asChild className="w-full mt-4">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
            <div className="md:w-2/3">
              <h1 className="text-5xl font-bold mb-4">{game.name}</h1>
              <div className="flex items-center mb-6">
                {game.total_rating && (
                  <div className="flex items-center mr-6">
                    <Star className="w-8 h-8 text-yellow-400 mr-2" />
                    <span className="text-3xl font-bold">
                      {game.total_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-6 h-6 mr-2" />
                  <span className="text-xl">
                    {game.first_release_date
                      ? new Date(
                          game.first_release_date * 1000
                        ).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-8">{game.summary}</p>
              <Separator className="my-8" />
              {game.genres && game.genres.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Genres
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {game.platforms && game.platforms.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Platforms ({game.platforms.length})
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms.map((platform) => (
                      <Badge
                        key={platform.id}
                        variant="outline"
                        className="text-sm py-1 px-2 transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
                      >
                        {platform.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {game.involved_companies &&
                game.involved_companies.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Companies
                    </h2>
                    <ul className="list-disc list-inside">
                      {game.involved_companies.map((company) => (
                        <li key={company.id} className="text-gray-300">
                          {company.company.name}
                          {company.developer && company.publisher
                            ? " (Developer & Publisher)"
                            : company.developer
                            ? " (Developer)"
                            : company.publisher
                            ? " (Publisher)"
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="mt-16 mb-16">
              <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {game.screenshots.slice(0, 3).map((screenshot, index) => (
                  <div
                    key={screenshot.id}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <Image
                      src={getHighQualityImageUrl(screenshot.url)}
                      alt={`${game.name} screenshot ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: { id: string } }) {
  try {
    const accessToken = await getAccessToken();
    const game = await fetchGameDetails(accessToken, parseInt(params.id));

    if (!game) {
      notFound();
    }

    return <GameDetails game={game} />;
  } catch (error) {
    console.error("Error fetching game details:", error);
    return <ErrorState error={error as Error} />;
  }
}
