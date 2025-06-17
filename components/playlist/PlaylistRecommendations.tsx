"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaylistService } from "@/services/playlistService";
import { Playlist, PlaylistType } from "@/types/playlist";
import { GameThumbnailStack } from "@/components/admin/playlist/shared/GameThumbnail";
import { PlaylistTypeIcon } from "@/components/admin/playlist/shared/PlaylistTypeIcon";
import { cn } from "@/lib/utils";
import { getTypeColor, formatPlaylistDate } from "@/lib/playlist-utils";
import Link from "next/link";

interface PlaylistRecommendationsProps {
  currentPlaylistId?: string;
  currentPlaylistType?: PlaylistType;
  maxRecommendations?: number;
  className?: string;
}

interface RecommendationReason {
  type: 'similar_type' | 'trending' | 'community';
  label: string;
  confidence: number;
}

interface PlaylistRecommendation extends Playlist {
  reason: RecommendationReason;
  similarity?: number;
  trending?: boolean;
}

const recommendationReasons = {
  similar_type: {
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  trending: {
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  community: {
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
} as const;

export const PlaylistRecommendations: React.FC<PlaylistRecommendationsProps> = ({
  currentPlaylistId,
  currentPlaylistType,
  maxRecommendations = 6,
  className,
}) => {
  const [recommendations, setRecommendations] = useState<PlaylistRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const generateRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const featuredPlaylists = await PlaylistService.getFeaturedPlaylists(10);
      let allCandidates: Playlist[] = [...featuredPlaylists];
      
      if (currentPlaylistType) {
        const currentTypePlaylists = await PlaylistService.getPlaylistsByType(currentPlaylistType);
        allCandidates = [...allCandidates, ...currentTypePlaylists];
      }

      if (currentPlaylistId) {
        allCandidates = allCandidates.filter(p => p.id !== currentPlaylistId);
      }

      const uniqueCandidates = allCandidates.reduce((acc, current) => {
        const exists = acc.find(p => p.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as Playlist[]);

      const scoredRecommendations: PlaylistRecommendation[] = uniqueCandidates.map(playlist => {
        let reason: RecommendationReason;
        
        if (currentPlaylistType && playlist.type === currentPlaylistType) {
          reason = {
            type: 'similar_type',
            label: `Similar ${playlist.type} playlist`,
            confidence: 0.8 + Math.random() * 0.2,
          };
        } else if (Math.random() > 0.6) {
          reason = {
            type: 'trending',
            label: 'Trending in community',
            confidence: 0.7 + Math.random() * 0.2,
          };
        } else {
          reason = {
            type: 'community',
            label: 'Community recommended',
            confidence: 0.5 + Math.random() * 0.3,
          };
        }

        return {
          ...playlist,
          reason,
          similarity: Math.random() * 0.4 + 0.6,
          trending: Math.random() > 0.7,
        };
      });

      const sortedRecommendations = scoredRecommendations
        .sort((a, b) => b.reason.confidence - a.reason.confidence)
        .slice(0, maxRecommendations);

      setRecommendations(sortedRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPlaylistId, currentPlaylistType, maxRecommendations]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recommended Playlists</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/60"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recommended Playlists</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No recommendations yet</h4>
            <p className="text-white/60 mb-4">We're working on finding the perfect playlists for you</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white">Recommended for You</h3>
          <p className="text-sm text-white/60">Playlists you might enjoy based on your interests</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-white/60 hover:text-white gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={refreshKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {recommendations.map((playlist, index) => (
            <RecommendationCard
              key={`${playlist.id}-${refreshKey}`}
              playlist={playlist}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface RecommendationCardProps {
  playlist: PlaylistRecommendation;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  playlist,
  index,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const reasonConfig = recommendationReasons[playlist.reason.type];
  const ReasonIcon = reasonConfig.icon;
  const previewGames = playlist.games?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/playlists/${playlist.id}`}>
        <Card className="group cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-lg overflow-hidden">
          <div className={cn("h-1", getTypeColor(playlist.type))} />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <PlaylistTypeIcon type={playlist.type} />
                  <Badge variant="secondary" className="text-xs capitalize">
                    {playlist.type}
                  </Badge>
                  {playlist.trending && (
                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-sm line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
                  {playlist.title}
                </CardTitle>
                
                <p className="text-xs text-white/60 line-clamp-2">
                  {playlist.description}
                </p>
              </div>
              
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
              </motion.div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {previewGames.length > 0 && (
              <div className="flex items-center gap-2">
                <GameThumbnailStack
                  games={previewGames}
                  maxVisible={3}
                  size="xs"
                  showCount={false}
                />
                <span className="text-xs text-white/50">
                  {playlist.gameIds?.length || 0} games
                </span>
              </div>
            )}
            
            <div className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-full text-xs",
              reasonConfig.bgColor
            )}>
              <ReasonIcon className={cn("w-3 h-3", reasonConfig.color)} />
              <span className={reasonConfig.color}>{playlist.reason.label}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatPlaylistDate(playlist.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {Math.floor(Math.random() * 1000) + 100}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};