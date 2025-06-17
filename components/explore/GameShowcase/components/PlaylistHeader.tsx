import { memo } from "react";
import { CalendarDays, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaylistHeaderProps {
  date: string;
  title: string;
  description: string;
  type: string;
  playlistId?: string;
  isAdmin: boolean;
  onEditClick: () => void;
}

export const PlaylistHeader = memo(
  ({
    date,
    title,
    description,
    type,
    playlistId,
    isAdmin,
    onEditClick,
  }: PlaylistHeaderProps) => (
    <div className="flex items-start justify-between mb-8">
      <div className="space-y-2 max-w-[70%]">
        <div className="flex items-center gap-2 text-purple-400">
          <CalendarDays className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{date}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-3xl font-bold text-white line-clamp-2 cursor-default">
                {title}
              </h2>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md bg-gray-900/95 text-white border-white/10"
            >
              {title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-white/60 line-clamp-2 cursor-default">
                {description}
              </p>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md bg-gray-900/95 text-white border-white/10"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin && playlistId && (
          <Button
            onClick={onEditClick}
            variant="ghost"
            className="text-white/80 hover:bg-white/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        <div className="flex gap-2">
          {playlistId && (
            <Link href={`/playlists/${playlistId}`}>
              <Button 
                variant="outline" 
                className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors border-white/20"
              >
                View Details
              </Button>
            </Link>
          )}
          <Link href={`/playlists/category/${type}`}>
            <Button className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors">
              See all {type}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
);

PlaylistHeader.displayName = "PlaylistHeader";
