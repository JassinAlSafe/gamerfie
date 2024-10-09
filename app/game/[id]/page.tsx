import { Game } from "@/types/game";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAccessToken } from "../../api/games/route";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const accessToken = await getAccessToken();
  const game = await fetchGameDetails(accessToken, parseInt(params.id));

  if (!game) {
    return {
      title: "Game Not Found",
    };
  }

  return {
    title: `${game.name} | Gamerfie`,
    description: game.summary,
  };
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const accessToken = await getAccessToken();
  const game = await fetchGameDetails(accessToken, parseInt(params.id));

  if (!game) {
    notFound();
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith("//")) {
      return `https:${url}`;
    }
    return url;
  };

  const getHighQualityImageUrl = (url: string) => {
    return getImageUrl(url.replace("/t_thumb/", "/t_1080p/"));
  };

  const getWebsiteUrl = (game: Game) => {
    if (game.websites && game.websites.length > 0) {
      const officialSite = game.websites.find((site) => site.category === 1);
      return officialSite ? officialSite.url : game.websites[0].url;
    }
    return null;
  };

  const websiteUrl = getWebsiteUrl(game);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                {game.cover ? (
                  <div className="relative w-full aspect-[3/4] rounded-t-lg overflow-hidden">
                    <Image
                      src={getHighQualityImageUrl(game.cover.url)}
                      alt={`${game.name} cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      priority
                      quality={100}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                {websiteUrl && (
                  <Button asChild className="w-full rounded-t-none">
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
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-2/3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-4xl font-bold">
                  {game.name}
                </CardTitle>
                <div className="flex items-center mt-2">
                  {game.total_rating && (
                    <div className="flex items-center mr-4">
                      <Star className="w-6 h-6 text-yellow-400 mr-2" />
                      <span className="text-2xl font-bold">
                        {game.total_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {game.first_release_date
                        ? new Date(
                            game.first_release_date * 1000
                          ).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{game.summary}</p>
                <Separator className="my-6" />
                {game.genres && (
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
                {game.platforms && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 flex items-center">
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      Platforms
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <Badge key={platform.id} variant="outline">
                          {platform.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {game.involved_companies && (
                  <div>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
