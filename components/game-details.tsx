"use client";

import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Star, 
  ExternalLink, 
  Calendar, 
  Gamepad2, 
  Users, 
  Heart, 
  Clock, 
  Trophy,
  Share2,
  BookOpen,
  BarChart3,
  Library,
  X,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game } from "@/types/game";
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from "@/components/loadingSpinner";
import { cn } from "@/lib/utils";
import { CompletionDialog } from '@/components/game/completion-dialog';
import { AchievementsSection } from '@/components/game/achievements-section';
import { RelatedGamesSection } from '@/components/game/related-games-section';
import { useProgressStore } from '@/stores/useProgressStore';
import { addGameToLibrary, removeGameFromLibrary, checkGameInLibrary } from '@/utils/game-utils';
import { toast } from 'react-hot-toast';
import { GameProgressUpdate } from "@/components/game-progress-update";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddToLibraryButton } from "@/components/add-to-library-button";

const getHighQualityImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
    : url.replace("/t_thumb/", "/t_1080p/");
};

export const getCoverImageUrl = (url: string) => {
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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const { user } = useProfile();
  const { games, addGame, removeGame, fetchUserLibrary } = useLibraryStore();
  const { toast } = useToast();
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const websiteUrl = useMemo(() => getWebsiteUrl(game), [game]);
  const backgroundImage = useMemo(() => getBackgroundImage(game), [game]);
  const isInLibrary = useMemo(() => games.some(g => g.id === game.id), [games, game.id]);

  const { profile } = useProfile();
  const { 
    playTime, 
    completionPercentage, 
    achievementsCompleted,
    status,
    completedAt,
    loading: progressLoading, 
    fetchProgress 
  } = useProgressStore();

  const {
    games: libraryGames,
    loading: libraryLoading,
    addGame: libraryAddGame,
    removeGame: libraryRemoveGame,
    fetchUserLibrary: libraryFetchUserLibrary
  } = useLibraryStore();

  const isLoading = progressLoading || libraryLoading;

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id, game.id);
    }
  }, [profile?.id, game?.id, fetchProgress]);

  const handleScreenshotClick = useCallback((index: number) => {
    setCurrentScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  }, []);

  const renderProgress = () => (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
          Your Progress
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCompletionDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Update
        </Button>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completion</span>
              <span className="text-white">{completionPercentage}%</span>
            </div>
            <ProgressIndicator value={completionPercentage || 0} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Play Time</span>
              <span className="text-white">{playTime || 0}h</span>
            </div>
          </div>

          {game.achievements && game.achievements.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Achievements</span>
                <span className="text-white">
                  {achievementsCompleted || 0} / {game.achievements.length}
                </span>
              </div>
              <ProgressIndicator 
                value={((achievementsCompleted || 0) / game.achievements.length) * 100}
                variant="achievement" 
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Parallax Hero Section */}
      <motion.div 
        className="relative h-[85vh] w-full"
        style={{ y, opacity }}
      >
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />

        {/* Hero Content */}
        <div className="relative z-30 h-full container mx-auto px-4">
          <div className="pt-8">
            <BackButton />
          </div>

          {/* Game Info Container */}
          <div className="absolute bottom-0 left-4 right-4 pb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              {/* Cover Image */}
              <motion.div 
                className="md:w-1/4 flex-shrink-0 md:translate-y-24"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {game.cover && (
                  <div className="relative w-56 h-72 md:w-72 md:h-96 rounded-lg overflow-hidden shadow-2xl ring-4 ring-purple-500/20">
                    <Image
                      src={game.cover.url.replace('t_thumb', 't_1080p').replace('t_micro', 't_1080p')}
                      alt={game.name}
                      fill
                      priority
                      quality={100}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </motion.div>

              {/* Game Details */}
              <div className="md:w-3/4 pb-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-6 text-white"
                >
                  {game.name}
                </motion.h1>

                {/* Quick Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-4 mb-6"
                >
                  {game.total_rating && (
                    <div className="flex items-center bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Star className="w-6 h-6 text-yellow-400 mr-2" />
                      <span className="text-2xl font-bold">{game.total_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-400 mr-2" />
                    <span className="text-lg">
                      {game.first_release_date
                        ? formatDate(game.first_release_date)
                        : "Unknown"}
                    </span>
                  </div>
                  {game.genres && (
                    <div className="flex items-center bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Gamepad2 className="w-6 h-6 text-purple-400 mr-2" />
                      <span className="text-lg">{game.genres[0]?.name}</span>
                    </div>
                  )}
                </motion.div>

                {/* Summary */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg text-gray-300 leading-relaxed mb-8 line-clamp-3"
                >
                  {game.summary}
                </motion.p>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  <AddToLibraryButton 
                    gameId={game.id.toString()}
                    gameName={game.name}
                    cover={game.cover?.url}
                    rating={game.total_rating}
                    releaseDate={game.first_release_date}
                    platforms={game.platforms}
                    genres={game.genres}
                    variant="outline"
                    size="lg"
                    className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
                  />

                  <Button
                    onClick={() => setIsCompletionDialogOpen(true)}
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 py-6"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Update Progress</span>
                  </Button>

                  {websiteUrl && (
                    <Button 
                      variant="outline"
                      size="lg"
                      className="group hover:scale-105 transition-all duration-300 py-6" 
                      asChild
                    >
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 py-6"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b border-white/10 bg-transparent h-auto p-0">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Related Games
              </TabsTrigger>
            </TabsList>

            <div className="py-8">
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                        About
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {game.summary}
                      </p>
                      {game.storyline && (
                        <>
                          <h4 className="text-lg font-semibold mt-6 mb-2">Storyline</h4>
                          <p className="text-gray-300 leading-relaxed">
                            {game.storyline}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                        Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {game.genres && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Genres</h4>
                            <div className="flex flex-wrap gap-2">
                              {game.genres.map((genre) => (
                                <Badge
                                  key={genre.id}
                                  variant="secondary"
                                  className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                >
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {game.platforms && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Platforms</h4>
                            <div className="flex flex-wrap gap-2">
                              {game.platforms.map((platform) => (
                                <Badge
                                  key={platform.id}
                                  variant="secondary"
                                  className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                >
                                  {platform.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile && renderProgress()}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Community Stats */}
                    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-400" />
                        Community Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Players</span>
                          <span className="text-white font-medium">1,234</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Reviews</span>
                          <span className="text-white font-medium">456</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Avg. Playtime</span>
                          <span className="text-white font-medium">25h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {game.screenshots?.map((screenshot, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleScreenshotClick(index)}
                    >
                      <Image
                        src={getHighQualityImageUrl(screenshot.url)}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="mt-0">
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Achievements
                  </h3>
                  <AchievementsSection achievements={game.achievements || []} />
                </div>
              </TabsContent>

              <TabsContent value="related" className="mt-0">
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2 text-blue-400" />
                    Similar Games You Might Like
                  </h3>
                  <RelatedGamesSection games={game.relatedGames || []} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ScreenshotModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        screenshots={game.screenshots || []}
        currentIndex={currentScreenshotIndex}
        onIndexChange={setCurrentScreenshotIndex}
      />
      
      {isCompletionDialogOpen && game && (
        <CompletionDialog
          isOpen={isCompletionDialogOpen}
          setIsOpen={setIsCompletionDialogOpen}
          game={game}
        />
      )}
    </div>
  );
}); 