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
import { GameReview } from "./game-review";

// Add review to the props interface
interface GameCardProps {
  id: string;
  name: string;
  cover?: {
    url: string;
  };
  platforms?: {
    id: number;
    name: string;
  }[];
  status: string;
  rating?: number;
  onStatusChange: (status: string) => void;
  onRemove: () => void;
  isPriority?: boolean;
}

export function GameCard({
  id,
  name,
  cover,
  platforms,
  status,
  onStatusChange,
  onRemove,
  isPriority = false,
}: GameCardProps) {
  const getHighQualityImageUrl = (url: string) => {
    return url.startsWith("//")
      ? `https:${url.replace("/t_thumb/", "/t_cover_big/")}`
      : url.replace("/t_thumb/", "/t_cover_big/");
  };

  const statusLabels = {
    playing: "Currently Playing",
    completed: "Completed",
    want_to_play: "Want to Play",
    dropped: "Dropped",
  };

  return (
    <div className="space-y-4">
      <Card className="group relative overflow-hidden transition-all hover:shadow-xl dark:hover:shadow-primary/10">
        <Link href={`/game/${id}`} className="relative block">
          <div className="relative aspect-[3/4] overflow-hidden">
            {cover ? (
              <Image
                src={getHighQualityImageUrl(cover.url)}
                alt={name}
                fill
                priority={isPriority}
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
                  {name}
                </h3>
                {platforms && platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {platforms.map((platform) => (
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
              {Object.entries(statusLabels).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => onStatusChange(value)}
                  className={status === value ? "bg-accent" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="text-destructive" onClick={onRemove}>
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
            {statusLabels[status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </Card>

    
    </div>
  );
}
