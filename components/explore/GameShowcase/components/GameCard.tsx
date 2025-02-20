import { memo, useState } from "react";
import { CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { GameActionsMenu } from "./GameActionsMenu";

interface GameCardProps {
  game: Game;
}

export const GameCard = memo(({ game }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5">
      {game.coverImage && !imageError ? (
        <>
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1">
          {game.title}
        </h3>
        <p className="text-sm text-white/60 mb-2">
          {game.platforms && game.platforms.length > 0
            ? game.platforms[0].name
            : "Coming Soon"}
        </p>
        {game.releaseDate && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs">
            <CalendarDays className="w-3 h-3" />
            {new Date(game.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}
          </div>
        )}
      </div>
      <Link href={`/games/${game.id}`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
          <Button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Link>
      <GameActionsMenu game={game} />
    </div>
  );
});

GameCard.displayName = "GameCard";
