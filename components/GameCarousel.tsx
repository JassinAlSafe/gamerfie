"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { Game } from "@/types/game";

interface GameCarouselProps {
  title: string;
  games: Game[];
}

const GameCarousel: React.FC<GameCarouselProps> = ({ title, games }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 2,
  });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (games.length === 0) {
    return <div className="text-center py-4 text-gray-400">No games available</div>;
  }

  return (
    <div className="w-full py-8 relative">
      <h2 className="text-2xl font-bold mb-4 text-white px-4">{title}</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {games.map((game, index) => (
            <div key={game.id} className="flex-[0_0_200px] min-w-0 pl-4">
              <Link href={`/game/${game.id}`} className="block group">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
                  {game.cover ? (
                    <Image
                      src={game.cover.url.replace("/t_thumb/", "/t_cover_big/")}
                      alt={`${game.name} cover`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  {game.total_rating && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md flex items-center text-sm">
                      <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                      <span className="font-bold">{game.total_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white truncate mb-1 transition-colors group-hover:text-blue-400">
                  {game.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {game.first_release_date
                    ? new Date(game.first_release_date * 1000).getFullYear()
                    : "TBA"}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Button
        onClick={scrollPrev}
        variant="outline"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        onClick={scrollNext}
        variant="outline"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default GameCarousel;