"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Gamepad2, MoreHorizontal } from "lucide-react";
import { type GameStatus } from "@/types/game";
import { type GameCardProps } from "@/types/game";

export function GameCard({ game, index, onStatusChange }: GameCardProps) {
  if (!game?.id) {
    console.warn('Invalid game data:', game);
    return null;
  }

  const getHighQualityImageUrl = (url: string) => {
    return url.startsWith("//")
      ? `https:${url.replace("/t_thumb/", "/t_cover_big/")}`
      : url.replace("/t_thumb/", "/t_cover_big/");
  };

  const statusLabels: Record<GameStatus, string> = {
    playing: "Currently Playing",
    completed: "Completed",
    want_to_play: "Want to Play",
    dropped: "Dropped",
  };

  return (
    <div className="space-y-4">
      <Card className="group relative overflow-hidden transition-all hover:shadow-xl dark:hover:shadow-primary/10">
        <Link href={`/game/${game.id}`} className="relative block">
          <div className="relative aspect-[3/4] overflow-hidden">
            {game.cover?.url ? (
              <Image
                src={getHighQualityImageUrl(game.cover.url)}
                alt={game.name}
                fill
                priority={game.isPriority}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Gamepad2 className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {game.name}
                </h3>
                {game.platforms && game.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {game.platforms.map((platform) => (
                      <Badge
                        key={platform.id}
                        variant="secondary"
                        className="bg-black/50 text-xs hover:bg-black/70"
                      >
                        {platform.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.entries(statusLabels) as [GameStatus, string][]).map(
                ([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onStatusChange(value)}
                    className={game.status === value ? "bg-accent" : ""}
                  >
                    {label}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onStatusChange('dropped')}>
                Remove from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute left-2 top-2">
          <Badge
            variant="secondary"
            className="bg-black/50 text-white border-none"
          >
            {statusLabels[game.status]}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
