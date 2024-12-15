"use client";

import React, { memo, useState, useEffect } from "react";
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
  MessageSquare,
  Share2,
  BookOpen,
  BarChart3,
  Check,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game } from "@/types/game";
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from "@/components/loadingSpinner";
import { cn } from "@/lib/utils";
import { CompletionDialog } from '@/components/game/completion-dialog';

const getHighQualityImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
    : url.replace("/t_thumb/", "/t_1080p/");
};

const getCoverImageUrl = (url: string) => {
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
  
  const { user } = useAuthStore();
  const { games, addGame, removeGame, fetchUserLibrary } = useLibraryStore();
  const { toast } = useToast();
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const websiteUrl = getWebsiteUrl(game);
  const backgroundImage = getBackgroundImage(game);
  const isInLibrary = games.some(g => g.id === game.id);

  useEffect(() => {
    if (user) {
      fetchUserLibrary(user.id);
    }
  }, [user, fetchUserLibrary]);

  const handleLibraryAction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your library",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToLibrary(true);
    try {
      if (isInLibrary) {
        await removeGame(game.id);
        toast({
          title: "Game Removed",
          description: `${game.name} has been removed from your library`,
        });
      } else {
        await addGame(game);
        toast({
          title: "Game Added",
          description: `${game.name} has been added to your library`,
        });
      }
      await fetchUserLibrary(user.id);
    } catch (error) {
      console.error('Library action error:', error);
      toast({
        title: "Error",
        description: "Failed to update library",
        variant: "destructive",
      });
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  const handleScreenshotClick = (index: number) => {
    setCurrentScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  };

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
                  {/* Add to Library Button for Desktop */}
                  <div className="hidden md:block">
                    <Button
                      onClick={handleLibraryAction}
                      disabled={isAddingToLibrary}
                      size="lg"
                      className={cn(
                        "flex items-center space-x-3 transition-all duration-300 text-lg py-6 px-8",
                        isInLibrary 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : "bg-purple-500/20 hover:bg-purple-500/30 hover:text-purple-300"
                      )}
                    >
                      {isAddingToLibrary ? (
                        <LoadingSpinner className="w-5 h-5" />
                      ) : isInLibrary ? (
                        <>
                          <Heart className="w-5 h-5 fill-current" />
                          <span>In Library</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          <span>Add to Library</span>
                        </>
                      )}
                    </Button>
                  </div>

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
          <Tabs defaultValue="overview" className="w-full">
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
                value="reviews"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Reviews
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
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Progress */}
                    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                        Your Progress
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Completion</span>
                            <span className="text-white">60%</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Achievements</span>
                            <span className="text-white">12/20</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <Button 
                          className="w-full mt-4 bg-green-500/20 hover:bg-green-500/30"
                          onClick={() => setIsCompletionDialogOpen(true)}
                        >
                          Update Progress
                        </Button>
                      </div>
                    </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Placeholder achievements */}
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 rounded-lg p-4 border border-white/10 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Achievement {index + 1}</h4>
                        <p className="text-sm text-gray-400">Description of the achievement</p>
                      </div>
                      <div className="ml-auto">
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
                          10G
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-6">
                  {/* Review Form */}
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                    <textarea
                      className="w-full h-32 bg-gray-800/50 rounded-lg border border-white/10 p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Share your thoughts about this game..."
                    />
                    <div className="flex justify-end mt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Post Review
                      </Button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {/* Placeholder reviews */}
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20" />
                            <div>
                              <h4 className="font-medium text-white">User {index + 1}</h4>
                              <p className="text-sm text-gray-400">Posted 2 days ago</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="ml-1 font-medium">4.5</span>
                          </div>
                        </div>
                        <p className="text-gray-300">
                          This is a placeholder review. The actual review content would go here.
                        </p>
                      </div>
                    ))}
                  </div>
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
      
      <CompletionDialog
        open={isCompletionDialogOpen}
        onOpenChange={setIsCompletionDialogOpen}
        game={game}
      />
    </div>
  );
}); 