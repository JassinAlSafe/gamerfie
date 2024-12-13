"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import { Star, ExternalLink, Calendar, Gamepad2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game } from "@/types/game";

const getHighQualityImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
    : url.replace("/t_thumb/", "/t_1080p/");
};

const getCoverImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_cover_big/")}`
    : url.replace("/t_thumb/", "/t_cover_big/");
};

const getWebsiteUrl = (game: Game) => {
  if (game.websites && game.websites.length > 0) {
    const officialSite = game.websites.find((site) => site.category === 1);
    return officialSite ? officialSite.url : game.websites[0].url;
  }
  return null;
};

const getBackgroundImage = (game: Game) => {
  if (game.artworks && game.artworks.length > 0) {
    return getHighQualityImageUrl(game.artworks[0].url);
  }
  if (game.screenshots && game.screenshots.length > 0) {
    return getHighQualityImageUrl(game.screenshots[0].url);
  }
  return null;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

export const GameDetails = memo(function GameDetails({ game }: { game: Game }) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<number | null>(null);
  const websiteUrl = getWebsiteUrl(game);
  const backgroundImage = getBackgroundImage(game);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header Spacer */}
      <div className="h-16" />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />

        {/* Hero Content */}
        <div className="relative z-30 h-full container mx-auto px-4">
          {/* Back Button */}
          <div className="pt-8">
            <BackButton />
          </div>

          {/* Game Info Container */}
          <div className="absolute bottom-0 left-4 right-4 pb-32">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Cover Image */}
              <div className="md:w-1/4 flex-shrink-0">
                {game.cover && (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl 
                                 ring-1 ring-white/10 transform hover:scale-105 transition-all duration-300">
                    <Image
                      src={getCoverImageUrl(game.cover.url)}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Game Details */}
              <div className="md:w-3/4 pb-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                  {game.name}
                </h1>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {game.total_rating && (
                    <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                      <Star className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-2xl font-bold">{game.total_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-lg">
                      {game.first_release_date
                        ? formatDate(game.first_release_date)
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-lg text-gray-300 leading-relaxed mb-8 line-clamp-3">
                  {game.summary}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <AddToLibraryButton
                    gameId={game.id.toString()}
                    gameName={game.name}
                  />
                  {websiteUrl && (
                    <Button variant="outline" size="lg" className="group" asChild>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex-grow w-full">
        {/* Info Cards Section */}
        <div className="relative z-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24">
              {/* Genres Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-purple-400" />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map((genre) => (
                    <Badge 
                      key={genre.id}
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-3 py-1"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platforms Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-blue-400" />
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms?.map((platform) => (
                    <Badge
                      key={platform.id}
                      variant="outline"
                      className="hover:bg-white/10 px-3 py-1"
                    >
                      {platform.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Companies Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Development
                </h3>
                <div className="space-y-2">
                  {game.involved_companies?.map((company) => (
                    <div key={company.id} className="text-sm">
                      <span className="text-white font-medium">{company.company.name}</span>
                      <span className="text-gray-400 ml-2">
                        {company.developer && company.publisher ? "(Dev & Pub)" : 
                         company.developer ? "(Developer)" : "(Publisher)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-gray-950 mt-24 w-full pb-24">
          <div className="max-w-7xl mx-auto px-4">
            {/* About Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">About</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                {game.summary}
              </p>
            </div>

            <Separator className="my-16 bg-gray-800" />

            {/* Screenshots */}
            {game.screenshots && game.screenshots.length > 0 && (
              <>
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">Screenshots</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {game.screenshots.slice(0, 3).map((screenshot, index) => (
                      <div
                        key={screenshot.id}
                        className="relative aspect-video rounded-xl overflow-hidden group shadow-2xl cursor-pointer"
                        onClick={() => setSelectedScreenshot(index)}
                      >
                        <Image
                          src={getHighQualityImageUrl(screenshot.url)}
                          alt={`${game.name} screenshot ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-sm font-medium">Click to view</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ScreenshotModal
                  screenshots={game.screenshots.map(s => ({
                    id: s.id,
                    url: getHighQualityImageUrl(s.url)
                  }))}
                  currentIndex={selectedScreenshot ?? 0}
                  isOpen={selectedScreenshot !== null}
                  onClose={() => setSelectedScreenshot(null)}
                  onNext={() => setSelectedScreenshot(prev => 
                    prev !== null && prev < game.screenshots.length - 1 ? prev + 1 : prev
                  )}
                  onPrevious={() => setSelectedScreenshot(prev => 
                    prev !== null && prev > 0 ? prev - 1 : prev
                  )}
                />
              </>
            )}

            <Separator className="my-16 bg-gray-800" />

            {/* Similar Games */}
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}); 