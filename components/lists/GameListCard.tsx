"use client";

import { GameList } from "@/types/gameList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Lock, Unlock } from "lucide-react";

interface GameListCardProps {
  list: GameList;
  onClick?: () => void;
}

export default function GameListCard({ list, onClick }: GameListCardProps) {
  const coverImages = list.games
    .slice(0, 4)
    .map((item) => item.game.coverImage);

  return (
    <Card
      className="hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold truncate">
            {list.title}
          </CardTitle>
          {list.isPublic ? (
            <Unlock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {list.games.length} games • Updated{" "}
          {formatDistanceToNow(new Date(list.updatedAt), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        {list.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {list.description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {coverImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] rounded-md overflow-hidden"
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
