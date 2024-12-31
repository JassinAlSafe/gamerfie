"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChallengeCardProps {
  title: string;
  description: string;
  organizer: {
    name: string;
    avatar?: string;
  };
  coverImage?: string;
  participantCount?: number;
  participantAvatars?: Array<{
    image?: string;
    fallback: string;
  }>;
  onAction?: () => void;
  status: "upcoming" | "active" | "completed";
  type: "competitive" | "collaborative";
  className?: string;
}

export function ChallengeCard({
  title,
  description,
  organizer,
  coverImage = "/images/placeholders/game-cover.jpg",
  participantCount = 0,
  participantAvatars = [],
  onAction,
  status,
  type,
  className,
}: ChallengeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
      case "upcoming":
        return "bg-amber-500/10 text-amber-500 ring-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 ring-gray-500/20";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "competitive"
      ? "bg-purple-500/10 text-purple-500 ring-purple-500/20"
      : "bg-pink-500/10 text-pink-500 ring-pink-500/20";
  };

  const getGradientByStatus = (status: string) => {
    switch (status) {
      case "active":
        return "from-emerald-500/20 to-emerald-700/20";
      case "completed":
        return "from-blue-500/20 to-blue-700/20";
      case "upcoming":
        return "from-amber-500/20 to-amber-700/20";
      default:
        return "from-gray-500/20 to-gray-700/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("group relative cursor-pointer h-[400px]", className)}
      onClick={onAction}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[22px] bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          getGradientByStatus(status)
        )}
      />
      <Card className="relative overflow-hidden rounded-[20px] bg-black/40 backdrop-blur-sm border-white/10 transition-colors duration-500 group-hover:bg-black/60 h-full">
        {/* Challenge Banner */}
        <div className="relative h-3/4 w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

          {/* Status & Type Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium ring-1",
                getStatusColor(status)
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium ring-1",
                getTypeColor(type)
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>

          {/* Title overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-xl font-bold text-white line-clamp-1">
              {title}
            </h3>
          </div>
        </div>

        <CardContent className="relative h-1/4 p-4">
          {/* Organizer & Participants */}
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 ring-2 ring-white/10">
                {organizer.avatar ? (
                  <AvatarImage src={organizer.avatar} />
                ) : (
                  <AvatarFallback className="bg-black/50 text-white">
                    {organizer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm text-gray-400">{organizer.name}</span>
            </div>

            <div className="flex items-center space-x-3">
              {participantAvatars.length > 0 && (
                <div className="flex -space-x-2">
                  {participantAvatars.slice(0, 3).map((avatar, i) => (
                    <Avatar key={i} className="ring-2 ring-black w-6 h-6">
                      {avatar.image ? (
                        <AvatarImage src={avatar.image} />
                      ) : (
                        <AvatarFallback className="bg-black/50 text-white">
                          {avatar.fallback}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ))}
                </div>
              )}
              <span className="text-sm text-gray-400">
                {participantCount} participants
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
