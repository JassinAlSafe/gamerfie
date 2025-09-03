"use client";

import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

// Store and hooks
import { useGameListStore } from "@/stores/useGameListStore";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useToast } from "@/components/ui/use-toast";
import { useAuthDialog } from "@/components/auth/AuthDialog";

// Components
import { GameListHero } from "./GameListHero";
import { GameListControls } from "./GameListControls";
import { GameListGrid } from "./GameListGrid";
import { GameListComments } from "./GameListComments";
import { GameListSkeleton } from "./GameListSkeleton";

// Utils
import { createClient } from "@/utils/supabase/client";
import { 
  processCommentsData, 
  extractUniqueUserIds, 
  validateCommentInput,
  createShareHandler,
  createLikeHandler
} from "@/utils/game-list-details-utils";
import { DISPLAY_SETTINGS, ANIMATIONS } from "@/config/game-list-details-config";

// Types
import type { GameListDetailsProps, GameListDetailsState } from "@/types/game-list-details.types";
import type { GameList } from "@/types/gamelist/game-list";

export const GameListDetails = memo<GameListDetailsProps>(function GameListDetails({
  listId
}) {
  const { toast } = useToast();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const { currentList, isLoading, error, fetchListDetails } = useGameListStore();
  const { profile } = useProfile();

  // Component state
  const [state, setState] = useState<GameListDetailsState>({
    comments: [],
    newComment: "",
    isSubmitting: false,
    isLiked: false,
    likeCount: DISPLAY_SETTINGS.DEFAULT_LIKE_COUNT
  });

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("author_rank");

  // Track initial loading state
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("list_comments")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      if (commentsData) {
        const userIds = extractUniqueUserIds(commentsData);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        const processedComments = processCommentsData(commentsData, profilesData || []);
        setState(prev => ({ ...prev, comments: processedComments }));
      }
    } catch (e) {
      console.error('Error fetching comments', e);
    }
  }, [listId]);

  // Handle comment submission
  const handleCommentSubmit = useCallback(async () => {
    if (!profile || !validateCommentInput(state.newComment, profile)) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    const supabase = createClient();

    try {
      const { error } = await supabase.from("list_comments").insert({
        list_id: listId,
        content: state.newComment,
        user_id: profile.id,
      });

      if (error) throw error;

      setState(prev => ({ ...prev, newComment: "" }));
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.newComment, profile, listId, fetchComments]);

  // Handle like button
  const handleLike = useMemo(() => 
    createLikeHandler(
      state.isLiked,
      (liked) => setState(prev => ({ ...prev, isLiked: liked })),
      (updater) => setState(prev => ({ ...prev, likeCount: updater(prev.likeCount) }))
    ),
    [state.isLiked]
  );

  // Handle share button
  const handleShare = useMemo(() => 
    currentList ? createShareHandler(
      currentList,
      (message) => toast({
        title: message,
        description: 'Share this list with your friends!',
      })
    ) : () => {},
    [currentList, toast]
  );

  // Handle auth prompt
  const handleAuthPrompt = useCallback(() => {
    openDialog({
      defaultTab: "signin",
      actionContext: "to leave a comment"
    });
  }, [openDialog]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setHasAttemptedLoad(false);
        await fetchListDetails(listId);
        await fetchComments();
      } finally {
        setHasAttemptedLoad(true);
      }
    };
    loadData();
  }, [listId, fetchListDetails, fetchComments]);

  // Loading state
  if (isLoading || !hasAttemptedLoad) {
    return <GameListSkeleton />;
  }

  // Error state
  if (hasAttemptedLoad && (error || !currentList)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Something went wrong: {error || 'List not found'}</p>
      </div>
    );
  }

  // Safety check
  if (!currentList) {
    return <GameListSkeleton />;
  }

  const list = currentList as GameList;

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }}
    >
      <motion.div {...ANIMATIONS.FADE_IN}>
        <GameListHero
          list={list}
          isLiked={state.isLiked}
          likeCount={state.likeCount}
          onLike={handleLike}
          onShare={handleShare}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <GameListControls
          searchTerm={searchTerm}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
        />
        <GameListGrid 
          games={list.games} 
          searchTerm={searchTerm}
          sortBy={sortBy}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <GameListComments
          comments={state.comments}
          newComment={state.newComment}
          isSubmitting={state.isSubmitting}
          profile={profile}
          onCommentChange={(value) => setState(prev => ({ ...prev, newComment: value }))}
          onCommentSubmit={handleCommentSubmit}
          onAuthPrompt={handleAuthPrompt}
        />
      </motion.div>

      <AuthDialog />
    </motion.div>
  );
});

export default GameListDetails;