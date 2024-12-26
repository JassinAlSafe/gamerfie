"use client";

import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Star,
  ExternalLink,
  Calendar,
  PlayCircle,
  BookmarkPlus,
  Ban,
  Trophy,
  Target,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game, GameStatus } from "@/types/game";
import { useProfile } from "@/hooks/use-profile";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";
import { formatRating } from "@/utils/game-utils";
import { CompletionDialog } from "@/components/game/completion-dialog";
import { AchievementsSection } from "@/components/game/achievements-section";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { StatusDialog } from "@/components/game/status-dialog";
import { GameStats } from "@/components/game/game-stats";
import { CommunityStats } from "@/components/game/community-stats";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { DetailedGameStats } from "@/components/game/detailed-game-stats";
import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

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
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<GameStatus | null>(null);

  const websiteUrl = useMemo(() => getWebsiteUrl(game), [game]);
  const backgroundImage = useMemo(() => getBackgroundImage(game), [game]);

  const { profile } = useProfile();
  const router = useRouter();
  const {
    progress,
    progressLoading,
    progressError,
    fetchProgress,
    updateGameStatus,
  } = useGameDetailsStore();

  const { userChallenges, fetchUserChallenges } = useChallengesStore();

  // Get game progress
  const gameProgress = useMemo(() => {
    if (!profile?.id) return null;
    const key = `${profile.id}-${game.id}`;
    return progress[key];
  }, [profile?.id, game.id, progress]);

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  useEffect(() => {
    if (profile?.id) {
      fetchUserChallenges();
    }
  }, [profile?.id, fetchUserChallenges]);

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
    if (!profile?.id || !selectedStatus) return;

    setIsUpdating(true);
    try {
      await updateGameStatus(
        profile.id.toString(),
        game.id.toString(),
        selectedStatus,
        undefined,
        comment.trim()
      );
      setShowCommentDialog(false);
      setComment("");
      setSelectedStatus(null);
    } catch (error) {
      console.error("Error updating game status:", error);
    } finally {
      setIsUpdating(false);
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

  const handleUpdateProgress = async (data: any) => {
    setIsUpdating(true);
    try {
      // Handle progress update logic here
      toast.success("Progress updated successfully");
      setIsCompletionDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (status: GameStatus) => {
    if (!profile?.id) {
      toast.error("Please sign in to update game status");
      return;
    }

    console.log("Starting status update in GameDetails:", {
      profileId: profile.id,
      gameId: game.id,
      status,
    });
    toast.loading("Updating game status...");

    setIsUpdating(true);
    try {
      await updateGameStatus(profile.id.toString(), game.id.toString(), status);
      setCurrentStatus(status);
      toast.dismiss();
      toast.success("Game status updated successfully");
      console.log("Status update completed in GameDetails");
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.dismiss();
      toast.error("Failed to update game status");
    } finally {
      setIsUpdating(false);
      setIsStatusDialogOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      {backgroundImage && (
        <motion.div
          className="fixed inset-0 z-0"
          style={{
            opacity,
            backgroundImage: `linear-gradient(to bottom, 
              rgba(0, 0, 0, 0.4) 0%, 
              rgba(0, 0, 0, 0.6) 25%,
              rgba(0, 0, 0, 0.8) 50%,
              rgba(0, 0, 0, 0.95) 75%,
              rgb(0, 0, 0) 100%
            ), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            scale,
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Back Button */}
          <div className="mb-8">
            <BackButton />
          </div>

          {/* Game Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Cover Image */}
            <div className="w-full lg:w-[300px] flex-shrink-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image
                  src={getCoverImageUrl(game.cover?.url || "")}
                  alt={game.name}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              </div>
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-white mb-4">
                {game.name}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {game.first_release_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {formatDate(game.first_release_date)}
                    </span>
                  </div>
                )}
                {game.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">
                      {formatRating(game.rating)}
                    </span>
                  </div>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Official Website</span>
                  </a>
                )}
              </div>

              {/* Game Description */}
              <p className="text-gray-300 mb-6 line-clamp-3">{game.summary}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                {!profile ? (
                  <Button
                    onClick={() => router.push("/signin")}
                    variant="outline"
                    size="lg"
                    className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
                  >
                    Sign in to add to library
                  </Button>
                ) : gameProgress?.status ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setIsStatusDialogOpen(true)}
                      variant="outline"
                      size="lg"
                      className="py-6 min-w-[200px] hover:scale-105 transition-all duration-300"
                    >
                      {gameProgress.status === "playing" && (
                        <>
                          <PlayCircle className="w-5 h-5 mr-2 text-blue-400" />
                          Currently Playing
                        </>
                      )}
                      {gameProgress.status === "completed" && (
                        <>
                          <Trophy className="w-5 h-5 mr-2 text-green-400" />
                          Completed
                        </>
                      )}
                      {gameProgress.status === "want_to_play" && (
                        <>
                          <BookmarkPlus className="w-5 h-5 mr-2 text-purple-400" />
                          Want to Play
                        </>
                      )}
                      {gameProgress.status === "dropped" && (
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
                      className="py-6"
                    >
                      Update Progress
                    </Button>
                    <Button
                      onClick={() => setShowCommentDialog(true)}
                      variant="outline"
                      size="lg"
                      className="py-6"
                    >
                      Add Note
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="bg-gray-900/40 border border-white/5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* About Section */}
              {game.summary && (
                <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Book className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold">About</h2>
                  </div>
                  <p className="text-gray-300">{game.summary}</p>

                  {/* Storyline */}
                  {game.storyline && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Storyline</h3>
                      <p className="text-gray-300">{game.storyline}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Game Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Genres */}
                {game.genres && game.genres.length > 0 && (
                  <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                    <h3 className="text-lg font-medium mb-4">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {game.platforms && game.platforms.length > 0 && (
                  <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                    <h3 className="text-lg font-medium mb-4">Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <Badge key={platform.id} variant="secondary">
                          {platform.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Companies */}
                {game.involved_companies &&
                  game.involved_companies.length > 0 && (
                    <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                      <h3 className="text-lg font-medium mb-4">Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {game.involved_companies.map((company) => (
                          <Badge key={company.id} variant="secondary">
                            {company.company.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-8">
              {/* Screenshots */}
              {game.screenshots && game.screenshots.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Screenshots</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {game.screenshots.map((screenshot, index) => (
                      <div
                        key={screenshot.id}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleScreenshotClick(index)}
                      >
                        <Image
                          src={getHighQualityImageUrl(screenshot.url)}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Artworks */}
              {game.artworks && game.artworks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Artworks</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {game.artworks.map((artwork, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden"
                      >
                        <Image
                          src={getHighQualityImageUrl(artwork.url)}
                          alt={`Artwork ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-8">
              <AchievementsSection gameId={game.id.toString()} />
            </TabsContent>

            <TabsContent value="community" className="space-y-8">
              {/* Progress Section */}
              {gameProgress && (
                <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Progress</h2>
                  </div>
                  <DetailedGameStats
                    playTime={gameProgress.playTime ?? null}
                    completionPercentage={
                      gameProgress.completionPercentage ?? null
                    }
                    achievementsCompleted={
                      gameProgress.achievementsCompleted ?? 0
                    }
                    totalAchievements={game.achievements?.length || 0}
                    status={gameProgress.status || "want_to_play"}
                    lastPlayed={
                      gameProgress.lastPlayed
                        ? new Date(gameProgress.lastPlayed).getTime() / 1000
                        : undefined
                    }
                  />
                  {gameProgress.comment && (
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-300">
                        {gameProgress.comment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Community Stats Section */}
              <div className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                <h2 className="text-xl font-semibold mb-4">Community Stats</h2>
                <CommunityStats gameId={game.id.toString()} />
              </div>
            </TabsContent>
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
        isOpen={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
        onComplete={handleUpdateProgress}
        isLoading={isUpdating}
        totalAchievements={game.achievements?.length || 0}
      />

      {isStatusDialogOpen && game && (
        <StatusDialog
          isOpen={isStatusDialogOpen}
          setIsOpen={setIsStatusDialogOpen}
          game={game}
          onStatusChange={handleStatusUpdate}
        />
      )}

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note about your experience with this game.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCommentDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleCommentSubmit} disabled={isUpdating}>
              {isUpdating ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
