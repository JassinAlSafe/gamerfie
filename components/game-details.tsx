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
  Activity,
  BookOpen,
  Trophy,
  Clock,
  Share2,
  PlayCircle,
  BookmarkPlus,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game, GameStatus } from "@/types/game";
import { useProfile } from "@/hooks/use-profile";
import { useProgressStore } from "@/stores/useProgressStore";
import { formatRating } from "@/utils/game-utils";
import { GameActivities } from "@/components/game/game-activities";
import { CompletionDialog } from "@/components/game/completion-dialog";
import { AchievementsSection } from "@/components/game/achievements-section";
import { RelatedGamesSection } from "@/components/game/related-games-section";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useGameActivities } from "@/hooks/use-game-activities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { StatusDialog } from "@/components/game/status-dialog";
import { GameStats } from "@/components/game/game-stats";
import { CommunityStats } from "@/components/game/community-stats";
import { ChallengesSection } from "@/components/game/challenges-section";

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
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export const GameDetails = memo(function GameDetails({ game }: { game: Game }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<GameStatus | null>(null);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);

  const websiteUrl = useMemo(() => getWebsiteUrl(game), [game]);
  const backgroundImage = useMemo(() => getBackgroundImage(game), [game]);

  const { profile } = useProfile();
  const {
    playTime,
    completionPercentage,
    achievementsCompleted,
    loading: progressLoading,
    fetchProgress,
    updateGameStatus,
  } = useProgressStore();

  const {
    activities,
    loading: activitiesLoading,
    hasMore,
    loadMore,
  } = useGameActivities(game.id.toString());

  const router = useRouter();

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  useEffect(() => {
    const checkGameStatus = async () => {
      if (!profile?.id || !game?.id) return;

      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("user_games")
        .select("status")
        .eq("user_id", profile.id)
        .eq("game_id", game.id)
        .single();

      if (!error && data) {
        setCurrentStatus(data.status as GameStatus);
      }
    };

    checkGameStatus();
  }, [profile?.id, game?.id]);

  const handleScreenshotClick = useCallback((index: number) => {
    setCurrentScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  }, []);

  const handleCommentSubmit = async () => {
    if (selectedStatus) {
      await updateStatus(selectedStatus, comment.trim());
      setShowCommentDialog(false);
      setComment("");
      setSelectedStatus(null);
    }
  };

  const updateStatus = async (status: GameStatus, comment?: string) => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      await updateGameStatus(
        profile.id,
        game.id.toString(),
        status,
        {
          playTime: null,
          completionPercentage: null,
        },
        comment
      );
      setIsCompletionDialogOpen(false);
    } catch (error) {
      console.error("Error updating game status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderProgress = () => (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
      <GameStats
        playTime={playTime || 0}
        completionPercentage={completionPercentage || 0}
        achievementsCompleted={achievementsCompleted || 0}
        totalAchievements={game.achievements?.length || 0}
        playTimeHistory={useProgressStore.getState().playTimeHistory}
        achievementHistory={useProgressStore.getState().achievementHistory}
      />
    </div>
  );

  const renderActionButtons = () => {
    if (!profile) {
      return (
        <Button
          onClick={() => router.push("/signin")}
          variant="outline"
          size="lg"
          className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
        >
          Sign in to add to library
        </Button>
      );
    }

    if (currentStatus) {
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setIsStatusDialogOpen(true)}
            variant="outline"
            size="lg"
            className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
          >
            {currentStatus === "playing" && (
              <>
                <PlayCircle className="w-5 h-5 mr-2 text-blue-400" />
                Currently Playing
              </>
            )}
            {currentStatus === "completed" && (
              <>
                <Trophy className="w-5 h-5 mr-2 text-green-400" />
                Completed
              </>
            )}
            {currentStatus === "want_to_play" && (
              <>
                <BookmarkPlus className="w-5 h-5 mr-2 text-purple-400" />
                Want to Play
              </>
            )}
            {currentStatus === "dropped" && (
              <>
                <Ban className="w-5 h-5 mr-2 text-red-400" />
                Dropped
              </>
            )}
          </Button>

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
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        <AddToLibraryButton
          gameId={game.id.toString()}
          gameName={game.name}
          cover={game.cover?.url}
          rating={game.total_rating || undefined}
          releaseDate={game.first_release_date || undefined}
          platforms={game.platforms || []}
          genres={game.genres || []}
          variant="outline"
          size="lg"
          className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
          onSuccess={(status) => setCurrentStatus(status)}
        />

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
      </div>
    );
  };

  const summaryMaxLength = 300;
  const storylineMaxLength = 300;

  const truncatedSummary = useMemo(() => {
    if (!game.summary || game.summary.length <= summaryMaxLength)
      return game.summary;
    return isAboutExpanded
      ? game.summary
      : `${game.summary.slice(0, summaryMaxLength)}...`;
  }, [game.summary, isAboutExpanded]);

  const truncatedStoryline = useMemo(() => {
    if (!game.storyline || game.storyline.length <= storylineMaxLength)
      return game.storyline;
    return isStorylineExpanded
      ? game.storyline
      : `${game.storyline.slice(0, storylineMaxLength)}...`;
  }, [game.storyline, isStorylineExpanded]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Parallax Hero Section */}
      <motion.div className="relative h-[85vh] w-full" style={{ y, opacity }}>
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />

        {/* Hero Content */}
        <div className="relative z-30 h-full container mx-auto px-4">
          <div className="pt-8">
            <BackButton />
          </div>

          {/* Game Info Container */}
          <div className="absolute bottom-0 left-4 right-4 pb-16 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-8 md:gap-4 items-start md:items-end"
            >
              {/* Cover Image */}
              <motion.div
                className="w-48 md:w-1/4 flex-shrink-0 md:translate-y-24 mx-auto md:mx-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {game.cover && (
                  <div className="relative w-48 h-64 md:w-72 md:h-96 rounded-lg overflow-hidden shadow-2xl ring-4 ring-purple-500/20">
                    <Image
                      src={game.cover.url
                        .replace("t_thumb", "t_1080p")
                        .replace("t_micro", "t_1080p")}
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
              <div className="md:w-3/4 pb-4 text-center md:text-left">
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
                  className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start"
                >
                  {game.total_rating ? (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-lg font-semibold">
                        {formatRating(game.total_rating)}
                      </span>
                    </div>
                  ) : null}
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
                  className="flex flex-wrap gap-3 justify-center md:justify-start"
                >
                  {renderActionButtons()}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b border-white/10 bg-transparent h-auto p-0 overflow-x-auto flex-nowrap whitespace-nowrap">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Stats
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
                value="challenges"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Challenges
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="px-4 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent"
              >
                Activity
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
                      <div className="space-y-6">
                        <div>
                          <p className="text-gray-300 leading-relaxed">
                            {truncatedSummary}
                          </p>
                          {game.summary &&
                            game.summary.length > summaryMaxLength && (
                              <Button
                                variant="link"
                                onClick={() =>
                                  setIsAboutExpanded(!isAboutExpanded)
                                }
                                className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
                              >
                                {isAboutExpanded ? "Show Less" : "Read More"}
                              </Button>
                            )}
                        </div>
                        {game.storyline && (
                          <div>
                            <h4 className="text-lg font-semibold mb-2">
                              Storyline
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                              {truncatedStoryline}
                            </p>
                            {game.storyline.length > storylineMaxLength && (
                              <Button
                                variant="link"
                                onClick={() =>
                                  setIsStorylineExpanded(!isStorylineExpanded)
                                }
                                className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
                              >
                                {isStorylineExpanded
                                  ? "Show Less"
                                  : "Read More"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
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
                            <h4 className="text-sm font-medium text-gray-400 mb-2">
                              Genres
                            </h4>
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
                            <h4 className="text-sm font-medium text-gray-400 mb-2">
                              Platforms
                            </h4>
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
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <div className="space-y-6">
                  {profile && renderProgress()}
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-400" />
                      Community Stats
                    </h3>
                    <CommunityStats gameId={game.id.toString()} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

              <TabsContent value="challenges" className="mt-0">
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <ChallengesSection game={game} />
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-400" />
                    Recent Activity
                  </h3>
                  {activitiesLoading && !activities.length ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <GameActivities gameId={game.id.toString()} />
                      {hasMore && (
                        <div className="text-center mt-6">
                          <Button
                            onClick={loadMore}
                            variant="outline"
                            disabled={activitiesLoading}
                          >
                            {activitiesLoading ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              "Load More"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
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

      {isStatusDialogOpen && game && (
        <StatusDialog
          isOpen={isStatusDialogOpen}
          setIsOpen={setIsStatusDialogOpen}
          game={game}
          onStatusChange={setCurrentStatus}
        />
      )}

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a comment about your experience with {game.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your thoughts about this game..."
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCommentDialog(false);
                setComment("");
                setSelectedStatus(null);
              }}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCommentSubmit}
              disabled={isUpdating}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              {isUpdating ? "Saving..." : "Save Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
