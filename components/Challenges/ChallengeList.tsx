"use client";

import { useEffect, useState } from "react";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { Challenge, ChallengeStatus, ChallengeType } from "@/types/challenge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Users,
  Calendar,
  ChevronRight,
  Search,
  Loader2,
  Gamepad2,
  Target,
} from "lucide-react";
import Image from "next/image";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

console.log(
  "Rendering ChallengeList component from components/Challenges/ChallengeList.tsx"
);

export function ChallengeList() {
  const { challenges, isLoading, error, fetchChallenges } =
    useChallengesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ChallengeType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "all">(
    "upcoming"
  );
  const [sortBy, setSortBy] = useState<string>("latest");

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    console.log("All challenges:", challenges);
  }, [challenges]);

  const getStatusVariant = (status: ChallengeStatus): BadgeVariant => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const filteredChallenges = challenges
    .filter((challenge) => {
      const matchesSearch = challenge.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || challenge.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || challenge.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "most-participants":
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        case "ending-soon":
          return (
            new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
          );
        default:
          return 0;
      }
    });

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value as ChallengeType | "all");
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ChallengeStatus | "all");
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading challenges: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sticky top-0 bg-background z-10 pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 sm:w-auto">
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
              <SelectItem value="collaborative">Collaborative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most-participants">
                Most Participants
              </SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No challenges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredChallenges.map((challenge) => {
            console.log("Challenge image data:", {
              id: challenge.id,
              title: challenge.title,
              cover_url: challenge.cover_url,
              using_fallback: !challenge.cover_url,
            });

            return (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                <Card className="group hover:bg-gray-800/50 transition-colors">
                  <div className="relative h-48 rounded-t-lg overflow-hidden">
                    <Image
                      src={
                        challenge.cover_url ||
                        "/images/placeholders/game-cover.jpg"
                      }
                      alt={challenge.title}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-5 h-5 text-purple-400" />
                          <h2 className="text-xl font-semibold group-hover:text-purple-400 transition-colors">
                            {challenge.title}
                          </h2>
                          <Badge
                            variant={
                              challenge.type === "competitive"
                                ? "default"
                                : "secondary"
                            }
                            className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                          >
                            {challenge.type}
                          </Badge>
                          <Badge variant={getStatusVariant(challenge.status)}>
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span>
                            {challenge.goals?.[0]?.target || 0}{" "}
                            {challenge.goals?.[0]?.type || "complete_games"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>
                            {challenge.participants?.length || 0} participants
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>
                            {challenge.status === "upcoming"
                              ? `Starts ${formatDistanceToNow(
                                  new Date(challenge.start_date),
                                  { addSuffix: true }
                                )}`
                              : `Ends ${formatDistanceToNow(
                                  new Date(challenge.end_date),
                                  { addSuffix: true }
                                )}`}
                          </span>
                        </div>
                      </div>

                      {challenge.type === "competitive" && (
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {challenge.participants
                              ?.slice(0, 3)
                              .map((participant) => (
                                <Avatar
                                  key={`${challenge.id}-participant-${participant.user_id}`}
                                  className="border-2 border-gray-900"
                                >
                                  <AvatarImage src={participant.avatar_url} />
                                  <AvatarFallback>
                                    {participant.username
                                      ? participant.username
                                          .slice(0, 2)
                                          .toUpperCase()
                                      : "??"}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                          </div>
                          {(challenge.participants?.length || 0) > 3 && (
                            <span className="text-sm text-gray-400">
                              +{(challenge.participants?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
